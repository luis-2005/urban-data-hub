import axios from 'axios';
import type {
  Occurrence,
  OccurrenceFilters,
  CreateOccurrenceData,
  UpdateStatusData,
  Stats,
} from '../types/occurrence';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function dateRangeToParams(dateRange?: string): { dateFrom?: string; dateTo?: string } {
  if (!dateRange) return {};
  const now = new Date();
  const from = new Date();
  if (dateRange === '7d') from.setDate(now.getDate() - 7);
  else if (dateRange === '30d') from.setDate(now.getDate() - 30);
  else if (dateRange === '365d') from.setFullYear(now.getFullYear() - 1);
  else return {};
  return {
    dateFrom: from.toISOString().split('T')[0],
    dateTo: now.toISOString().split('T')[0],
  };
}

export async function fetchOccurrences(filters?: OccurrenceFilters): Promise<Occurrence[]> {
  const params: Record<string, string> = {};
  if (filters?.category) params.category = filters.category;
  if (filters?.neighborhood) params.neighborhood = filters.neighborhood;
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;
  if (filters?.sort) params.sort = filters.sort;
  const dateParams = dateRangeToParams(filters?.dateRange);
  if (dateParams.dateFrom) params.dateFrom = dateParams.dateFrom;
  if (dateParams.dateTo) params.dateTo = dateParams.dateTo;

  const { data } = await api.get<Occurrence[]>('/occurrences', { params });
  return data;
}

export async function fetchOccurrence(id: string): Promise<Occurrence> {
  const { data } = await api.get<Occurrence>(`/occurrences/${id}`);
  return data;
}

export async function createOccurrence(formData: CreateOccurrenceData): Promise<Occurrence> {
  const fd = new FormData();
  fd.append('title', formData.title);
  fd.append('description', formData.description);
  fd.append('category', formData.category);
  fd.append('neighborhood', formData.neighborhood);
  if (formData.address) fd.append('address', formData.address);
  if (formData.image) fd.append('image', formData.image);

  const { data } = await api.post<Occurrence>('/occurrences', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateOccurrenceStatus(
  id: string,
  payload: UpdateStatusData
): Promise<Occurrence> {
  const { data } = await api.patch<Occurrence>(`/occurrences/${id}/status`, payload);
  return data;
}

export async function fetchStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/occurrences/stats');
  return data;
}

export async function deleteOccurrence(id: string): Promise<void> {
  await api.delete(`/occurrences/${id}`);
}

export async function fetchMyOccurrences(): Promise<Occurrence[]> {
  const { data } = await api.get<Occurrence[]>('/occurrences/my');
  return data;
}

export async function addComment(id: string, text: string): Promise<Occurrence> {
  const { data } = await api.post<Occurrence>(`/occurrences/${id}/comments`, { text });
  return data;
}

export async function deleteComment(id: string, commentId: string): Promise<void> {
  await api.delete(`/occurrences/${id}/comments/${commentId}`);
}

export async function toggleVote(id: string): Promise<{ votes: number; hasVoted: boolean }> {
  const { data } = await api.post<{ votes: number; hasVoted: boolean }>(`/occurrences/${id}/vote`);
  return data;
}

export function buildExportUrl(filters?: OccurrenceFilters): string {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.neighborhood) params.set('neighborhood', filters.neighborhood);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const dateParams = dateRangeToParams(filters?.dateRange);
  if (dateParams.dateFrom) params.set('dateFrom', dateParams.dateFrom);
  if (dateParams.dateTo) params.set('dateTo', dateParams.dateTo);
  const qs = params.toString();
  return `${BASE_URL}/occurrences/export${qs ? `?${qs}` : ''}`;
}
