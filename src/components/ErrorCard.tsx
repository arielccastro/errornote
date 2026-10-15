import { useState } from 'react';
import { ErrorEntry } from '../types';

interface ErrorCardProps {
  entry: ErrorEntry;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<ErrorEntry>) => void;
  onMarkConsolidated: (id: string) => void;
}

export default function ErrorCard({ entry, onDelete, onEdit, onMarkConsolidated }: ErrorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editData, setEditData] = useState({
    disciplina: entry.disciplina,
    assunto: entry.assunto,
    erro: entry.erro,
    conceitoCorreto: entry.conceitoCorreto,
    tags: entry.tags.join(', '),
  });

  const handleSaveEdit = () => {
    onEdit(entry.id, {
      disciplina: editData.disciplina.trim(),
      assunto: editData.assunto.trim(),
      erro: editData.erro.trim(),
      conceitoCorreto: editData.conceitoCorreto.trim(),
      tags: editData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(entry.id);
    } else {
      setShowConfirmDelete(true);
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(entry.dataCriacao).getTime()) / (1000 * 60 * 60 * 24)
  );

  const disciplinaColors: Record<string, string> = {
    'Direito Administrativo': 'bg-blue-100 text-blue-800 border-blue-200',
    'Direito Constitucional': 'bg-purple-100 text-purple-800 border-purple-200',
    'Direito Penal': 'bg-red-100 text-red-800 border-red-200',
    'Direito Civil': 'bg-green-100 text-green-800 border-green-200',
    'Português': 'bg-pink-100 text-pink-800 border-pink-200',
    'Raciocínio Lógico': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'AFO': 'bg-teal-100 text-teal-800 border-teal-200',
    'Controle Externo': 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const colorClass = disciplinaColors[entry.disciplina] || 'bg-gray-100 text-gray-800 border-gray-200';

  if (isEditing) {
    return (
      <div className={`bg-white rounded-xl shadow-md border-2 border-amber-300 p-5 space-y-3 ${entry.consolidado ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-600">✏️ Editando...</span>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={editData.disciplina}
            onChange={(e) => setEditData({ ...editData, disciplina: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            placeholder="Disciplina"
          />
          <input
            value={editData.assunto}
            onChange={(e) => setEditData({ ...editData, assunto: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            placeholder="Assunto"
          />
        </div>
        <textarea
          value={editData.erro}
          onChange={(e) => setEditData({ ...editData, erro: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 resize-none"
          rows={2}
          placeholder="O erro / pegadinha"
        />
        <textarea
          value={editData.conceitoCorreto}
          onChange={(e) => setEditData({ ...editData, conceitoCorreto: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 resize-none"
          rows={2}
          placeholder="Conceito correto"
        />
        <input
          value={editData.tags}
          onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
          placeholder="Tags (separadas por vírgula)"
        />
        <div className="flex gap-2">
          <button onClick={handleSaveEdit} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-colors">
            Salvar
          </button>
          <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 p-5 group ${entry.consolidado ? 'opacity-60 border-green-200 bg-green-50/30' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
            {entry.disciplina}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {entry.assunto}
          </span>
          {entry.consolidado && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              ✓ Consolidado
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onMarkConsolidated(entry.id)}
            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
            title={entry.consolidado ? 'Desmarcar consolidação' : 'Marcar como consolidado'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors ${showConfirmDelete ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
            title={showConfirmDelete ? 'Clique novamente para confirmar' : 'Podar (excluir)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1">
            <span>❌</span> O Erro / Pegadinha
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">{entry.erro}</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg p-3">
          <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
            <span>✅</span> Conceito Correto
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">{entry.conceitoCorreto}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span title="Revisões">🔄 {entry.revisoes}x</span>
          <span title="Dias desde criação">{daysSinceCreation}d</span>
        </div>
      </div>
    </div>
  );
}
