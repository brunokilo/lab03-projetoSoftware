import bcrypt from "bcryptjs";
import { ProfessorRepository } from "../repositories/ProfessorRepository";
import { InstituicaoRepository } from "../repositories/InstituicaoRepository";
import { ContaMoedas } from "../entities/ContaMoedas";
import { Professor } from "../entities/Professor";

const SENHA_PADRAO = "senha123";

interface ProfessorInicial {
  nome: string;
  email: string;
  cpf: string;
  departamento: string;
}
// Nota sobre uso de IA: A ferramenta Claude da Anthropic quem gerou os nomes, cpfs e emails de professores
// Lista de professores de cada instituição envia ao firmar a parceria
const PROFESSORES_POR_INSTITUICAO: Record<string, ProfessorInicial[]> = {
  "PUC Minas": [
    {
      nome: "Cristiano Silva",
      email: "cristiano@pucminas.br",
      cpf: "123.456.780-62",
      departamento: "Engenharia de Software",
    },
    {
      nome: "Rafael Silva",
      email: "rafael@pucminas.br",
      cpf: "234.567.890-92",
      departamento: "Ciência da Computação",
    },
  ],
  UFMG: [
    {
      nome: "Marina Alves",
      email: "marina@ufmg.br",
      cpf: "345.678.901-75",
      departamento: "Ciência da Computação",
    },
    {
      nome: "Henrique Costa",
      email: "henrique@ufmg.br",
      cpf: "456.789.012-49",
      departamento: "Matemática",
    },
  ],
  "CEFET-MG": [
    {
      nome: "Patrícia Lima",
      email: "patricia@cefetmg.br",
      cpf: "567.890.123-03",
      departamento: "Computação",
    },
    {
      nome: "Eduardo Ramos",
      email: "eduardo@cefetmg.br",
      cpf: "678.901.234-69",
      departamento: "Engenharia Elétrica",
    },
  ],
};

// Semestre letivo no formato "AAAA-S": janeiro a junho é o 1º, julho a dezembro é o 2º
export function semestreAtual(data = new Date()) {
  return `${data.getFullYear()}-${data.getMonth() < 6 ? 1 : 2}`;
}

export class ProfessorService {
  private repository = new ProfessorRepository();
  private instituicoes = new InstituicaoRepository();

  async popularInicial() {
    if ((await this.repository.contar()) > 0) return;

    const senha = await bcrypt.hash(SENHA_PADRAO, 10);
    const professores = [];
    for (const instituicao of await this.instituicoes.listar()) {
      for (const dados of PROFESSORES_POR_INSTITUICAO[instituicao.nome] ?? []) {
        const conta = new ContaMoedas();
        conta.creditar(Professor.CREDITO_SEMESTRAL);
        professores.push({ ...dados, senha, conta, instituicao, ultimoSemestreCreditado: semestreAtual() });
      }
    }
    if (professores.length === 0) return;

    await this.repository.salvarVarios(professores);
    console.log("Professores iniciais cadastrados");
  }

  // Credita as 1.000 moedas do semestre para quem ainda não recebeu; o saldo anterior é mantido
  async creditarSemestre(semestre = semestreAtual()) {
    await this.repository.marcarCreditoSemSemestre(semestre);
    const creditados = await this.repository.creditarPendentes(semestre, (p: Professor) => p.receberCreditoSemestral(semestre));
    return { semestre, professoresCreditados: creditados.length };
  }
}
