import { Link } from 'react-router-dom';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import type { Occurrence } from '../types/occurrence';
import { CATEGORY_LABELS } from '../types/occurrence';
import StatusBadge from './StatusBadge';

interface OccurrenceCardProps {
  occurrence: Occurrence;
  onDelete?: (id: string) => void;
}

export default function OccurrenceCard({ occurrence, onDelete }: OccurrenceCardProps) {
  const formattedDate = new Date(occurrence.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="relative bg-gray-800 rounded-xl shadow-md hover:shadow-lg hover:shadow-gray-900 transition-shadow duration-200 overflow-hidden border border-gray-700">
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(occurrence._id);
          }}
          title="Excluir ocorrência"
          className="absolute top-3 right-3 z-10 bg-gray-900/80 hover:bg-red-900/60 text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-700 rounded-lg p-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <Link to={`/ocorrencias/${occurrence._id}`} className="block">
        {occurrence.imageUrl && (
          <div className="h-40 overflow-hidden">
            <img
              src={occurrence.imageUrl}
              alt={occurrence.title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-100 text-sm leading-tight line-clamp-2 pr-6">
              {occurrence.title}
            </h3>
            <StatusBadge status={occurrence.status} size="sm" />
          </div>

          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{occurrence.description}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {occurrence.neighborhood}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-block bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-800">
              {CATEGORY_LABELS[occurrence.category]}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
