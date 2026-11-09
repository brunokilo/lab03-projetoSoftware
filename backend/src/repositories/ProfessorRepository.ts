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
}
