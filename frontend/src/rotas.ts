export type Pagina = "visao-geral" | "alunos" | "professores" | "empresas";

export const titulos: Record<Pagina, string> = {
  "visao-geral": "Visão geral",
  alunos: "Alunos",
  professores: "Professores",
  empresas: "Empresas parceiras",
};

const paginas = Object.keys(titulos) as Pagina[];

// "/alunos/novo" -> página de alunos com o formulário de cadastro aberto
export function lerPagina(rota: string): { pagina: Pagina; novo: boolean } {
  const [, segmento, acao] = rota.split("/");
  const pagina = paginas.find((p) => p === segmento && p !== "visao-geral") ?? "visao-geral";
  return { pagina, novo: acao === "novo" };
}
