import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Tag, Image as ImageIcon,
  Trash2, ThumbsUp, MessageSquare, Send, ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import type { Occurrence, OccurrenceStatus, Comment } from '../types/occurrence';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/occurrence';
import {
  fetchOccurrence,
  updateOccurrenceStatus,
  deleteOccurrence,
  addComment,
  deleteComment,
  toggleVote,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_OPTIONS: OccurrenceStatus[] = ['aberta', 'em_andamento', 'resolvida', 'cancelada'];

const inputClass =
  'w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OccurrenceStatus>('aberta');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);

  useEffect(() => {
    if (!id) return;
    void fetchOccurrence(id).then((data) => {
      setOccurrence(data);
      setNewStatus(data.status);
      setLoading(false);
    });
  }, [id]);

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !occurrence) return;
    setUpdating(true);
    try {
      const updated = await updateOccurrenceStatus(id, { status: newStatus, note: note || undefined });
      setOccurrence(updated);
      setNote('');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteOccurrence(id);
      navigate('/');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const updated = await addComment(id, commentText.trim());
      setOccurrence(updated);
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!id) return;
    await deleteComment(id, commentId);
    setOccurrence((prev) =>
      prev ? { ...prev, comments: prev.comments.filter((c) => c._id !== commentId) } : prev
    );
  }

  async function handleVote() {
    if (!id || !user) return;
    setVotingInProgress(true);
    try {
      const result = await toggleVote(id);
      setOccurrence((prev) => {
        if (!prev) return prev;
        const prevVotes = prev.votes ?? [];
        const newVotes = result.hasVoted
          ? [...prevVotes, user._id]
          : prevVotes.filter((v) => v !== user._id);
        return { ...prev, votes: newVotes };
      });
    } finally {
      setVotingInProgress(false);
    }
  }

  const isOwner = user && occurrence?.createdBy && occurrence.createdBy === user._id;
  const canDelete = isOwner || user?.isAdmin;
  const votes = occurrence?.votes ?? [];
  const comments = occurrence?.comments ?? [];
  const hasVoted = user && votes.includes(user._id);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-6" />
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <div className="h-8 bg-gray-700 rounded w-2/3" />
          <div className="h-4 bg-gray-700/60 rounded w-full" />
          <div className="h-4 bg-gray-700/60 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!occurrence) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Ocorrência não encontrada.</p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const createdAt = new Date(occurrence.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" />
          Voltar para ocorrências
        </Link>
        {canDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Excluir ocorrência
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full">
            <h2 className="font-semibold text-gray-100 mb-2">Excluir ocorrência?</h2>
            <p className="text-sm text-gray-400 mb-5">
              Esta ação não pode ser desfeita. A ocorrência será removida permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        {occurrence.imageUrl && (
          <div className="h-56 overflow-hidden">
            <img src={occurrence.imageUrl} alt={occurrence.title} className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-100 flex-1">{occurrence.title}</h1>
            <StatusBadge status={occurrence.status} />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">{occurrence.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>{CATEGORY_LABELS[occurrence.category]}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>{occurrence.neighborhood}{occurrence.address ? ` — ${occurrence.address}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{createdAt}</span>
            </div>
            {!occurrence.imageUrl && (
              <div className="flex items-center gap-2 text-gray-500">
                <ImageIcon className="w-4 h-4" />
                <span>Sem imagem</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleVote}
              disabled={!user || votingInProgress}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                hasVoted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              {hasVoted ? 'Confirmado' : 'Confirmar problema'}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${hasVoted ? 'bg-blue-500' : 'bg-gray-600'}`}>
                {votes.length}
              </span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              {comments.length} comentário(s)
            </span>
            {!user && (
              <span className="text-xs text-gray-500">
                <Link to="/login" className="text-blue-400 hover:underline">Entre</Link> para votar ou comentar
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-100 mb-4">Histórico de Status</h2>
        <div className="relative">
          {occurrence.statusHistory.map((entry, index) => (
            <div key={index} className="flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0 z-10" />
                {index < occurrence.statusHistory.length - 1 && (
                  <div className="w-px bg-gray-700 flex-1 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge status={entry.status} size="sm" />
                  <span className="text-xs text-gray-500">
                    {new Date(entry.changedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {entry.note && <p className="text-sm text-gray-400 mt-1">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-100 mb-5 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Comentários ({comments.length})
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-gray-500 mb-5">Nenhum comentário ainda. Seja o primeiro!</p>
        )}

        <div className="space-y-4 mb-6">
          {comments.map((comment: Comment) => {
            const canDeleteComment =
              user && (comment.authorId === user._id || user.isAdmin);
            return (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-300 uppercase">
                  {comment.authorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-200">{comment.authorName}</span>
                    {comment.isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Oficial
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${comment.isAdmin ? 'text-blue-200' : 'text-gray-300'}`}>
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-300 uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                maxLength={1000}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            <Link to="/login" className="text-blue-400 hover:underline">Entre</Link> para comentar.
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="font-semibold text-gray-100 mb-4">Atualizar Status</h2>
        {updateSuccess && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 rounded-lg px-4 py-2.5 mb-4 text-sm">
            Status atualizado com sucesso!
          </div>
        )}
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Novo Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OccurrenceStatus)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Observação <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Descreva o que foi feito ou o motivo da mudança..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={updating || newStatus === occurrence.status}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            {updating ? 'Salvando...' : 'Salvar Alteração'}
          </button>
        </form>
      </div>
    </div>
  );
}
