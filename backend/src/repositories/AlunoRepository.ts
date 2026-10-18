import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { Endereco } from "../entities/Endereco";

export class AlunoRepository {
  private get repo() {
    return AppDataSource.getRepository(Aluno);
  }

  listar() {
    return this.repo.find({ relations: { instituicao: true } });
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id }, relations: { instituicao: true } });
  }

  salvar(aluno: Aluno) {
    return this.repo.save(aluno);
  }

  async remover(aluno: Aluno) {
    await this.repo.delete(aluno.id);
    await AppDataSource.getRepository(Endereco).delete(aluno.endereco.id);
  }
}
