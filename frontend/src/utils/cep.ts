import { somenteDigitos } from "./formatos";

export interface EnderecoCep {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Consulta o ViaCEP para preencher o endereço. Retorna null se o CEP não existir ou a consulta falhar.
export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const digitos = somenteDigitos(cep);
  if (digitos.length !== 8) return null;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    if (dados.erro) return null;
    return {
      rua: dados.logradouro ?? "",
      bairro: dados.bairro ?? "",
      cidade: dados.localidade ?? "",
      estado: dados.uf ?? "",
    };
  } catch {
    return null;
  }
}
