import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";

// Classe-base das movimentações de moedas. As filhas (TransacaoEnvio e, depois, Resgate) ficam na mesma
// tabela "transacao", e a coluna "tipo" diz qual é qual
@Entity("transacao")
@TableInheritance({ column: { type: "varchar", name: "tipo" } })
export abstract class Transacao {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ name: "data_hora", type: "timestamp" })
  dataHora: Date;

  @Column({ type: "int" })
  valor: number;
}
