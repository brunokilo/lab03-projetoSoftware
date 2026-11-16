import { AlunoRepository } from "../repositories/AlunoRepository";
import { EmpresaRepository } from "../repositories/EmpresaRepository";
import { InstituicaoRepository } from "../repositories/InstituicaoRepository";
import { VantagemRepository } from "../repositories/VantagemRepository";

// Números da visão geral: só totais, sem dados pessoais de ninguém
export class ResumoService {
  private alunos = new AlunoRepository();
  private empresas = new EmpresaRepository();
  private instituicoes = new InstituicaoRepository();
  private vantagens = new VantagemRepository();

  async gerar() {
    const [alunos, empresas, instituicoes, vantagensAtivas] = await Promise.all([
      this.alunos.listar(),
      this.empresas.listar(),
      this.instituicoes.listar(),
      this.vantagens.contarAtivas(),
    ]);
    return {
      alunos: alunos.length,
      empresas: empresas.length,
      vantagensAtivas,
      cursos: new Set(alunos.map((a) => a.curso.trim().toLowerCase())).size,
      alunosPorInstituicao: instituicoes.map((i) => ({
        id: i.id,
        nome: i.nome,
        total: alunos.filter((a) => a.instituicao?.id === i.id).length,
      })),
    };
  }
}
