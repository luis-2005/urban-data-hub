import type { OccurrenceStatus } from '../types/occurrence';
import { STATUS_LABELS } from '../types/occurrence';

interface StatusBadgeProps {
  status: OccurrenceStatus;
  size?: 'sm' | 'md';
}

const STATUS_CLASSES: Record<OccurrenceStatus, string> = {
  aberta: 'bg-red-900/50 text-red-300 border-red-700',
  em_andamento: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  resolvida: 'bg-green-900/50 text-green-300 border-green-700',
  cancelada: 'bg-gray-700 text-gray-400 border-gray-600',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${sizeClass} ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
