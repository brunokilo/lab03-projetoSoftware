import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { Endereco } from "../entities/Endereco";
import { ContaMoedas } from "../entities/ContaMoedas";

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

  // Aluno, endereço e conta saem juntos: se uma etapa falhar, nada é apagado
  remover(aluno: Aluno) {
    return AppDataSource.transaction(async (manager) => {
      await manager.delete(Aluno, aluno.id);
      if (aluno.endereco) await manager.delete(Endereco, aluno.endereco.id);
      if (aluno.conta) await manager.delete(ContaMoedas, aluno.conta.id);
    });
  }
}
