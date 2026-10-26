import bcrypt from "bcryptjs";
import { ProfessorRepository } from "../repositories/ProfessorRepository";
import { InstituicaoRepository } from "../repositories/InstituicaoRepository";
import { Professor } from "../entities/Professor";
import { ContaMoedas } from "../entities/ContaMoedas";
import { AppError } from "../errors/AppError";

// Lista enviada pelas instituições no momento da parceria
const PROFESSORES_INICIAIS = [
  { nome: "Ana Paula Ribeiro", email: "ana.ribeiro@pucminas.br", cpf: "526.018.159-06", departamento: "Engenharia de Software", instituicao: "PUC Minas" },
  { nome: "Carlos Eduardo Mendes", email: "carlos.mendes@pucminas.br", cpf: "083.016.613-05", departamento: "Ciência da Computação", instituicao: "PUC Minas" },
  { nome: "Fernanda Oliveira Lima", email: "fernanda.lima@ufmg.br", cpf: "186.091.390-34", departamento: "Ciência da Computação", instituicao: "UFMG" },
  { nome: "Ricardo Alves Pereira", email: "ricardo.pereira@ufmg.br", cpf: "996.030.824-30", departamento: "Matemática", instituicao: "UFMG" },
  { nome: "Juliana Costa Martins", email: "juliana.martins@cefetmg.br", cpf: "628.194.821-12", departamento: "Computação", instituicao: "CEFET-MG" },
  { nome: "Marcos Vinícius Rocha", email: "marcos.rocha@cefetmg.br", cpf: "993.518.190-19", departamento: "Engenharia Elétrica", instituicao: "CEFET-MG" },
];

const SENHA_INICIAL = "professor123";

// Semestre letivo no formato "AAAA-S": janeiro a junho é o 1º, julho a dezembro é o 2º
export function semestreAtual(data = new Date()) {
  return `${data.getFullYear()}-${data.getMonth() < 6 ? 1 : 2}`;
}

function semSenha(professor: Professor) {
  const { senha, ...resto } = professor;
  return resto;
}

export class ProfessorService {
  private repository = new ProfessorRepository();
  private instituicoes = new InstituicaoRepository();

  async listar() {
    return (await this.repository.listar()).map(semSenha);
  }

  async buscar(id: string) {
    const professor = await this.repository.buscarPorId(id);
    if (!professor) throw new AppError("Professor não encontrado", 404);
    return semSenha(professor);
  }

  // Credita as 1.000 moedas do semestre para quem ainda não recebeu; o saldo anterior é mantido
  async creditarSemestre(semestre = semestreAtual()) {
    const creditados = await this.repository.creditarPendentes(semestre, (p) => p.receberCreditoSemestral(semestre));
    return { semestre, professoresCreditados: creditados.length };
  }

  async popularInicial() {
    if ((await this.repository.contar()) > 0) return;
    const instituicoes = await this.instituicoes.listar();
    const senha = await bcrypt.hash(SENHA_INICIAL, 10);

    const professores = PROFESSORES_INICIAIS.flatMap((dados) => {
      const instituicao = instituicoes.find((i) => i.nome === dados.instituicao);
      if (!instituicao) return [];
      const professor = new Professor();
      professor.nome = dados.nome;
      professor.email = dados.email;
      professor.senha = senha;
      professor.cpf = dados.cpf;
      professor.departamento = dados.departamento;
      professor.instituicao = instituicao;
      professor.conta = ContaMoedas.nova();
      professor.ultimoSemestreCreditado = null;
      return [professor];
    });

    await this.repository.salvarVarios(professores);
    console.log("Professores iniciais cadastrados");
  }
}
