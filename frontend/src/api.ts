const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se a API está em execução.");
  }
  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro ?? "Erro na requisição");
  return dados;
}
