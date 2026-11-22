import { codigoCupom, destaque, EmailMontado, escapar, moedas, moldura } from "./base";

export interface DadosCupomAluno {
  aluno: string;
  vantagem: string;
  descricao: string;
  empresa: string;
  custo: number;
  codigo: string;
  saldoAtual: number;
}

//Linha gerada com apoio da ferramenta de inteligencia articial claude, da empresa anthropic
export function cupomAluno(d: DadosCupomAluno): EmailMontado {
  const html = moldura(
    "Seu cupom de troca",
    `<p style="margin:0 0 16px;">Olá, <strong>${escapar(d.aluno)}</strong>!</p>
     <p style="margin:0 0 16px;">Você trocou <strong>${escapar(moedas(d.custo))}</strong> pela vantagem <strong>${escapar(d.vantagem)}</strong>, oferecida por <strong>${escapar(d.empresa)}</strong>.</p>
     <p style="margin:0 0 8px;"><strong>Seu código do cupom:</strong></p>
     ${codigoCupom(d.codigo)}
     <p style="margin:0 0 16px;">Apresente este código à empresa parceira na troca presencial. Ela recebeu o mesmo código para conferir o seu cupom.</p>
     <p style="margin:0 0 8px;"><strong>Sobre a vantagem:</strong></p>
     <p style="margin:0 0 16px;">${escapar(d.descricao)}</p>
     <p style="margin:0;">Seu saldo atual é de <strong>${escapar(moedas(d.saldoAtual))}</strong>.</p>`,
  );

  const texto = [
    `Olá, ${d.aluno}!`,
    "",
    `Você trocou ${moedas(d.custo)} pela vantagem ${d.vantagem}, oferecida por ${d.empresa}.`,
    "",
    `Seu código do cupom: ${d.codigo}`,
    "",
    "Apresente este código à empresa parceira na troca presencial. Ela recebeu o mesmo código para conferir o seu cupom.",
    "",
    `Sobre a vantagem: ${d.descricao}`,
    "",
    `Seu saldo atual é de ${moedas(d.saldoAtual)}.`,
  ].join("\n");

  return { assunto: `Seu cupom: ${d.vantagem} (código ${d.codigo})`, html, texto };
}
