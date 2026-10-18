import { Column, Entity, OneToMany } from "typeorm";
import { Usuario } from "./Usuario";
import { Vantagem } from "./Vantagem";

@Entity("empresa")
export class Empresa extends Usuario {
  @Column({ type: "varchar", length: 18, unique: true })
  cnpj: string;

  @OneToMany(() => Vantagem, (vantagem) => vantagem.empresa)
  vantagens: Vantagem[];
}
