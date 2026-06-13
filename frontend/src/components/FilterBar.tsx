import { Search, X } from 'lucide-react';
import type { OccurrenceFilters, OccurrenceCategory, OccurrenceStatus, SortOption, DateRangeOption } from '../types/occurrence';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/occurrence';

interface FilterBarProps {
  filters: OccurrenceFilters;
  onChange: (filters: OccurrenceFilters) => void;
}

const categories = Object.keys(CATEGORY_LABELS) as OccurrenceCategory[];
const statuses = Object.keys(STATUS_LABELS) as OccurrenceStatus[];

const DATE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: '', label: 'Qualquer data' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Último mês' },
  { value: '365d', label: 'Último ano' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'most_voted', label: 'Mais votadas' },
];

const inputClass =
  'px-3 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500';

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  function handleChange(key: keyof OccurrenceFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({});
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.category ||
    !!filters.status ||
    !!filters.neighborhood ||
    !!filters.dateRange ||
    (!!filters.sort && filters.sort !== 'recent');

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={filters.search ?? ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className={`w-full pl-9 pr-3 ${inputClass}`}
          />
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filtrar por bairro..."
            value={filters.neighborhood ?? ''}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            className={`w-full pl-9 pr-3 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.category ?? ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className={inputClass}
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className={inputClass}
        >
          <option value="">Todos os status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.dateRange ?? ''}
          onChange={(e) => handleChange('dateRange', e.target.value)}
          className={inputClass}
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sort ?? 'recent'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className={inputClass}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
