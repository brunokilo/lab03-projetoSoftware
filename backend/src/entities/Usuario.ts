import { Column, PrimaryGeneratedColumn } from "typeorm";

// ESSA CLASSE É ABSTRATA
export abstract class Usuario {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 120 })
  nome: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  senha: string;
}
