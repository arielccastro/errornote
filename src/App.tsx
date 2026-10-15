import { useState, useEffect } from 'react';

interface ErrorEntry {
  id: string;
  disciplina: string;
  assunto: string;
  erro: string;
  conceitoCorreto: string;
  dataCriacao: string;
  revisoes: number;
  consolidado: boolean;
  tags: string[];
}

export default function App() {
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterDisc, setFilterDisc] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('caderno-erros');
      if (stored) setEntries(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (newEntries: ErrorEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('caderno-erros', JSON.stringify(newEntries));
  };

  const addEntry = () => {
    const disc = (document.getElementById('f-disc') as HTMLInputElement)?.value.trim();
    const ass = (document.getElementById('f-ass') as HTMLInputElement)?.value.trim();
    const err = (document.getElementById('f-err') as HTMLTextAreaElement)?.value.trim();
    const conc = (document.getElementById('f-conc') as HTMLTextAreaElement)?.value.trim();
    const tags = ((document.getElementById('f-tags') as HTMLInputElement)?.value || '').split(',').map(t => t.trim()).filter(t => t);
    if (!disc || !ass || !err || !conc) { alert('Preencha todos os campos!'); return; }
    save([{
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      disciplina: disc, assunto: ass, erro: err, conceitoCorreto: conc, tags,
      dataCriacao: new Date().toISOString(), revisoes: 0, consolidado: false,
    }, ...entries]);
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    if (!confirm('Excluir?')) return;
    save(entries.filter(e => e.id !== id));
  };

  const toggleConsolidated = (id: string) => {
    save(entries.map(e => e.id === id ? { ...e, consolidado: !e.consolidado } : e));
  };

  const saveEdit = (id: string) => {
    const disc = (document.getElementById('e-disc') as HTMLInputElement)?.value.trim();
    const ass = (document.getElementById('e-ass') as HTMLInputElement)?.value.trim();
    const err = (document.getElementById('e-err') as HTMLTextAreaElement)?.value.trim();
    const conc = (document.getElementById('e-conc') as HTMLTextAreaElement)?.value.trim();
    const tags = ((document.getElementById('e-tags') as HTMLInputElement)?.value || '').split(',').map(t => t.trim()).filter(t => t);
    save(entries.map(e => e.id === id ? { ...e, disciplina: disc, assunto: ass, erro: err, conceitoCorreto: conc, tags } : e));
    setEditId(null);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `caderno-erros-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { const imported = JSON.parse(ev.target?.result as string); if (Array.isArray(imported)) save(imported); }
        catch { alert('Arquivo inválido.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const disciplinas = [...new Set(entries.map(e => e.disciplina))].sort();
  let filtered = [...entries];
  if (search.trim()) {
    const term = search.toLowerCase();
    filtered = filtered.filter(e => e.disciplina.toLowerCase().includes(term) || e.assunto.toLowerCase().includes(term) || e.erro.toLowerCase().includes(term) || e.conceitoCorreto.toLowerCase().includes(term) || e.tags.some(t => t.toLowerCase().includes(term)));
  }
  if (filterDisc) filtered = filtered.filter(e => e.disciplina === filterDisc);
  if (filterStatus === 'active') filtered = filtered.filter(e => !e.consolidado);
  if (filterStatus === 'consolidated') filtered = filtered.filter(e => e.consolidado);
  filtered.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());

  const total = entries.length;
  const consolidados = entries.filter(e => e.consolidado).length;
  const ativos = total - consolidados;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md text-xl">📕</div>
            <div><h1 className="text-xl font-bold text-gray-800">Caderno de Erros</h1><p className="text-xs text-gray-500">Revisão cirúrgica para concursos</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTips(!showTips)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Dicas">💡</button>
            <button onClick={exportData} disabled={total === 0} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Exportar">📤</button>
            <button onClick={importData} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Importar">📥</button>
          </div>
        </div>
      </header>

      {showTips && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3"><h3 className="font-bold text-amber-800">💡 Regras de Ouro</h3><button onClick={() => setShowTips(false)} className="text-amber-400 hover:text-amber-600">✕</button></div>
            <ul className="space-y-2 text-sm text-amber-900">
              <li>• <strong>Seja telegráfico:</strong> Máx. 3 linhas por entrada!</li>
              <li>• <strong>Anote os "chutes":</strong> Acertou por eliminação? Trate como erro.</li>
              <li>• <strong>Podar é essencial:</strong> Consolidou? Exclua. O material deve diminuir.</li>
              <li>• <strong>Revisão semanal:</strong> Dia fixo para ler as entradas da semana.</li>
              <li>• <strong>Véspera de prova:</strong> Principal material de leitura na semana anterior.</li>
            </ul>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"><p className="text-2xl font-bold text-gray-800">{total}</p><p className="text-xs text-gray-500">Total</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"><p className="text-2xl font-bold text-orange-600">{ativos}</p><p className="text-xs text-gray-500">Em Revisão</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"><p className="text-2xl font-bold text-green-600">{consolidados}</p><p className="text-xs text-gray-500">Consolidados</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"><p className="text-2xl font-bold text-blue-600">{entries.reduce((a, e) => a + e.revisoes, 0)}</p><p className="text-xs text-gray-500">Revisões</p></div>
          </div>
        )}

        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg text-lg">➕ Registrar Novo Erro</button>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">✏️ Novo Registro</h3><button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Disciplina *</label><input id="f-disc" list="disc-list" placeholder="Ex: Direito Administrativo" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" /><datalist id="disc-list">{disciplinas.map(d => <option key={d} value={d} />)}</datalist></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Assunto *</label><input id="f-ass" placeholder="Ex: Licitações" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" /></div>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">O Erro / Pegadinha *</label><textarea id="f-err" placeholder="Seja telegráfico! Máx. 3 linhas." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none" rows={2} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Conceito Correto *</label><textarea id="f-conc" placeholder="Ex: ERRADO. Aplica-se também quando..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none" rows={2} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(vírgula)</span></label><input id="f-tags" placeholder="Ex: pegadinha, chute" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" /></div>
            <div className="flex gap-3"><button onClick={addEntry} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-md">💾 Salvar</button><button onClick={() => setShowForm(false)} className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg">Cancelar</button></div>
          </div>
        )}

        {total > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
              <div className="flex flex-wrap gap-2">
                <select value={filterDisc} onChange={e => setFilterDisc(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Todas as Disciplinas</option>{disciplinas.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button onClick={() => setFilterStatus('all')} className={`px-3 py-2 text-xs font-medium ${filterStatus === 'all' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}>Todos</button>
                  <button onClick={() => setFilterStatus('active')} className={`px-3 py-2 text-xs font-medium ${filterStatus === 'active' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}>Ativos</button>
                  <button onClick={() => setFilterStatus('consolidated')} className={`px-3 py-2 text-xs font-medium ${filterStatus === 'consolidated' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600'}`}>Consolidados</button>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{filtered.length} de {total} registros</p>
          </>
        )}

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(entry => {
              const days = Math.floor((Date.now() - new Date(entry.dataCriacao).getTime()) / 86400000);
              if (editId === entry.id) {
                return (
                  <div key={entry.id} className="bg-white rounded-xl shadow-md border-2 border-amber-300 p-5 space-y-3">
                    <h4 className="font-bold text-amber-600">✏️ Editando</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input id="e-disc" defaultValue={entry.disciplina} className="px-3 py-2 border rounded-lg text-sm" /><input id="e-ass" defaultValue={entry.assunto} className="px-3 py-2 border rounded-lg text-sm" /></div>
                    <textarea id="e-err" defaultValue={entry.erro} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" rows={2} />
                    <textarea id="e-conc" defaultValue={entry.conceitoCorreto} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" rows={2} />
                    <input id="e-tags" defaultValue={entry.tags.join(', ')} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    <div className="flex gap-2"><button onClick={() => saveEdit(entry.id)} className="flex-1 py-2 bg-green-500 text-white font-semibold rounded-lg text-sm">Salvar</button><button onClick={() => setEditId(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm">Cancelar</button></div>
                  </div>
                );
              }
              return (
                <div key={entry.id} className={`bg-white rounded-xl shadow-md border border-gray-100 p-5 group ${entry.consolidado ? 'opacity-60 border-green-200' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2"><span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-800 border-gray-200">{entry.disciplina}</span><span className="text-sm text-gray-500">{entry.assunto}</span>{entry.consolidado && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Consolidado</span>}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => setEditId(entry.id)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg">✏️</button><button onClick={() => toggleConsolidated(entry.id)} className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg">✅</button><button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">🗑️</button></div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3"><p className="text-xs font-bold text-red-600 mb-1">❌ Erro / Pegadinha</p><p className="text-sm text-gray-800">{entry.erro}</p></div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3"><p className="text-xs font-bold text-green-700 mb-1">✅ Conceito Correto</p><p className="text-sm text-gray-800">{entry.conceitoCorreto}</p></div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"><div className="flex flex-wrap gap-1">{entry.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">#{t}</span>)}</div><div className="text-xs text-gray-400">🔄 {entry.revisoes}x • {days}d</div></div>
                </div>
              );
            })}
          </div>
        ) : total > 0 ? (
          <div className="text-center py-12"><p className="text-4xl mb-4">🔍</p><p className="text-gray-500">Nenhum registro encontrado.</p><button onClick={() => { setSearch(''); setFilterDisc(''); setFilterStatus('all'); }} className="mt-3 text-amber-600 text-sm">Limpar filtros</button></div>
        ) : (
          <div className="text-center py-16"><p className="text-6xl mb-6">📝</p><h2 className="text-xl font-bold text-gray-700 mb-2">Seu caderno está vazio</h2><p className="text-gray-500 text-sm">Comece registrando os erros dos seus simulados. <strong>Seja telegráfico!</strong></p></div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center"><p className="text-xs text-gray-400">📕 Caderno de Erros • Dados salvos localmente</p></footer>
    </div>
  );
}
