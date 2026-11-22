import { ChildEntity, Column, JoinColumn, ManyToOne } from "typeorm";
import { Transacao } from "./Transacao";
import { Aluno } from "./Aluno";
import { Vantagem } from "./Vantagem";
import { Empresa } from "./Empresa";


@ChildEntity("RESGATE")
export class Resgate extends Transacao {
  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  codigo: string;

  @Column({ name: "vantagem_nome", type: "varchar", length: 80, nullable: true })
  vantagemNome: string;

  @Column({ name: "empresa_nome", type: "varchar", length: 255, nullable: true })
  empresaNome: string;


  @ManyToOne(() => Aluno, { nullable: true })
  @JoinColumn({ name: "resgate_aluno_id" })
  aluno: Aluno;

  @ManyToOne(() => Vantagem, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "resgate_vantagem_id" })
  vantagem: Vantagem | null;

  @ManyToOne(() => Empresa, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "resgate_empresa_id" })
  empresa: Empresa | null;
}
