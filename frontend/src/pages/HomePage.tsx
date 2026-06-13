import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FilterBar from '../components/FilterBar';
import OccurrenceCard from '../components/OccurrenceCard';
import type { Occurrence, OccurrenceFilters } from '../types/occurrence';
import { fetchOccurrences } from '../services/api';

function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-700/60 rounded w-full mb-2" />
      <div className="h-3 bg-gray-700/60 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-700/60 rounded-full w-20" />
        <div className="h-5 bg-gray-700/60 rounded-full w-16" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filters, setFilters] = useState<OccurrenceFilters>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOccurrences(filters);
      setOccurrences(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Ocorrências</h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'Carregando...' : `${occurrences.length} ocorrência(s) encontrada(s)`}
          </p>
        </div>
        {user && (
          <Link
            to="/registrar"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Ocorrência
          </Link>
        )}
      </div>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : occurrences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Nenhuma ocorrência encontrada</h3>
          <p className="text-sm text-gray-400 mb-6">
            Tente ajustar os filtros ou registre uma nova ocorrência.
          </p>
          {user && (
            <Link
              to="/registrar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Registrar Ocorrência
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {occurrences.map((occurrence) => (
            <OccurrenceCard key={occurrence._id} occurrence={occurrence} />
          ))}
        </div>
      )}
    </div>
  );
}
