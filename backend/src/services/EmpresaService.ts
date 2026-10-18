import bcrypt from "bcryptjs";
import { EmpresaRepository } from "../repositories/EmpresaRepository";
import { Empresa } from "../entities/Empresa";
import { AppError } from "../errors/AppError";

export interface EmpresaDados {
  nome?: string;
  email?: string;
  senha?: string;
  cnpj?: string;
}

function semSenha(empresa: Empresa) {
  const { senha, ...resto } = empresa;
  return resto;
}

export class EmpresaService {
  private repository = new EmpresaRepository();

  async listar() {
    return (await this.repository.listar()).map(semSenha);
  }

  async buscar(id: string) {
    return semSenha(await this.obter(id));
  }

  async criar(dados: EmpresaDados) {
    const campos = ["nome", "email", "senha", "cnpj"] as const;
    for (const campo of campos) {
      if (!dados[campo]) throw new AppError(`O campo ${campo} é obrigatório`);
    }

    const empresa = new Empresa();
    empresa.nome = dados.nome!;
    empresa.email = dados.email!;
    empresa.senha = await bcrypt.hash(dados.senha!, 10);
    empresa.cnpj = dados.cnpj!;

    return semSenha(await this.repository.salvar(empresa));
  }

  async atualizar(id: string, dados: EmpresaDados) {
    const empresa = await this.obter(id);

    if (dados.nome) empresa.nome = dados.nome;
    if (dados.email) empresa.email = dados.email;
    if (dados.senha) empresa.senha = await bcrypt.hash(dados.senha, 10);
    if (dados.cnpj) empresa.cnpj = dados.cnpj;

    return semSenha(await this.repository.salvar(empresa));
  }

  async remover(id: string) {
    await this.obter(id);
    await this.repository.remover(id);
  }

  private async obter(id: string) {
    const empresa = await this.repository.buscarPorId(id);
    if (!empresa) throw new AppError("Empresa não encontrada", 404);
    return empresa;
  }
}
