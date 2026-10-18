import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("vantagem")
export class Vantagem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  descricao: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  foto: string | null;

  @Column({ name: "custo_moedas", type: "int" })
  custoMoedas: number;

  @Column({ type: "boolean", default: true })
  ativa: boolean;

  @ManyToOne(() => Empresa, (empresa) => empresa.vantagens, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "empresa_id" })
  empresa: Empresa;
}
