import bcrypt from "bcryptjs";
import { AlunoRepository } from "../repositories/AlunoRepository";
import { InstituicaoRepository } from "../repositories/InstituicaoRepository";
import { Aluno } from "../entities/Aluno";
import { Endereco } from "../entities/Endereco";
import { AppError } from "../errors/AppError";

export interface AlunoDados {
  nome?: string;
  email?: string;
  senha?: string;
  cpf?: string;
  rg?: string;
  curso?: string;
  instituicaoId?: string;
  endereco?: Partial<Endereco>;
}

function semSenha(aluno: Aluno) {
  const { senha, ...resto } = aluno;
  return resto;
}

export class AlunoService {
  private repository = new AlunoRepository();
  private instituicoes = new InstituicaoRepository();

  async listar() {
    return (await this.repository.listar()).map(semSenha);
  }

  async buscar(id: string) {
    return semSenha(await this.obter(id));
  }

  async criar(dados: AlunoDados) {
    const campos = ["nome", "email", "senha", "cpf", "rg", "curso", "instituicaoId"] as const;
    for (const campo of campos) {
      if (!dados[campo]) throw new AppError(`O campo ${campo} é obrigatório`);
    }
    this.validarEndereco(dados.endereco);

    const aluno = new Aluno();
    aluno.nome = dados.nome!;
    aluno.email = dados.email!;
    aluno.senha = await bcrypt.hash(dados.senha!, 10);
    aluno.cpf = dados.cpf!;
    aluno.rg = dados.rg!;
    aluno.curso = dados.curso!;
    aluno.instituicao = await this.obterInstituicao(dados.instituicaoId!);
    aluno.endereco = Object.assign(new Endereco(), dados.endereco);

    return semSenha(await this.repository.salvar(aluno));
  }

  async atualizar(id: string, dados: AlunoDados) {
    const aluno = await this.obter(id);

    if (dados.nome) aluno.nome = dados.nome;
    if (dados.email) aluno.email = dados.email;
    if (dados.senha) aluno.senha = await bcrypt.hash(dados.senha, 10);
    if (dados.cpf) aluno.cpf = dados.cpf;
    if (dados.rg) aluno.rg = dados.rg;
    if (dados.curso) aluno.curso = dados.curso;
    if (dados.instituicaoId) aluno.instituicao = await this.obterInstituicao(dados.instituicaoId);
    if (dados.endereco) Object.assign(aluno.endereco, dados.endereco);

    return semSenha(await this.repository.salvar(aluno));
  }

  async remover(id: string) {
    const aluno = await this.obter(id);
    await this.repository.remover(aluno);
  }

  private async obter(id: string) {
    const aluno = await this.repository.buscarPorId(id);
    if (!aluno) throw new AppError("Aluno não encontrado", 404);
    return aluno;
  }

  private async obterInstituicao(id: string) {
    const instituicao = await this.instituicoes.buscarPorId(id);
    if (!instituicao) throw new AppError("Instituição não encontrada", 404);
    return instituicao;
  }

  private validarEndereco(endereco?: Partial<Endereco>) {
    const obrigatorios = ["rua", "numero", "bairro", "cidade", "estado", "cep"] as const;
    for (const campo of obrigatorios) {
      if (!endereco?.[campo]) throw new AppError(`O campo endereco.${campo} é obrigatório`);
    }
  }
}
