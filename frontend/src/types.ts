export interface Instituicao {
  id: string;
  nome: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  rg: string;
  curso: string;
  instituicao: Instituicao;
}

export interface Empresa {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
}
