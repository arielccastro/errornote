export interface ErrorEntry {
  id: string;
  disciplina: string;
  assunto: string;
  erro: string;
  conceitoCorreto: string;
  dataCriacao: string;
  dataRevisao?: string;
  revisoes: number;
  consolidado: boolean;
  tags: string[];
}

export type SortField = 'dataCriacao' | 'disciplina' | 'assunto' | 'revisoes';
export type SortOrder = 'asc' | 'desc';
