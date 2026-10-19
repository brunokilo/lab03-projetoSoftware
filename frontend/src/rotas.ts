export type Pagina = "visao-geral" | "alunos" | "empresas";

export const titulos: Record<Pagina, string> = {
  "visao-geral": "Visão geral",
  alunos: "Alunos",
  empresas: "Empresas parceiras",
};

// "/alunos/novo" -> página de alunos com o formulário de cadastro aberto
export function lerPagina(rota: string): { pagina: Pagina; novo: boolean } {
  const [, segmento, acao] = rota.split("/");
  const pagina: Pagina = segmento === "alunos" || segmento === "empresas" ? segmento : "visao-geral";
  return { pagina, novo: acao === "novo" };
}
