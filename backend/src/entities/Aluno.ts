import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Usuario } from "./Usuario";
import { InstituicaoEnsino } from "./InstituicaoEnsino";
import { Endereco } from "./Endereco";

@Entity("aluno")
export class Aluno extends Usuario {
  @Column({ type: "varchar", length: 14, unique: true })
  cpf: string;

  @Column({ type: "varchar", length: 20 })
  rg: string;

  @Column({ type: "varchar", length: 120 })
  curso: string;

  @ManyToOne(() => InstituicaoEnsino, { nullable: false })
  @JoinColumn({ name: "instituicao_id" })
  instituicao: InstituicaoEnsino;

  @OneToOne(() => Endereco, { cascade: true, eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "endereco_id" })
  endereco: Endereco;
}
