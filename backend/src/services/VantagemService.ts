import { VantagemRepository } from "../repositories/VantagemRepository";
import { EmpresaRepository } from "../repositories/EmpresaRepository";
import { Vantagem } from "../entities/Vantagem";
import { AppError } from "../errors/AppError";
import { FotoService } from "./FotoService";

export interface VantagemDados {
  nome?: string;
  descricao?: string;
  custoMoedas?: number;
  foto?: string;
  ativa?: boolean;
}

const LIMITES = { nome: 80, descricao: 1000, custoMoedas: 1_000_000 };

// O que o catálogo e a empresa precisam ver: sem senha ou e-mail da empresa
function formatar(vantagem: Vantagem) {
  return {
    id: vantagem.id,
    nome: vantagem.nome,
    descricao: vantagem.descricao,
    foto: vantagem.foto,
    custoMoedas: vantagem.custoMoedas,
    ativa: vantagem.ativa,
    empresa: { id: vantagem.empresa.id, nome: vantagem.empresa.nome },
  };
}

export class VantagemService {
  private repository = new VantagemRepository();
  private empresas = new EmpresaRepository();
  private fotos = new FotoService();

  // Catálogo para os alunos: só as vantagens ativas, da mais barata para a mais cara
  async listarCatalogo() {
    return (await this.repository.listarAtivas()).map(formatar);
  }

  async listarDaEmpresa(empresaId: string) {
    return (await this.repository.listarDaEmpresa(empresaId)).map(formatar);
  }

  async criar(empresaId: string, dados: VantagemDados) {
    const empresa = await this.empresas.buscarPorId(empresaId);
    if (!empresa) throw new AppError("Empresa não encontrada", 404);
    if (!dados.foto) throw new AppError("Envie uma foto do produto");

    const vantagem = new Vantagem();
    vantagem.empresa = empresa;
    vantagem.ativa = true;
    this.aplicar(vantagem, dados, true);
    vantagem.foto = await this.fotos.salvar(dados.foto, "vantagens");

    try {
      return formatar(await this.repository.salvar(vantagem));
    } catch (erro) {
      await this.fotos.remover(vantagem.foto);
      throw erro;
    }
  }

  async atualizar(empresaId: string, id: string, dados: VantagemDados) {
    const vantagem = await this.obterDaEmpresa(empresaId, id);
    this.aplicar(vantagem, dados, false);
    if (dados.ativa !== undefined) {
      if (typeof dados.ativa !== "boolean") throw new AppError("O campo ativa deve ser verdadeiro ou falso");
      vantagem.ativa = dados.ativa;
    }

    const fotoAnterior = vantagem.foto;
    if (dados.foto) vantagem.foto = await this.fotos.salvar(dados.foto, "vantagens");
    const salva = await this.repository.salvar(vantagem);
    if (dados.foto) await this.fotos.remover(fotoAnterior);
    return formatar(salva);
  }

  async remover(empresaId: string, id: string) {
    const vantagem = await this.obterDaEmpresa(empresaId, id);
    await this.repository.remover(vantagem.id);
    await this.fotos.remover(vantagem.foto);
  }

  // A vantagem existe e pertence à empresa logada?
  private async obterDaEmpresa(empresaId: string, id: string) {
    const vantagem = await this.repository.buscarPorId(id);
    if (!vantagem) throw new AppError("Vantagem não encontrada", 404);
    if (vantagem.empresa.id !== empresaId) throw new AppError("Esta vantagem pertence a outra empresa", 403);
    return vantagem;
  }

  // No cadastro todos os campos são obrigatórios; na edição só os enviados são validados
  private aplicar(vantagem: Vantagem, dados: VantagemDados, cadastro: boolean) {
    if (cadastro || dados.nome !== undefined) {
      const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
      if (!nome) throw new AppError("Informe o nome da vantagem");
      if (nome.length > LIMITES.nome) throw new AppError(`O nome deve ter no máximo ${LIMITES.nome} caracteres`);
      vantagem.nome = nome;
    }
    if (cadastro || dados.descricao !== undefined) {
      const descricao = typeof dados.descricao === "string" ? dados.descricao.trim() : "";
      if (!descricao) throw new AppError("Informe a descrição da vantagem");
      if (descricao.length > LIMITES.descricao) {
        throw new AppError(`A descrição deve ter no máximo ${LIMITES.descricao} caracteres`);
      }
      vantagem.descricao = descricao;
    }
    if (cadastro || dados.custoMoedas !== undefined) {
      const custo = dados.custoMoedas;
      if (typeof custo !== "number" || !Number.isInteger(custo) || custo <= 0 || custo > LIMITES.custoMoedas) {
        throw new AppError("O custo deve ser um número inteiro de moedas maior que zero");
      }
      vantagem.custoMoedas = custo;
    }
  }
}
