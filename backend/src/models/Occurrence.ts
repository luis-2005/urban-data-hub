import mongoose, { Schema, Document, Types } from 'mongoose';

export type OccurrenceStatus = 'aberta' | 'em_andamento' | 'resolvida' | 'cancelada';
export type OccurrenceCategory =
  | 'buraco_via'
  | 'iluminacao'
  | 'descarte_residuos'
  | 'calcada_danificada'
  | 'alagamento'
  | 'sinalizacao'
  | 'outros';

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  authorId: Types.ObjectId;
  authorName: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface IOccurrence extends Document {
  title: string;
  description: string;
  category: OccurrenceCategory;
  neighborhood: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  createdBy?: Types.ObjectId;
  status: OccurrenceStatus;
  statusHistory: Array<{
    status: OccurrenceStatus;
    changedAt: Date;
    note?: string;
  }>;
  comments: IComment[];
  votes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['aberta', 'em_andamento', 'resolvida', 'cancelada'],
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    text: { type: String, required: true, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const OccurrenceSchema = new Schema<IOccurrence>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'buraco_via',
        'iluminacao',
        'descarte_residuos',
        'calcada_danificada',
        'alagamento',
        'sinalizacao',
        'outros',
      ],
      required: true,
    },
    neighborhood: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    imageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['aberta', 'em_andamento', 'resolvida', 'cancelada'],
      default: 'aberta',
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    comments: { type: [CommentSchema], default: [] },
    votes: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true }
);

OccurrenceSchema.index({ title: 'text', description: 'text' });

export const Occurrence = mongoose.model<IOccurrence>('Occurrence', OccurrenceSchema);
