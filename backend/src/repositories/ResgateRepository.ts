import { AppDataSource } from "../data-source";
import { Resgate } from "../entities/Resgate";

export class ResgateRepository {
  private get repo() {
    return AppDataSource.getRepository(Resgate);
  }

  listarDoAluno(alunoId: string) {
    return this.repo.find({ where: { aluno: { id: alunoId } }, relations: { empresa: true }, order: { dataHora: "DESC" } });
  }
}
