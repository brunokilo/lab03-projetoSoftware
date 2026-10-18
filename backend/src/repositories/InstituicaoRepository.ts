import { AppDataSource } from "../data-source";
import { InstituicaoEnsino } from "../entities/InstituicaoEnsino";

export class InstituicaoRepository {
  private get repo() {
    return AppDataSource.getRepository(InstituicaoEnsino);
  }

  listar() {
    return this.repo.find({ order: { nome: "ASC" } });
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  contar() {
    return this.repo.count();
  }

  salvarVarias(instituicoes: Partial<InstituicaoEnsino>[]) {
    return this.repo.save(instituicoes);
  }
}
