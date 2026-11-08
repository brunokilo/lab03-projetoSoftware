import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { InstituicaoEnsino } from "./entities/InstituicaoEnsino";
import { Endereco } from "./entities/Endereco";
import { Aluno } from "./entities/Aluno";
import { Empresa } from "./entities/Empresa";
import { Professor } from "./entities/Professor";
import { Vantagem } from "./entities/Vantagem";
import { ContaMoedas } from "./entities/ContaMoedas";
import { Transacao } from "./entities/Transacao";
import { TransacaoEnvio } from "./entities/TransacaoEnvio";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [InstituicaoEnsino, Endereco, Aluno, Professor, Empresa, Vantagem, ContaMoedas, Transacao, TransacaoEnvio],
  synchronize: true,
});
