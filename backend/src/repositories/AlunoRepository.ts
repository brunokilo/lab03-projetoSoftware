import { IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { ContaMoedas } from "../entities/ContaMoedas";
import { Endereco } from "../entities/Endereco";

export class AlunoRepository {
  private get repo() {
    return AppDataSource.getRepository(Aluno);
  }

  listar() {
    return this.repo.find({ relations: { instituicao: true } });
  }

  listarSemConta() {
    return this.repo.find({ where: { conta: IsNull() } });
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id }, relations: { instituicao: true } });
  }

  salvar(aluno: Aluno) {
    return this.repo.save(aluno);
  }

  salvarVarios(alunos: Aluno[]) {
    return this.repo.save(alunos);
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
