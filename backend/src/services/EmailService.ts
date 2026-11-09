import nodemailer, { Transporter } from "nodemailer";
import { EmailMontado } from "../templates/email/base";
import { confirmacaoEnvioProfessor } from "../templates/email/confirmacaoEnvioProfessor";
import { recebimentoAluno } from "../templates/email/recebimentoAluno";

export interface DadosEnvioMoedas {
  professor: { nome: string; email: string };
  aluno: { nome: string; email: string };
  valor: number;
  motivo: string;
  saldoProfessor: number;
  saldoAluno: number;
}

interface Conexao {
  transporte: Transporter;
  remetente: string;
  teste: boolean;
}

// Envia os e-mails do sistema. Com SMTP_HOST no .env usa esse servidor; sem ele, usa uma conta de teste
// do Ethereal (os e-mails não chegam a ninguém, só ganham um link de pré-visualização no terminal)
export class EmailService {
  private static conexao?: Promise<Conexao>;

  async notificarEnvioMoedas(d: DadosEnvioMoedas) {
    const paraProfessor = confirmacaoEnvioProfessor({
      professor: d.professor.nome,
      aluno: d.aluno.nome,
      valor: d.valor,
      motivo: d.motivo,
      saldoRestante: d.saldoProfessor,
    });
    const paraAluno = recebimentoAluno({
      aluno: d.aluno.nome,
      professor: d.professor.nome,
      valor: d.valor,
      motivo: d.motivo,
      saldoAtual: d.saldoAluno,
    });

    // Um e-mail com problema não impede o outro
    const resultados = await Promise.allSettled([
      this.enviar(d.professor.email, paraProfessor, "professor"),
      this.enviar(d.aluno.email, paraAluno, "aluno"),
    ]);
    for (const r of resultados) {
      if (r.status === "rejected") console.error("Falha ao enviar e-mail:", r.reason);
    }
  }

  private async enviar(para: string, email: EmailMontado, destinatario: string) {
    const { transporte, remetente, teste } = await this.obterConexao();
    const info = await transporte.sendMail({
      from: remetente,
      to: para,
      subject: email.assunto,
      html: email.html,
      text: email.texto,
    });
    if (teste) {
      console.log(`E-mail do ${destinatario} (${para}): ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`E-mail do ${destinatario} enviado para ${para}`);
    }
  }

  // A conexão é criada uma vez só; se falhar (sem internet, por exemplo), a próxima tentativa recria
  private obterConexao(): Promise<Conexao> {
    if (!EmailService.conexao) {
      EmailService.conexao = this.criarConexao().catch((erro) => {
        EmailService.conexao = undefined;
        throw erro;
      });
    }
    return EmailService.conexao;
  }

  private async criarConexao(): Promise<Conexao> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST) {
      const porta = Number(SMTP_PORT) || 587;
      return {
        transporte: nodemailer.createTransport({
          host: SMTP_HOST,
          port: porta,
          secure: porta === 465,
          auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        }),
        remetente: SMTP_FROM || `Moeda Estudantil <${SMTP_USER}>`,
        teste: false,
      };
    }

    const conta = await nodemailer.createTestAccount();
    console.log(`E-mails em modo de teste (Ethereal). Caixa de entrada: https://ethereal.email/login (${conta.user})`);
    return {
      transporte: nodemailer.createTransport({
        host: conta.smtp.host,
        port: conta.smtp.port,
        secure: conta.smtp.secure,
        auth: { user: conta.user, pass: conta.pass },
      }),
      remetente: "Moeda Estudantil <nao-responda@moedaestudantil.com>",
      teste: true,
    };
  }
}
