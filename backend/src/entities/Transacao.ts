import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

// ESSA CLASSE É ABSTRATA: cada tipo de transação (envio e, depois, resgate) tem a própria tabela com estes campos
export abstract class Transacao {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ name: "data_hora", type: "timestamptz" })
  dataHora: Date;

  @Column({ type: "int" })
  valor: number;
}
