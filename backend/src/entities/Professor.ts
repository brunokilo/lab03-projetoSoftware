import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { InstituicaoEnsino } from "./InstituicaoEnsino";
import { ContaMoedas } from "./ContaMoedas";

// Professores não têm cadastro a instituição envia a lista na parceria, dentro do ProfessorService.popularInicial
@Entity("professor")
export class Professor extends Usuario {
  @Column({ type: "varchar", length: 14, unique: true })
  cpf: string;

  @Column({ type: "varchar", length: 120 })
  departamento: string;

  @ManyToOne(() => InstituicaoEnsino, { nullable: false })
  @JoinColumn({ name: "instituicao_id" })
  instituicao: InstituicaoEnsino;

  @OneToOne(() => ContaMoedas, { cascade: true, eager: true, nullable: false })
  @JoinColumn({ name: "conta_id" })
  conta: ContaMoedas;

  // Semestre do último crédito (ex.: "2026-2"), para não creditar duas vezes no mesmo semestre
  @Column({ name: "ultimo_semestre_creditado", type: "varchar", length: 6, nullable: true })
  ultimoSemestreCreditado: string | null;

  static readonly CREDITO_SEMESTRAL = 1000;

  // O saldo que sobrou continua na conta e soma com o crédito do novo semestre
  receberCreditoSemestral(semestre: string) {
    if (this.ultimoSemestreCreditado === semestre) return false;
    this.conta.creditar(Professor.CREDITO_SEMESTRAL);
    this.ultimoSemestreCreditado = semestre;
    return true;
  }
}
