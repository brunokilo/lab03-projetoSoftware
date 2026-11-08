import { ChildEntity, Column, JoinColumn, ManyToOne } from "typeorm";
import { Transacao } from "./Transacao";
import { Professor } from "./Professor";
import { Aluno } from "./Aluno";

// Moedas enviadas por um professor a um aluno, com o motivo do reconhecimento
@ChildEntity("ENVIO")
export class TransacaoEnvio extends Transacao {
  @Column({ type: "text", nullable: true })
  motivo: string;

  @ManyToOne(() => Professor, { nullable: true })
  @JoinColumn({ name: "professor_id" })
  professor: Professor;

  @ManyToOne(() => Aluno, { nullable: true })
  @JoinColumn({ name: "aluno_id" })
  aluno: Aluno;
}
