import { AlertCircle, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { Stats } from '../types/occurrence';

interface DashboardStatsProps {
  stats: Stats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  function countByStatus(status: string): number {
    return stats.byStatus.find((s) => s._id === status)?.count ?? 0;
  }

  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-900/50 text-blue-400',
      border: 'border-blue-800',
    },
    {
      label: 'Abertas',
      value: countByStatus('aberta'),
      icon: AlertCircle,
      color: 'bg-red-900/50 text-red-400',
      border: 'border-red-800',
    },
    {
      label: 'Em Andamento',
      value: countByStatus('em_andamento'),
      icon: Clock,
      color: 'bg-yellow-900/50 text-yellow-400',
      border: 'border-yellow-800',
    },
    {
      label: 'Resolvidas',
      value: countByStatus('resolvida'),
      icon: CheckCircle,
      color: 'bg-green-900/50 text-green-400',
      border: 'border-green-800',
    },
    {
      label: 'Canceladas',
      value: countByStatus('cancelada'),
      icon: XCircle,
      color: 'bg-gray-700 text-gray-400',
      border: 'border-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, color, border }) => (
        <div
          key={label}
          className={`bg-gray-800 rounded-xl border ${border} p-4 flex flex-col items-center gap-2`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-100">{value}</span>
          <span className="text-xs text-gray-400 text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}
