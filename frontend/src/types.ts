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

export interface ContaMoedas {
  id: string;
  saldo: number;
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
  conta?: ContaMoedas | null;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  departamento: string;
  instituicao: Instituicao;
  conta: ContaMoedas;
  ultimoSemestreCreditado: string | null;
}

export interface Transacao {
  id: string;
  tipo: "envio";
  dataHora: string;
  valor: number;
  motivo: string;
  professor: { id: string; nome: string };
  aluno: { id: string; nome: string } | null;
}

export interface Extrato {
  saldo: number;
  transacoes: Transacao[];
}

export interface ResultadoEnvio {
  transacao: Transacao;
  saldoProfessor: number;
  saldoAluno: number;
}

export interface Empresa {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
}

export type TipoAviso = "sucesso" | "erro";

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  mensagem: string;
}
