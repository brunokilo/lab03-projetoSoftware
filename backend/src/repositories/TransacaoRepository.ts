import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { ContaMoedas } from "../entities/ContaMoedas";
import { Professor } from "../entities/Professor";
import { TransacaoEnvio } from "../entities/TransacaoEnvio";

export class TransacaoRepository {
  private get envios() {
    return AppDataSource.getRepository(TransacaoEnvio);
  }

  // Trava as duas contas (FOR UPDATE, sempre na mesma ordem para não haver deadlock) e recarrega os saldos
  // antes de `enviar`: dois envios ou um envio e o crédito semestral ao mesmo tempo não perdem atualização
  registrarEnvio(professor: Professor, aluno: Aluno, enviar: () => TransacaoEnvio) {
    return AppDataSource.transaction(async (manager) => {
      const ids = [professor.conta.id, aluno.conta?.id].filter((id): id is string => Boolean(id));
      const contas = await manager.find(ContaMoedas, {
        where: { id: In(ids) },
        order: { id: "ASC" },
        lock: { mode: "pessimistic_write" },
      });
      professor.conta = contas.find((c) => c.id === professor.conta.id)!;
      if (aluno.conta) aluno.conta = contas.find((c) => c.id === aluno.conta.id)!;

      const envio = enviar();
      await manager.save(contas);
      return manager.save(envio);
    });
  }

  listarEnviosDoProfessor(professorId: string) {
    return this.envios.find({
      where: { professor: { id: professorId } },
      relations: { professor: true, aluno: true },
      order: { dataHora: "DESC" },
    });
  }

  listarEnviosParaAluno(alunoId: string) {
    return this.envios.find({
      where: { aluno: { id: alunoId } },
      relations: { professor: true, aluno: true },
      order: { dataHora: "DESC" },
    });
  }
}
