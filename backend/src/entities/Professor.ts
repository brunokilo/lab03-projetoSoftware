import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { InstituicaoEnsino } from "./InstituicaoEnsino";
import { ContaMoedas } from "./ContaMoedas";
import { TransacaoEnvio } from "./TransacaoEnvio";
import type { Aluno } from "./Aluno";
import { AppError } from "../errors/AppError";

@Entity("professor")
export class Professor extends Usuario {
  static readonly CREDITO_SEMESTRAL = 1000;

  @Column({ type: "varchar", length: 14, unique: true })
  cpf: string;

  @Column({ type: "varchar", length: 255 })
  departamento: string;

  @ManyToOne(() => InstituicaoEnsino, { nullable: false })
  @JoinColumn({ name: "instituicao_id" })
  instituicao: InstituicaoEnsino;

  @OneToOne(() => ContaMoedas, { cascade: true, eager: true, nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "conta_id" })
  conta: ContaMoedas;

  // Semestre do último crédito (ex.: "2026-2"), para não creditar duas vezes no mesmo semestre
  @Column({ name: "ultimo_semestre_creditado", type: "varchar", length: 6, nullable: true })
  ultimoSemestreCreditado: string | null;

  // O saldo que sobrou continua na conta e soma com o crédito do novo semestre
  receberCreditoSemestral(semestre: string) {
    if (this.ultimoSemestreCreditado === semestre) return false;
    this.conta.creditar(Professor.CREDITO_SEMESTRAL);
    this.ultimoSemestreCreditado = semestre;
    return true;
  }

  // Debita da conta do professor e credita na do aluno, que precisa ser da mesma instituição
  enviarMoedas(aluno: Aluno, valor: number, motivo: string) {
    if (!motivo.trim()) throw new AppError("Informe o motivo do reconhecimento");
    if (aluno.instituicao.id !== this.instituicao.id) {
      throw new AppError("O professor só pode enviar moedas para alunos da própria instituição");
    }
    if (!aluno.conta) throw new AppError("O aluno ainda não tem conta de moedas");
    if (Number.isInteger(valor) && valor > 0 && !this.conta.possuiSaldo(valor)) {
      throw new AppError(`Saldo insuficiente: o professor tem ${this.conta.saldo} moedas`);
    }

    this.conta.debitar(valor);
    aluno.conta.creditar(valor);

    const envio = new TransacaoEnvio();
    envio.professor = this;
    envio.aluno = aluno;
    envio.valor = valor;
    envio.motivo = motivo.trim();
    return envio;
  }
}
