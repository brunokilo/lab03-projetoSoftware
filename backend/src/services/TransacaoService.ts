import { TransacaoRepository } from "../repositories/TransacaoRepository";
import { ProfessorRepository } from "../repositories/ProfessorRepository";
import { AlunoRepository } from "../repositories/AlunoRepository";
import { TransacaoEnvio } from "../entities/TransacaoEnvio";
import { AppError } from "../errors/AppError";

export interface EnvioDados {
  alunoId?: string;
  valor?: number;
  motivo?: string;
}

const TAMANHO_MAXIMO_MOTIVO = 500;

// Só o necessário para o extrato: sem senha, endereço ou conta de quem participou
function formatarEnvio(envio: TransacaoEnvio) {
  return {
    id: envio.id,
    tipo: "envio" as const,
    dataHora: envio.dataHora,
    valor: envio.valor,
    motivo: envio.motivo,
    professor: { id: envio.professor.id, nome: envio.professor.nome },
    aluno: envio.aluno ? { id: envio.aluno.id, nome: envio.aluno.nome } : null,
  };
}

export class TransacaoService {
  private repository = new TransacaoRepository();
  private professores = new ProfessorRepository();
  private alunos = new AlunoRepository();

  async enviarMoedas(professorId: string, dados: EnvioDados) {
    if (!dados.alunoId) throw new AppError("O campo alunoId é obrigatório");
    if (typeof dados.motivo !== "string" || !dados.motivo.trim()) {
      throw new AppError("Informe o motivo do reconhecimento");
    }
    if (dados.motivo.trim().length > TAMANHO_MAXIMO_MOTIVO) {
      throw new AppError(`O motivo deve ter no máximo ${TAMANHO_MAXIMO_MOTIVO} caracteres`);
    }

    const professor = await this.professores.buscarPorId(professorId);
    if (!professor) throw new AppError("Professor não encontrado", 404);
    const aluno = await this.alunos.buscarPorId(dados.alunoId);
    if (!aluno) throw new AppError("Aluno não encontrado", 404);

    const envio = await this.repository.registrarEnvio(professor, aluno, () =>
      professor.enviarMoedas(aluno, Number(dados.valor), dados.motivo!),
    );
    return {
      transacao: formatarEnvio(envio),
      saldoProfessor: professor.conta.saldo,
      saldoAluno: aluno.conta.saldo,
    };
  }

  // Professor: saldo e moedas que enviou
  async extratoProfessor(professorId: string) {
    const professor = await this.professores.buscarPorId(professorId);
    if (!professor) throw new AppError("Professor não encontrado", 404);
    const envios = await this.repository.listarEnviosDoProfessor(professorId);
    return { saldo: professor.conta.saldo, transacoes: envios.map(formatarEnvio) };
  }

  // Aluno: saldo e moedas que recebeu (as trocas por vantagens entram aqui quando o resgate existir)
  async extratoAluno(alunoId: string) {
    const aluno = await this.alunos.buscarPorId(alunoId);
    if (!aluno) throw new AppError("Aluno não encontrado", 404);
    const envios = await this.repository.listarEnviosParaAluno(alunoId);
    return { saldo: aluno.conta?.saldo ?? 0, transacoes: envios.map(formatarEnvio) };
  }
}
