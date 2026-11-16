import type { Perfil } from "./types";

export type Pagina =
  | "visao-geral"
  | "empresas"
  | "enviar-moedas"
  | "extrato"
  | "vantagens"
  | "minhas-vantagens"
  | "meu-cadastro";

export const titulos: Record<Pagina, string> = {
  "visao-geral": "Visão geral",
  empresas: "Empresas parceiras",
  "enviar-moedas": "Enviar moedas",
  extrato: "Extrato",
  vantagens: "Vantagens",
  "minhas-vantagens": "Minhas vantagens",
  "meu-cadastro": "Meu cadastro",
};

// Páginas restritas a certos perfis (as demais são liberadas a todos). Espelha as permissões da API,
// que é quem de fato bloqueia: aqui só se evita mostrar o que o perfil não pode usar
const ACESSO: Partial<Record<Pagina, Perfil[]>> = {
  "enviar-moedas": ["professor"],
  extrato: ["professor", "aluno"],
  vantagens: ["aluno", "professor"],
  "minhas-vantagens": ["empresa"],
  "meu-cadastro": ["aluno", "empresa"],
};

export function podeAcessar(pagina: Pagina, perfil: Perfil) {
  const permitidos = ACESSO[pagina];
  return !permitidos || permitidos.includes(perfil);
}

const PAGINAS = Object.keys(titulos) as Pagina[];

// "/minhas-vantagens/novo" -> página de vantagens da empresa com o formulário de cadastro aberto
export function lerPagina(rota: string): { pagina: Pagina; novo: boolean } {
  const [, segmento, acao] = rota.split("/");
  const pagina = PAGINAS.find((p) => p === segmento && p !== "visao-geral") ?? "visao-geral";
  return { pagina, novo: acao === "novo" };
}
