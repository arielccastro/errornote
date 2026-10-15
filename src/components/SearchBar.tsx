interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterDisciplina: string;
  onFilterChange: (value: string) => void;
  disciplinas: string[];
  filterConsolidado: 'all' | 'active' | 'consolidated';
  onFilterConsolidadoChange: (value: 'all' | 'active' | 'consolidated') => void;
}

export default function SearchBar({
  search,
  onSearchChange,
  filterDisciplina,
  onFilterChange,
  disciplinas,
  filterConsolidado,
  onFilterConsolidadoChange,
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por qualquer termo (Ctrl+F nativo também funciona)..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterDisciplina}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
        >
          <option value="">Todas as Disciplinas</option>
          {disciplinas.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onFilterConsolidadoChange('all')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${filterConsolidado === 'all' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Todos
          </button>
          <button
            onClick={() => onFilterConsolidadoChange('active')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${filterConsolidado === 'active' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Em Revisão
          </button>
          <button
            onClick={() => onFilterConsolidadoChange('consolidated')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${filterConsolidado === 'consolidated' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Consolidados
          </button>
        </div>
      </div>
    </div>
  );
}
