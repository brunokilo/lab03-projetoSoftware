import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("instituicao_ensino")
export class InstituicaoEnsino {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150 })
  nome: string;
}
