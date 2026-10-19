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

export type TipoAviso = "sucesso" | "erro";

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  mensagem: string;
}
