import { InstituicaoRepository } from "../repositories/InstituicaoRepository";

export class InstituicaoService {
  private repository = new InstituicaoRepository();

  listar() {
    return this.repository.listar();
  }

  // Instituições que não preciso cadastrar
  async popularInicial() {
    if ((await this.repository.contar()) > 0) return;
    await this.repository.salvarVarias([
      { nome: "PUC Minas" },
      { nome: "UFMG" },
      { nome: "CEFET-MG" },
    ]);
    console.log("Instituições iniciais cadastradas");
  }
}
