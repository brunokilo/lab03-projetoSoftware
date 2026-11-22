import { randomInt } from "crypto";
import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { ContaMoedas } from "../entities/ContaMoedas";
import { Resgate } from "../entities/Resgate";
import { Vantagem } from "../entities/Vantagem";
import { AppError } from "../errors/AppError";
import { EmailService } from "./EmailService";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sem 0/O e 1/I/L, para o código ser fácil de ler e ditar na troca presencial
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Ex.: "K7QF-M3XA" (31^8 combinações, gerado com número aleatório seguro)
function gerarCodigo(): string {
  const sorteio = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `${sorteio()}-${sorteio()}`;
}

export interface ResgateDados {
  vantagemId?: string;
}

export class ResgateService {
  private emails = new EmailService();

  // O aluno troca moedas por uma vantagem. Debitar a conta e registrar o resgate acontecem juntos:
  // se qualquer passo falhar, nada é gravado. O mesmo código vai para o aluno e para a empresa.
  async resgatar(alunoId: string, dados: ResgateDados) {
    const { vantagemId } = dados;
    if (!vantagemId) throw new AppError("O campo vantagemId é obrigatório");

    const { resposta, aviso } = await AppDataSource.transaction(async (manager) => {
      const aluno = await manager.findOne(Aluno, { where: { id: alunoId } });
      if (!aluno) throw new AppError("Aluno não encontrado", 404);

      const vantagem = UUID.test(vantagemId)
        ? await manager.findOne(Vantagem, { where: { id: vantagemId }, relations: { empresa: true } })
        : null;
      if (!vantagem) throw new AppError("Vantagem não encontrada", 404);
      if (!vantagem.ativa) throw new AppError("Essa vantagem não está mais disponível");

      // Trava a conta do aluno até o fim da transação: dois resgates simultâneos não gastam o mesmo saldo
      const conta = await manager.findOne(ContaMoedas, {
        where: { id: aluno.conta.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!conta) throw new AppError("Conta de moedas não encontrada", 404);
      if (!conta.possuiSaldo(vantagem.custoMoedas)) {
        throw new AppError("Saldo insuficiente para trocar por essa vantagem");
      }

      conta.debitar(vantagem.custoMoedas);
      await manager.save(conta);

      const resgate = new Resgate();
      resgate.valor = vantagem.custoMoedas;
      resgate.codigo = gerarCodigo();
      resgate.aluno = aluno;
      resgate.vantagem = vantagem;
      resgate.empresa = vantagem.empresa;
      resgate.vantagemNome = vantagem.nome;
      resgate.empresaNome = vantagem.empresa.nome;
      await manager.save(resgate);

      return {
        resposta: {
          id: resgate.id,
          codigo: resgate.codigo,
          dataHora: resgate.dataHora,
          valor: resgate.valor,
          vantagem: { id: vantagem.id, nome: vantagem.nome },
          empresa: { id: vantagem.empresa.id, nome: vantagem.empresa.nome },
          saldoAluno: conta.saldo,
        },
        aviso: {
          codigo: resgate.codigo,
          vantagem: vantagem.nome,
          descricao: vantagem.descricao,
          custo: vantagem.custoMoedas,
          aluno: { nome: aluno.nome, email: aluno.email },
          empresa: { nome: vantagem.empresa.nome, email: vantagem.empresa.email },
          saldoAluno: conta.saldo,
        },
      };
    });

    // Só chega aqui se o resgate foi gravado. Os e-mails rodam em segundo plano: se falharem, a troca
    // continua válida e o erro só vai para o log
    void this.emails.notificarResgate(aviso).catch((erro) => console.error("Falha ao enviar e-mails:", erro));

    return resposta;
  }
}
