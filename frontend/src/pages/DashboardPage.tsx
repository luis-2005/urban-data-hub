import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardStats from '../components/DashboardStats';
import type { Stats } from '../types/occurrence';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types/occurrence';
import { fetchStats, buildExportUrl } from '../services/api';
import { Download, Printer } from 'lucide-react';

const PIE_COLORS = ['#ef4444', '#eab308', '#22c55e', '#6b7280'];

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#f3f4f6',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStats().then((data) => { setStats(data); setLoading(false); });
  }, []);

  function handleExportCSV() {
    const url = buildExportUrl();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ocorrencias.csv';
    link.click();
  }

  function handleExportPDF() {
    window.print();
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-xl border border-gray-700" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-800 rounded-xl border border-gray-700" />
          <div className="h-72 bg-gray-800 rounded-xl border border-gray-700" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const barData = stats.byCategory.map((item) => ({
    name: CATEGORY_LABELS[item._id as keyof typeof CATEGORY_LABELS] ?? item._id,
    total: item.count,
  }));

  const pieData = stats.byStatus.map((item) => ({
    name: STATUS_LABELS[item._id as keyof typeof STATUS_LABELS] ?? item._id,
    value: item.count,
  }));

  return (
    <>
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-page { background: white !important; color: black !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 print-page">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Painel de acompanhamento das ocorrências urbanas</p>
          </div>
          <div className="flex gap-2 no-print">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-600"
            >
              <Printer className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="font-semibold text-gray-100 mb-4 text-sm">Ocorrências por Categoria</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="font-semibold text-gray-100 mb-4 text-sm">Distribuição por Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="font-semibold text-gray-100 mb-4 text-sm">Top 5 Bairros com Mais Ocorrências</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3 font-semibold text-gray-400">#</th>
                  <th className="pb-3 font-semibold text-gray-400">Bairro</th>
                  <th className="pb-3 font-semibold text-gray-400 text-right">Ocorrências</th>
                </tr>
              </thead>
              <tbody>
                {stats.byNeighborhood.map((item, index) => (
                  <tr key={item._id} className="border-b border-gray-700/50 last:border-0">
                    <td className="py-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="py-3 text-gray-200">{item._id}</td>
                    <td className="py-3 text-right">
                      <span className="bg-blue-900/50 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-800">
                        {item.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
