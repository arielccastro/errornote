import { useState, useMemo, useCallback } from 'react';
import { ErrorEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ErrorForm from './components/ErrorForm';
import ErrorCard from './components/ErrorCard';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';

export default function App() {
  const [entries, setEntries] = useLocalStorage<ErrorEntry[]>('caderno-erros', []);
  const [search, setSearch] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('');
  const [filterConsolidado, setFilterConsolidado] = useState<'all' | 'active' | 'consolidated'>('all');
  const [showTips, setShowTips] = useState(false);

  const disciplinas = useMemo(() => {
    return [...new Set(entries.map(e => e.disciplina))].sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Filter by search
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(e =>
        e.disciplina.toLowerCase().includes(term) ||
        e.assunto.toLowerCase().includes(term) ||
        e.erro.toLowerCase().includes(term) ||
        e.conceitoCorreto.toLowerCase().includes(term) ||
        e.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    // Filter by disciplina
    if (filterDisciplina) {
      result = result.filter(e => e.disciplina === filterDisciplina);
    }

    // Filter by consolidated status
    if (filterConsolidado === 'active') {
      result = result.filter(e => !e.consolidado);
    } else if (filterConsolidado === 'consolidated') {
      result = result.filter(e => e.consolidado);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());

    return result;
  }, [entries, search, filterDisciplina, filterConsolidado]);

  const handleAdd = useCallback((data: Omit<ErrorEntry, 'id' | 'dataCriacao' | 'revisoes' | 'consolidado'>) => {
    const newEntry: ErrorEntry = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      dataCriacao: new Date().toISOString(),
      revisoes: 0,
      consolidado: false,
    };
    setEntries(prev => [newEntry, ...prev]);
  }, [setEntries]);

  const handleDelete = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [setEntries]);

  const handleEdit = useCallback((id: string, updates: Partial<ErrorEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [setEntries]);

  const handleMarkConsolidated = useCallback((id: string) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, consolidado: !e.consolidado, dataRevisao: new Date().toISOString() } : e
    ));
  }, [setEntries]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caderno-erros-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as ErrorEntry[];
          if (Array.isArray(imported)) {
            setEntries(imported);
          }
        } catch {
          alert('Arquivo inválido. Certifique-se de que é um JSON exportado do Caderno de Erros.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setEntries]);

  const handleIncrementRevision = useCallback((id: string) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, revisoes: e.revisoes + 1, dataRevisao: new Date().toISOString() } : e
    ));
  }, [setEntries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">📕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Caderno de Erros</h1>
                <p className="text-xs text-gray-500">Revisão cirúrgica para concursos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTips(!showTips)}
                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Dicas de uso"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Exportar dados"
                disabled={entries.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={handleImport}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Importar dados"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tips Panel */}
      {showTips && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-amber-800 flex items-center gap-2">
                <span>💡</span> Regras de Ouro do Caderno de Erros
              </h3>
              <button onClick={() => setShowTips(false)} className="text-amber-400 hover:text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong>Seja telegráfico:</strong> Se a anotação passar de 3 linhas, virou resumo teórico. Mantenha curto!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong>Anote os "chutes":</strong> Se acertou por eliminação ou insegurança, trate como erro.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong>Podar é essencial:</strong> Quando um conceito já está consolidado, marque como consolidado ou exclua. O material deve diminuir com o tempo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong>Revisão semanal:</strong> Estabeleça um dia fixo para ler as entradas da semana.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span><strong>Véspera de prova:</strong> O caderno será seu principal material de leitura na semana que antecede a prova.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <Stats entries={entries} />

        {/* Form */}
        <ErrorForm onAdd={handleAdd} existingDisciplines={disciplinas} />

        {/* Search & Filters */}
        {entries.length > 0 && (
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            filterDisciplina={filterDisciplina}
            onFilterChange={setFilterDisciplina}
            disciplinas={disciplinas}
            filterConsolidado={filterConsolidado}
            onFilterConsolidadoChange={setFilterConsolidado}
          />
        )}

        {/* Results count */}
        {entries.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredEntries.length === entries.length
                ? `${entries.length} registro${entries.length !== 1 ? 's' : ''}`
                : `${filteredEntries.length} de ${entries.length} registro${entries.length !== 1 ? 's' : ''}`
              }
            </p>
            {filteredEntries.some(e => !e.consolidado) && (
              <button
                onClick={() => {
                  filteredEntries.filter(e => !e.consolidado).forEach(e => handleIncrementRevision(e.id));
                }}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              >
                🔄 Marcar revisão de todos
              </button>
            )}
          </div>
        )}

        {/* Error List */}
        {filteredEntries.length > 0 ? (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <ErrorCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onMarkConsolidated={handleMarkConsolidated}
              />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-gray-500 font-medium">Nenhum registro encontrado com os filtros atuais.</p>
            <button
              onClick={() => { setSearch(''); setFilterDisciplina(''); setFilterConsolidado('all'); }}
              className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <span className="text-6xl mb-6 block">📝</span>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Seu caderno está vazio</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Comece registrando os erros dos seus simulados e baterias de exercícios.
                Foque nas "pegadinhas" das bancas e nos conceitos que você ainda não domina.
                Lembre-se: <strong>seja telegráfico</strong> — máx. 3 linhas por entrada!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          📕 Caderno de Erros • Seus dados ficam salvos localmente no navegador
        </p>
      </footer>
    </div>
  );
}
