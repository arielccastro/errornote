import { ErrorEntry } from '../types';

interface StatsProps {
  entries: ErrorEntry[];
}

export default function Stats({ entries }: StatsProps) {
  const total = entries.length;
  const consolidados = entries.filter(e => e.consolidado).length;
  const ativos = total - consolidados;
  
  const disciplinas = [...new Set(entries.map(e => e.disciplina))];
  const topDisciplina = disciplinas.reduce((acc, d) => {
    const count = entries.filter(e => e.disciplina === d).length;
    return count > (acc.count || 0) ? { name: d, count } : acc;
  }, { name: '', count: 0 });

  const totalRevisoes = entries.reduce((acc, e) => acc + e.revisoes, 0);

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-2xl font-bold text-gray-800">{total}</p>
        <p className="text-xs text-gray-500 font-medium">Total de Erros</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-2xl font-bold text-orange-600">{ativos}</p>
        <p className="text-xs text-gray-500 font-medium">Em Revisão</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-2xl font-bold text-green-600">{consolidados}</p>
        <p className="text-xs text-gray-500 font-medium">Consolidados</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-2xl font-bold text-blue-600">{totalRevisoes}</p>
        <p className="text-xs text-gray-500 font-medium">Total Revisões</p>
      </div>
      {topDisciplina.name && (
        <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border border-amber-100">
          <p className="text-sm text-gray-600">
            📚 Disciplina com mais erros: <span className="font-bold text-amber-700">{topDisciplina.name}</span> ({topDisciplina.count} registros)
          </p>
        </div>
      )}
    </div>
  );
}
