import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Professor } from "../entities/Professor";

export class ProfessorRepository {
  private get repo() {
    return AppDataSource.getRepository(Professor);
  }

  contar() {
    return this.repo.count();
  }

  salvarVarios(professores: Partial<Professor>[]) {
    return this.repo.save(professores);
  }

  // Professores sem semestre registrado vêm da carga inicial anterior ao crédito semestral,
  // que já dava as 1.000 moedas: ficam como creditados no semestre atual
  marcarCreditoSemSemestre(semestre: string) {
    return this.repo.update({ ultimoSemestreCreditado: IsNull() }, { ultimoSemestreCreditado: semestre });
  }

  // Busca os professores sem o crédito do semestre travando as linhas (FOR UPDATE) até o fim da transação:
  // uma execução simultânea espera esta terminar e já não encontra ninguém pendente
  creditarPendentes(semestre: string, creditar: (professor: Professor) => void) {
    return AppDataSource.transaction(async (manager) => {
      const pendentes = await manager
        .createQueryBuilder(Professor, "professor")
        .innerJoinAndSelect("professor.conta", "conta")
        .where("professor.ultimoSemestreCreditado IS DISTINCT FROM :semestre", { semestre })
        .setLock("pessimistic_write")
        .getMany();
      pendentes.forEach(creditar);
      await manager.save(pendentes);
      return pendentes;
    });
  }
}
