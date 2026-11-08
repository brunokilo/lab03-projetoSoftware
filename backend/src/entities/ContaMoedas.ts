import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppError } from "../errors/AppError";

// Conta de moedas de um aluno ou de um professor (o saldo e as regras de crédito e débito ficam aqui)
@Entity("conta_moedas")
export class ContaMoedas {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", default: 0 })
  saldo: number = 0;

  possuiSaldo(valor: number): boolean {
    return this.saldo >= valor;
  }

  creditar(valor: number): void {
    this.validarValor(valor);
    this.saldo += valor;
  }

  debitar(valor: number): void {
    this.validarValor(valor);
    if (!this.possuiSaldo(valor)) throw new AppError("Saldo insuficiente para enviar essa quantidade de moedas");
    this.saldo -= valor;
  }

  private validarValor(valor: number) {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new AppError("A quantidade de moedas deve ser um número inteiro maior que zero");
    }
  }
}
