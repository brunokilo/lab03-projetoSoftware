import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppError } from "../errors/AppError";

@Entity("conta_moedas")
export class ContaMoedas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", default: 0 })
  saldo: number;

  static nova() {
    const conta = new ContaMoedas();
    conta.saldo = 0;
    return conta;
  }

  possuiSaldo(valor: number) {
    return this.saldo >= valor;
  }

  creditar(valor: number) {
    this.validarValor(valor);
    this.saldo += valor;
  }

  debitar(valor: number) {
    this.validarValor(valor);
    if (!this.possuiSaldo(valor)) throw new AppError("Saldo insuficiente");
    this.saldo -= valor;
  }

  private validarValor(valor: number) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new AppError("O valor deve ser um número inteiro maior que zero");
    }
  }
}
