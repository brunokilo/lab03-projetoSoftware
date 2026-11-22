import { codigoCupom, EmailMontado, escapar, moedas, moldura } from "./base";

export interface DadosConfirmacaoResgate {
  empresa: string;
  aluno: string;
  vantagem: string;
  custo: number;
  codigo: string;
}

// Template da EMPRESA: avisa que um aluno trocou uma vantagem e traz o mesmo código enviado ao aluno
export function confirmacaoResgateEmpresa(d: DadosConfirmacaoResgate): EmailMontado {
  const html = moldura(
    "Uma vantagem foi trocada",
    `<p style="margin:0 0 16px;">Olá, <strong>${escapar(d.empresa)}</strong>!</p>
     <p style="margin:0 0 16px;">O aluno <strong>${escapar(d.aluno)}</strong> trocou <strong>${escapar(moedas(d.custo))}</strong> pela vantagem <strong>${escapar(d.vantagem)}</strong>.</p>
     <p style="margin:0 0 8px;"><strong>Código do cupom:</strong></p>
     ${codigoCupom(d.codigo)}
     <p style="margin:0;">O aluno vai apresentar este mesmo código na troca presencial. Confira se o código informado por ele é igual ao acima antes de entregar a vantagem.</p>`,
  );

  const texto = [
    `Olá, ${d.empresa}!`,
    "",
    `O aluno ${d.aluno} trocou ${moedas(d.custo)} pela vantagem ${d.vantagem}.`,
    "",
    `Código do cupom: ${d.codigo}`,
    "",
    "O aluno vai apresentar este mesmo código na troca presencial. Confira se o código informado por ele é igual ao acima antes de entregar a vantagem.",
  ].join("\n");

  return { assunto: `Troca de vantagem: ${d.vantagem} (código ${d.codigo})`, html, texto };
}
