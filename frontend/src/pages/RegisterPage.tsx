import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import OccurrenceForm from '../components/OccurrenceForm';
import { createOccurrence } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { OccurrenceCategory } from '../types/occurrence';

type FeedbackState = 'success' | 'error' | null;

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/registrar' } });
  }, [user, navigate]);

  async function handleSubmit(data: {
    title: string;
    description: string;
    category: OccurrenceCategory;
    neighborhood: string;
    address?: string;
    image?: File;
  }) {
    setLoading(true);
    setFeedback(null);
    try {
      await createOccurrence(data);
      setFeedback('success');
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setFeedback('error');
      setErrorMessage('Ocorreu um erro ao registrar a ocorrência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Registrar Ocorrência</h1>
        <p className="text-sm text-gray-400 mt-1">
          Preencha os dados abaixo para registrar um problema urbano.
        </p>
      </div>

      {feedback === 'success' && (
        <div className="flex items-center gap-3 bg-green-900/40 border border-green-700 text-green-300 rounded-lg px-4 py-3 mb-6 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Ocorrência registrada com sucesso! Redirecionando...
        </div>
      )}

      {feedback === 'error' && (
        <div className="flex items-center gap-3 bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <OccurrenceForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
