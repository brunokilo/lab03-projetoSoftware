import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Transacao } from "./Transacao";
import { Professor } from "./Professor";
import { Aluno } from "./Aluno";

@Entity("transacao_envio")
export class TransacaoEnvio extends Transacao {
  @Column({ type: "text" })
  motivo: string;

  @ManyToOne(() => Professor, { nullable: false })
  @JoinColumn({ name: "professor_id" })
  professor: Professor;

  // Se o aluno for excluído, o envio continua no extrato do professor, sem o aluno
  @ManyToOne(() => Aluno, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "aluno_id" })
  aluno: Aluno | null;
}
