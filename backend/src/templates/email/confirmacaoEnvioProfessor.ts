import { citacao, destaque, EmailMontado, escapar, moedas, moldura } from "./base";

export interface DadosConfirmacaoEnvio {
  professor: string;
  aluno: string;
  valor: number;
  motivo: string;
  saldoRestante: number;
}

// Template do PROFESSOR: confirma que o envio foi realizado
export function confirmacaoEnvioProfessor(d: DadosConfirmacaoEnvio): EmailMontado {
  const html = moldura(
    "Envio de moedas confirmado",
    `<p style="margin:0 0 16px;">Olá, <strong>${escapar(d.professor)}</strong>!</p>
     <p style="margin:0 0 16px;">Seu envio foi realizado com sucesso. O aluno <strong>${escapar(d.aluno)}</strong> foi reconhecido com:</p>
     ${destaque(moedas(d.valor))}
     <p style="margin:0 0 8px;"><strong>Motivo informado:</strong></p>
     ${citacao(d.motivo)}
     <p style="margin:0;">Seu saldo atual é de <strong>${escapar(moedas(d.saldoRestante))}</strong>.</p>`,
  );

  const texto = [
    `Olá, ${d.professor}!`,
    "",
    `Seu envio foi realizado com sucesso. O aluno ${d.aluno} recebeu ${moedas(d.valor)}.`,
    `Motivo informado: ${d.motivo}`,
    "",
    `Seu saldo atual é de ${moedas(d.saldoRestante)}.`,
  ].join("\n");

  return { assunto: `Envio confirmado: ${moedas(d.valor)} para ${d.aluno}`, html, texto };
}
