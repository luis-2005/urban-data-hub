import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import type { OccurrenceCategory } from '../types/occurrence';
import { CATEGORY_LABELS } from '../types/occurrence';

interface FormData {
  title: string;
  description: string;
  category: OccurrenceCategory | '';
  neighborhood: string;
  address: string;
  image: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  neighborhood?: string;
}

interface OccurrenceFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: OccurrenceCategory;
    neighborhood: string;
    address?: string;
    image?: File;
  }) => Promise<void>;
  loading: boolean;
}

const categories = Object.keys(CATEGORY_LABELS) as OccurrenceCategory[];

const inputClass =
  'w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500';

const inputErrorClass =
  'w-full px-3 py-2 bg-gray-700 border border-red-600 text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-500';

export default function OccurrenceForm({ onSubmit, loading }: OccurrenceFormProps) {
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    neighborhood: '',
    address: '',
    image: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (form.title.trim().length < 3) newErrors.title = 'Título deve ter ao menos 3 caracteres';
    if (form.description.trim().length < 10)
      newErrors.description = 'Descrição deve ter ao menos 10 caracteres';
    if (!form.category) newErrors.category = 'Selecione uma categoria';
    if (form.neighborhood.trim().length < 2) newErrors.neighborhood = 'Bairro é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: form.title,
      description: form.description,
      category: form.category as OccurrenceCategory,
      neighborhood: form.neighborhood,
      address: form.address || undefined,
      image: form.image ?? undefined,
    });
  }

  function field(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => field('title', e.target.value)}
          placeholder="Ex: Buraco profundo na Rua das Flores"
          className={errors.title ? inputErrorClass : inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Descrição <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => field('description', e.target.value)}
          placeholder="Descreva o problema com detalhes..."
          rows={4}
          className={`${errors.description ? inputErrorClass : inputClass} resize-none`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Categoria <span className="text-red-400">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
            className={errors.category ? inputErrorClass : inputClass}
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bairro <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.neighborhood}
            onChange={(e) => field('neighborhood', e.target.value)}
            placeholder="Ex: Centro"
            className={errors.neighborhood ? inputErrorClass : inputClass}
          />
          {errors.neighborhood && (
            <p className="mt-1 text-xs text-red-400">{errors.neighborhood}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Endereço <span className="text-gray-500 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => field('address', e.target.value)}
          placeholder="Ex: Rua das Flores, 123"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Imagem <span className="text-gray-500 font-normal">(opcional)</span>
        </label>
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="h-40 rounded-lg object-cover border border-gray-600" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-900/10 transition-colors">
            <Upload className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-sm text-gray-400">Clique para enviar uma imagem</span>
            <span className="text-xs text-gray-500 mt-1">JPG, PNG ou WebP até 5MB</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImage}
            />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Registrando...' : 'Registrar Ocorrência'}
      </button>
    </form>
  );
}
