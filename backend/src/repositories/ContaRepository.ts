import { EntityTarget, ObjectLiteral } from "typeorm";
import { AppDataSource } from "../data-source";
import { Aluno } from "../entities/Aluno";
import { Empresa } from "../entities/Empresa";
import { Professor } from "../entities/Professor";

export type Perfil = "aluno" | "professor" | "empresa";

export interface Conta {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

const TABELAS: [Perfil, EntityTarget<ObjectLiteral>][] = [
  ["aluno", Aluno],
  ["professor", Professor],
  ["empresa", Empresa],
];


export class ContaRepository {
  async buscarPorEmail(email: string): Promise<Conta | null> {
    const normalizado = email.trim().toLowerCase();
    for (const [perfil, tabela] of TABELAS) {
      const conta = await AppDataSource.getRepository(tabela)
        .createQueryBuilder("c")
        .where("LOWER(c.email) = :email", { email: normalizado })
        .getOne();
      if (conta) return { id: conta.id, nome: conta.nome, email: conta.email, senha: conta.senha, perfil };
    }
    return null;
  }

  async buscarPorId(id: string, perfil: Perfil): Promise<Conta | null> {
    const tabela = TABELAS.find(([p]) => p === perfil)?.[1];
    if (!tabela) return null;
    const conta = await AppDataSource.getRepository(tabela).findOne({ where: { id } });
    if (!conta) return null;
    return { id: conta.id, nome: conta.nome, email: conta.email, senha: conta.senha, perfil };
  }

  // O e-mail já pertence a alguém de outro perfil? (dentro do mesmo perfil, quem barra é o índice único do banco)
  async emailEmUsoEmOutroPerfil(email: string, perfilAtual: Perfil): Promise<boolean> {
    const normalizado = email.trim().toLowerCase();
    for (const [perfil, tabela] of TABELAS) {
      if (perfil === perfilAtual) continue;
      const total = await AppDataSource.getRepository(tabela)
        .createQueryBuilder("c")
        .where("LOWER(c.email) = :email", { email: normalizado })
        .getCount();
      if (total > 0) return true;
    }
    return false;
  }
}
