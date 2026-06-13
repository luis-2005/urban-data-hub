export type OccurrenceStatus = 'aberta' | 'em_andamento' | 'resolvida' | 'cancelada';
export type OccurrenceCategory =
  | 'buraco_via'
  | 'iluminacao'
  | 'descarte_residuos'
  | 'calcada_danificada'
  | 'alagamento'
  | 'sinalizacao'
  | 'outros';

export type SortOption = 'recent' | 'oldest' | 'most_voted';
export type DateRangeOption = '' | '7d' | '30d' | '365d';

export interface StatusHistory {
  status: OccurrenceStatus;
  changedAt: string;
  note?: string;
}

export interface Comment {
  _id: string;
  text: string;
  authorId: string;
  authorName: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Occurrence {
  _id: string;
  title: string;
  description: string;
  category: OccurrenceCategory;
  neighborhood: string;
  address?: string;
  location?: { lat: number; lng: number };
  imageUrl?: string;
  createdBy?: string;
  status: OccurrenceStatus;
  statusHistory: StatusHistory[];
  comments: Comment[];
  votes: string[];
  voteCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OccurrenceFilters {
  category?: OccurrenceCategory | '';
  neighborhood?: string;
  status?: OccurrenceStatus | '';
  search?: string;
  dateRange?: DateRangeOption;
  sort?: SortOption;
}

export interface CreateOccurrenceData {
  title: string;
  description: string;
  category: OccurrenceCategory;
  neighborhood: string;
  address?: string;
  image?: File;
}

export interface UpdateStatusData {
  status: OccurrenceStatus;
  note?: string;
}

export interface Stats {
  total: number;
  byStatus: Array<{ _id: OccurrenceStatus; count: number }>;
  byCategory: Array<{ _id: OccurrenceCategory; count: number }>;
  byNeighborhood: Array<{ _id: string; count: number }>;
}

export const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  buraco_via: 'Buraco na Via',
  iluminacao: 'Iluminação Pública',
  descarte_residuos: 'Descarte Irregular de Resíduos',
  calcada_danificada: 'Calçada Danificada',
  alagamento: 'Alagamento',
  sinalizacao: 'Sinalização',
  outros: 'Outros',
};

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  resolvida: 'Resolvida',
  cancelada: 'Cancelada',
};
