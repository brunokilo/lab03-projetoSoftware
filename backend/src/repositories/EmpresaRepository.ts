import { AppDataSource } from "../data-source";
import { Empresa } from "../entities/Empresa";

export class EmpresaRepository {
  private get repo() {
    return AppDataSource.getRepository(Empresa);
  }

  listar() {
    return this.repo.find();
  }

  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  salvar(empresa: Empresa) {
    return this.repo.save(empresa);
  }

  async remover(id: string) {
    await this.repo.delete(id);
  }
}
