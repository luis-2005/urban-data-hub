import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, AlertCircle } from 'lucide-react';
import OccurrenceCard from '../components/OccurrenceCard';
import type { Occurrence } from '../types/occurrence';
import { fetchMyOccurrences, fetchOccurrences, deleteOccurrence } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

export default function MyOccurrencesPage() {
  const { user } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = user?.isAdmin ? await fetchOccurrences() : await fetchMyOccurrences();
      setOccurrences(data);
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin]);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteOccurrence(pendingDelete);
      setOccurrences((prev) => prev.filter((o) => o._id !== pendingDelete));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full">
            <h2 className="font-semibold text-gray-100 mb-2">Excluir ocorrência?</h2>
            <p className="text-sm text-gray-400 mb-5">
              Esta ação não pode ser desfeita. A ocorrência será removida permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
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

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-900/50 border border-blue-800 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-100">{user?.name}</h1>
                {user?.isAdmin && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/registrar"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nova Ocorrência
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">
          {user?.isAdmin ? 'Todas as Ocorrências' : 'Minhas Ocorrências'}
        </h2>
        {!loading && (
          <span className="text-sm text-gray-400">
            {occurrences.length} ocorrência{occurrences.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : occurrences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-800 rounded-xl border border-gray-700">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            {user?.isAdmin
              ? 'Nenhuma ocorrência registrada no sistema'
              : 'Você ainda não registrou nenhuma ocorrência'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">Reporte problemas urbanos da sua cidade.</p>
          <Link
            to="/registrar"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Ocorrência
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {occurrences.map((occurrence) => (
            <OccurrenceCard
              key={occurrence._id}
              occurrence={occurrence}
              onDelete={(id) => setPendingDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
