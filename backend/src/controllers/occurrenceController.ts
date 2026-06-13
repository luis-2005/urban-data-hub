import { Response } from 'express';
import { Occurrence, OccurrenceStatus } from '../models/Occurrence';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { Types } from 'mongoose';

const createOccurrenceSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  category: z.enum([
    'buraco_via',
    'iluminacao',
    'descarte_residuos',
    'calcada_danificada',
    'alagamento',
    'sinalizacao',
    'outros',
  ]),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  address: z.string().optional(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['aberta', 'em_andamento', 'resolvida', 'cancelada']),
  note: z.string().optional(),
});

const addCommentSchema = z.object({
  text: z.string().min(1, 'Comentário não pode ser vazio').max(1000),
});

const CATEGORY_LABELS: Record<string, string> = {
  buraco_via: 'Buraco na Via',
  iluminacao: 'Iluminação Pública',
  descarte_residuos: 'Descarte Irregular de Resíduos',
  calcada_danificada: 'Calçada Danificada',
  alagamento: 'Alagamento',
  sinalizacao: 'Sinalização',
  outros: 'Outros',
};

const STATUS_LABELS: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  resolvida: 'Resolvida',
  cancelada: 'Cancelada',
};

export async function listOccurrences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, neighborhood, status, search, dateFrom, dateTo, sort } = req.query;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (neighborhood) filter.neighborhood = { $regex: neighborhood, $options: 'i' };
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.createdAt = dateFilter;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'most_voted') sortOption = { voteCount: -1, createdAt: -1 };

    const occurrences = await Occurrence.aggregate([
      { $match: filter },
      { $addFields: { voteCount: { $size: { $ifNull: ['$votes', []] } } } },
      { $sort: sortOption },
    ]);

    res.json(occurrences);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar ocorrências', error });
  }
}

export async function getOccurrence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }
    res.json(occurrence);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ocorrência', error });
  }
}

export async function createOccurrence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = createOccurrenceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const occurrence = await Occurrence.create({
      ...parsed.data,
      imageUrl,
      createdBy: req.userId,
      status: 'aberta',
      statusHistory: [{ status: 'aberta', changedAt: new Date() }],
    });

    res.status(201).json(occurrence);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar ocorrência', error });
  }
}

export async function deleteOccurrence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }

    const isOwner = occurrence.createdBy?.toString() === req.userId;
    if (!isOwner && !req.isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para excluir esta ocorrência' });
      return;
    }

    await occurrence.deleteOne();
    res.json({ message: 'Ocorrência excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir ocorrência', error });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
      return;
    }

    const { status, note } = parsed.data;
    const historyEntry: { status: OccurrenceStatus; changedAt: Date; note?: string } = {
      status,
      changedAt: new Date(),
    };
    if (note) historyEntry.note = note;

    const occurrence = await Occurrence.findByIdAndUpdate(
      req.params.id,
      { status, $push: { statusHistory: historyEntry } },
      { new: true }
    );

    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }

    const doc = occurrence.toObject();
    res.json({ ...doc, votes: doc.votes ?? [], comments: doc.comments ?? [] });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status', error });
  }
}

export async function listMyOccurrences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const occurrences = await Occurrence.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar suas ocorrências', error });
  }
}

export async function getStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [byStatus, byCategory, byNeighborhood] = await Promise.all([
      Occurrence.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Occurrence.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Occurrence.aggregate([
        { $group: { _id: '$neighborhood', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const total = await Occurrence.countDocuments();
    res.json({ total, byStatus, byCategory, byNeighborhood });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error });
  }
}

export async function addComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = addCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten() });
      return;
    }

    const occurrence = await Occurrence.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            text: parsed.data.text,
            authorId: new Types.ObjectId(req.userId),
            authorName: req.userName ?? 'Usuário',
            isAdmin: req.isAdmin ?? false,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }

    const doc = occurrence.toObject();
    res.json({ ...doc, votes: doc.votes ?? [], comments: doc.comments ?? [] });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar comentário', error });
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }

    const comment = occurrence.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );
    if (!comment) {
      res.status(404).json({ message: 'Comentário não encontrado' });
      return;
    }

    const isAuthor = comment.authorId.toString() === req.userId;
    if (!isAuthor && !req.isAdmin) {
      res.status(403).json({ message: 'Sem permissão para excluir este comentário' });
      return;
    }

    await Occurrence.findByIdAndUpdate(req.params.id, {
      $pull: { comments: { _id: new Types.ObjectId(req.params.commentId) } },
    });

    res.json({ message: 'Comentário excluído' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir comentário', error });
  }
}

export async function toggleVote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      res.status(404).json({ message: 'Ocorrência não encontrada' });
      return;
    }

    const userId = new Types.ObjectId(req.userId);
    const hasVoted = occurrence.votes.some((v) => v.toString() === req.userId);

    const updated = await Occurrence.findByIdAndUpdate(
      req.params.id,
      hasVoted
        ? { $pull: { votes: userId } }
        : { $addToSet: { votes: userId } },
      { new: true }
    );

    res.json({ votes: updated?.votes.length ?? 0, hasVoted: !hasVoted });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao votar', error });
  }
}

export async function exportCSV(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, neighborhood, status, search, dateFrom, dateTo } = req.query;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (neighborhood) filter.neighborhood = { $regex: neighborhood, $options: 'i' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom as string);
      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.createdAt = dateFilter;
    }

    const occurrences = await Occurrence.find(filter).sort({ createdAt: -1 });

    const header = ['ID', 'Título', 'Categoria', 'Bairro', 'Endereço', 'Status', 'Votos', 'Comentários', 'Data de Criação'];
    const rows = occurrences.map((o) => [
      o._id.toString(),
      `"${o.title.replace(/"/g, '""')}"`,
      CATEGORY_LABELS[o.category] ?? o.category,
      `"${o.neighborhood.replace(/"/g, '""')}"`,
      `"${(o.address ?? '').replace(/"/g, '""')}"`,
      STATUS_LABELS[o.status] ?? o.status,
      o.votes.length,
      o.comments.length,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ocorrencias.csv"');
    res.send('﻿' + csv);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar', error });
  }
}
