import { AppDataSource } from "../data-source";
import { Vantagem } from "../entities/Vantagem";

export class VantagemRepository {
  private get repo() {
    return AppDataSource.getRepository(Vantagem);
  }

  listarAtivas() {
    return this.repo.find({ where: { ativa: true }, relations: { empresa: true }, order: { custoMoedas: "ASC" } });
  }

  listarDaEmpresa(empresaId: string) {
    return this.repo.find({ where: { empresa: { id: empresaId } }, relations: { empresa: true }, order: { nome: "ASC" } });
  }

  contarAtivas() {
    return this.repo.count({ where: { ativa: true } });
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id }, relations: { empresa: true } });
  }

  salvar(vantagem: Vantagem) {
    return this.repo.save(vantagem);
  }

  async remover(id: string) {
    await this.repo.delete(id);
  }
}
