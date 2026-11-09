import type { Perfil } from "./types";

export type Pagina = "visao-geral" | "alunos" | "empresas" | "enviar-moedas" | "extrato";

export const titulos: Record<Pagina, string> = {
  "visao-geral": "Visão geral",
  alunos: "Alunos",
  empresas: "Empresas parceiras",
  "enviar-moedas": "Enviar moedas",
  extrato: "Extrato",
};

// Páginas restritas a certos perfis (as demais são liberadas a todos)
const ACESSO: Partial<Record<Pagina, Perfil[]>> = {
  "enviar-moedas": ["professor"],
  extrato: ["professor", "aluno"],
};

export function podeAcessar(pagina: Pagina, perfil: Perfil) {
  const permitidos = ACESSO[pagina];
  return !permitidos || permitidos.includes(perfil);
}

const PAGINAS: Pagina[] = ["alunos", "empresas", "enviar-moedas", "extrato"];

// "/alunos/novo" -> página de alunos com o formulário de cadastro aberto
export function lerPagina(rota: string): { pagina: Pagina; novo: boolean } {
  const [, segmento, acao] = rota.split("/");
  const pagina = PAGINAS.find((p) => p === segmento) ?? "visao-geral";
  return { pagina, novo: acao === "novo" };
}
