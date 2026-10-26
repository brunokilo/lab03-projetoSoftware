import { AppDataSource } from "../data-source";
import { Professor } from "../entities/Professor";

export class ProfessorRepository {
  private get repo() {
    return AppDataSource.getRepository(Professor);
  }

  listar() {
    return this.repo.find({ relations: { instituicao: true } });
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id }, relations: { instituicao: true } });
  }

  contar() {
    return this.repo.count();
  }

  salvar(professor: Professor) {
    return this.repo.save(professor);
  }

  salvarVarios(professores: Professor[]) {
    return this.repo.save(professores);
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
