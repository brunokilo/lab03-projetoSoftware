import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("endereco")
export class Endereco {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150 })
  rua: string;

  @Column({ type: "varchar", length: 20 })
  numero: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  complemento: string | null;

  @Column({ type: "varchar", length: 100 })
  bairro: string;

  @Column({ type: "varchar", length: 100 })
  cidade: string;

  @Column({ type: "varchar", length: 2 })
  estado: string;

  @Column({ type: "varchar", length: 9 })
  cep: string;
}
