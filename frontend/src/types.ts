export interface Instituicao {
  id: string;
  nome: string;
}

export interface Endereco {
  id: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  rg: string;
  curso: string;
  instituicao: Instituicao;
  endereco?: Endereco;
}

// O que o professor vê de cada aluno para escolher quem recebe moedas
export interface AlunoResumo {
  id: string;
  nome: string;
  curso: string;
  instituicao: Instituicao;
}

// Números agregados da visão geral (GET /resumo)
export interface Resumo {
  alunos: number;
  empresas: number;
  vantagensAtivas: number;
  cursos: number;
  alunosPorInstituicao: { id: string; nome: string; total: number }[];
}

export interface Vantagem {
  id: string;
  nome: string;
  descricao: string;
  foto: string | null;
  custoMoedas: number;
  ativa: boolean;
  empresa: { id: string; nome: string };
}

export interface Empresa {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
}

export type Perfil = "aluno" | "professor" | "empresa";

// Quem está logado (resposta de POST /login e GET /me)
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

// Uma linha do extrato: envio de moedas por um professor ou troca por uma vantagem (com o código do cupom)
export interface Movimentacao {
  id: string;
  tipo: "ENVIO" | "RESGATE";
  sentido: "entrada" | "saida";
  dataHora: string;
  valor: number;
  motivo: string;
  contraparte: { id: string; nome: string };
  codigo: string | null;
}

// Resposta de POST /resgates
export interface ResgateRealizado {
  id: string;
  codigo: string;
  valor: number;
  vantagem: { id: string; nome: string };
  empresa: { id: string; nome: string };
  saldoAluno: number;
}

export interface Extrato {
  saldo: number;
  transacoes: Movimentacao[];
}

export interface EnvioRealizado {
  id: string;
  valor: number;
  aluno: { id: string; nome: string };
  saldoProfessor: number;
}

export type TipoAviso = "sucesso" | "erro";

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  mensagem: string;
}
