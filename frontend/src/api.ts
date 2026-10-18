const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(API_URL + caminho, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro ?? "Erro na requisição");
  return dados;
}
