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
}
