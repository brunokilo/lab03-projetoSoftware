import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { ContaMoedas } from "../entities/ContaMoedas";
import { Professor } from "../entities/Professor";
import { TransacaoEnvio } from "../entities/TransacaoEnvio";
import { AppError } from "../errors/AppError";
import { UsuarioLogado } from "./AuthService";

export interface EnvioDados {
  alunoId?: string;
  valor?: number;
  motivo?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class MoedaService {
  // Professor envia moedas a um aluno. Debitar, creditar e registrar a transação acontecem juntos:
  // se qualquer passo falhar, nada é gravado
  async enviar(professorId: string, dados: EnvioDados) {
    const { alunoId, valor } = dados;
    const motivo = typeof dados.motivo === "string" ? dados.motivo.trim() : "";

    if (!alunoId) throw new AppError("O campo alunoId é obrigatório");
    if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
      throw new AppError("A quantidade de moedas deve ser um número inteiro maior que zero");
    }
    if (!motivo) throw new AppError("O motivo do reconhecimento é obrigatório");

    return AppDataSource.transaction(async (manager) => {
      const professor = await manager.findOne(Professor, { where: { id: professorId } });
      if (!professor) throw new AppError("Professor não encontrado", 404);
      const aluno = UUID.test(alunoId) ? await manager.findOne(Aluno, { where: { id: alunoId } }) : null;
      if (!aluno) throw new AppError("Aluno não encontrado", 404);

      // Trava as duas contas até o fim da transação, para dois envios simultâneos não gastarem o mesmo saldo.
      // Sempre na mesma ordem (professor, depois aluno), para não travarem um ao outro
      const contaProfessor = await this.travarConta(manager, professor.conta.id);
      const contaAluno = await this.travarConta(manager, aluno.conta.id);

      contaProfessor.debitar(valor);
      contaAluno.creditar(valor);
      await manager.save([contaProfessor, contaAluno]);

      const envio = new TransacaoEnvio();
      envio.valor = valor;
      envio.motivo = motivo;
      envio.professor = professor;
      envio.aluno = aluno;
      await manager.save(envio);

      return {
        id: envio.id,
        dataHora: envio.dataHora,
        valor: envio.valor,
        motivo: envio.motivo,
        aluno: { id: aluno.id, nome: aluno.nome },
        saldoProfessor: contaProfessor.saldo,
      };
    });
  }

  // Saldo de quem está logado (aluno ou professor)
  async saldo(logado: UsuarioLogado) {
    const dono =
      logado.perfil === "professor"
        ? await AppDataSource.getRepository(Professor).findOne({ where: { id: logado.id } })
        : logado.perfil === "aluno"
          ? await AppDataSource.getRepository(Aluno).findOne({ where: { id: logado.id } })
          : null;
    if (!dono) throw new AppError("Esse perfil não possui conta de moedas", 404);
    return { saldo: dono.conta.saldo };
  }

  private async travarConta(manager: typeof AppDataSource.manager, id: string) {
    const conta = await manager.findOne(ContaMoedas, { where: { id }, lock: { mode: "pessimistic_write" } });
    if (!conta) throw new AppError("Conta de moedas não encontrada", 404);
    return conta;
  }
}
