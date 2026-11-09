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

// Uma linha do extrato. Hoje só existe o envio de moedas; os resgates de vantagens entram depois
export interface Movimentacao {
  id: string;
  tipo: "ENVIO";
  sentido: "entrada" | "saida";
  dataHora: string;
  valor: number;
  motivo: string;
  contraparte: { id: string; nome: string };
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
