// Máscaras, validações e pequenos formatadores usados nas telas

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function mascararCpf(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascararCnpj(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascararCep(valor: string) {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

// Formata para exibição só quando o valor salvo tem a quantidade certa de dígitos
export function exibirCpf(valor: string) {
  return somenteDigitos(valor).length === 11 ? mascararCpf(valor) : valor;
}

export function exibirCnpj(valor: string) {
  return somenteDigitos(valor).length === 14 ? mascararCnpj(valor) : valor;
}

// Dígitos verificadores do CPF (pesos 10..2 e 11..2)
export function cpfValido(cpf: string) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const posicao of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < posicao; i++) soma += Number(d[i]) * (posicao + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(d[posicao])) return false;
  }
  return true;
}

// Dígitos verificadores do CNPJ
export function cnpjValido(cnpj: string) {
  const d = somenteDigitos(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const digito = (pesos: number[]) => {
    const resto = pesos.reduce((soma, peso, i) => soma + Number(d[i]) * peso, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return digito(pesos1) === Number(d[12]) && digito([6, ...pesos1]) === Number(d[13]);
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// Remove acentos e caixa para a busca encontrar "joao" em "João"
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function compararNomes(a: { nome: string }, b: { nome: string }) {
  return a.nome.localeCompare(b.nome, "pt-BR");
}

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
