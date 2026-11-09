import { citacao, destaque, EmailMontado, escapar, moedas, moldura } from "./base";

export interface DadosRecebimento {
  aluno: string;
  professor: string;
  valor: number;
  motivo: string;
  saldoAtual: number;
}

// Template do ALUNO: avisa que ele recebeu moedas
export function recebimentoAluno(d: DadosRecebimento): EmailMontado {
  const html = moldura(
    "Você recebeu moedas!",
    `<p style="margin:0 0 16px;">Olá, <strong>${escapar(d.aluno)}</strong>!</p>
     <p style="margin:0 0 16px;">O professor <strong>${escapar(d.professor)}</strong> reconheceu você com:</p>
     ${destaque(moedas(d.valor))}
     <p style="margin:0 0 8px;"><strong>Mensagem do professor:</strong></p>
     ${citacao(d.motivo)}
     <p style="margin:0;">Seu saldo atual é de <strong>${escapar(moedas(d.saldoAtual))}</strong>. Você pode trocá-las por vantagens das empresas parceiras.</p>`,
  );

  const texto = [
    `Olá, ${d.aluno}!`,
    "",
    `O professor ${d.professor} reconheceu você com ${moedas(d.valor)}.`,
    `Mensagem do professor: ${d.motivo}`,
    "",
    `Seu saldo atual é de ${moedas(d.saldoAtual)}. Você pode trocá-las por vantagens das empresas parceiras.`,
  ].join("\n");

  return { assunto: `Você recebeu ${moedas(d.valor)} de ${d.professor}`, html, texto };
}
