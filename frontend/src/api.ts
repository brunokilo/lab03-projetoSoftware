const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const CHAVE_TOKEN = "moeda.token";

// Disparado quando a API recusa o token (expirado ou inválido), para o App voltar ao login
export const SESSAO_EXPIRADA = "sessao-expirada";

// O localStorage pode estar bloqueado (janela anônima, por exemplo): nesse caso a sessão só dura até recarregar
export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    /* sem armazenamento disponível */
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* sem armazenamento disponível */
  }
}

export async function api<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const token = lerToken();
  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...opcoes,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se a API está em execução.");
  }
  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    // 401 em outra rota que não o login: o token não vale mais
    if (resposta.status === 401 && token && caminho !== "/login") {
      limparToken();
      window.dispatchEvent(new Event(SESSAO_EXPIRADA));
    }
    throw new Error(dados.erro ?? "Erro na requisição");
  }
  return dados;
}
