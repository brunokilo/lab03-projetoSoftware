import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { InstituicaoEnsino } from "./InstituicaoEnsino";

// Professores não têm cadastro a instituição envia a lista na parceria, dentro do ProfessorService.popularInicial
@Entity("professor")
export class Professor extends Usuario {
  @Column({ type: "varchar", length: 14, unique: true })
  cpf: string;

  @Column({ type: "varchar", length: 120 })
  departamento: string;

  @Column({ type: "int", default: 0 })
  saldo: number;

  @ManyToOne(() => InstituicaoEnsino, { nullable: false })
  @JoinColumn({ name: "instituicao_id" })
  instituicao: InstituicaoEnsino;
}
