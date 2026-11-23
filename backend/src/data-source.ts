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
import { Resgate } from "./entities/Resgate";

// Em produção (Railway) a conexão chega pronta em DATABASE_URL; localmente vale DB_HOST, DB_PORT etc. do .env
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [InstituicaoEnsino, Endereco, Aluno, Professor, Empresa, Vantagem, ContaMoedas, Transacao, TransacaoEnvio, Resgate],
  synchronize: true,
});
