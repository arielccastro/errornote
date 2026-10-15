import { useState } from 'react';
import { ErrorEntry } from '../types';

interface ErrorFormProps {
  onAdd: (entry: Omit<ErrorEntry, 'id' | 'dataCriacao' | 'revisoes' | 'consolidado'>) => void;
  existingDisciplines: string[];
}

export default function ErrorForm({ onAdd, existingDisciplines }: ErrorFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [disciplina, setDisciplina] = useState('');
  const [assunto, setAssunto] = useState('');
  const [erro, setErro] = useState('');
  const [conceitoCorreto, setConceitoCorreto] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplina.trim() || !assunto.trim() || !erro.trim() || !conceitoCorreto.trim()) return;

    onAdd({
      disciplina: disciplina.trim(),
      assunto: assunto.trim(),
      erro: erro.trim(),
      conceitoCorreto: conceitoCorreto.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
    });

    setDisciplina('');
    setAssunto('');
    setErro('');
    setConceitoCorreto('');
    setTags('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Registrar Novo Erro
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">✏️</span> Novo Registro
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Disciplina *</label>
          {existingDisciplines.length > 0 ? (
            <div className="relative">
              <input
                type="text"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                list="disciplinas"
                placeholder="Ex: Direito Administrativo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                required
              />
              <datalist id="disciplinas">
                {existingDisciplines.map(d => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          ) : (
            <input
              type="text"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              placeholder="Ex: Direito Administrativo"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              required
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Assunto *</label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Ex: Licitações (Lei 14.133/21)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          O Meu Erro / A Pegadinha da Banca *
        </label>
        <textarea
          value={erro}
          onChange={(e) => setErro(e.target.value)}
          placeholder="Seja telegráfico! Máx. 3 linhas. Ex: Achei que o diálogo competitivo era só para inovações tecnológicas."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          O Conceito Correto (Fundamentação) *
        </label>
        <textarea
          value={conceitoCorreto}
          onChange={(e) => setConceitoCorreto(e.target.value)}
          placeholder="Ex: ERRADO. Aplica-se também quando o órgão não consegue definir as especificações técnicas (Art. 32, I, 'c')."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Tags <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: pegadinha, chute, jurisprudência"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          💾 Salvar Registro
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
