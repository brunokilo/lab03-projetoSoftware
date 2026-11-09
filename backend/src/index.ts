import "reflect-metadata";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import routes from "./routes";
import { AppError } from "./errors/AppError";
import { InstituicaoService } from "./services/InstituicaoService";
import { ProfessorService } from "./services/ProfessorService";

if (!process.env.JWT_SECRET) {
  console.error("Defina JWT_SECRET no arquivo .env do back-end");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensagem: "API Moeda Estudantil no ar" });
});

app.use(routes);

app.use((erro: any, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.mensagem });
  }
  if (erro?.code === "23505" || erro?.driverError?.code === "23505") {
    return res.status(409).json({ erro: "Já existe um cadastro com esse email, CPF ou CNPJ" });
  }
  if (erro?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "O corpo da requisição não é um JSON válido" });
  }
  if (erro?.code === "23503" || erro?.driverError?.code === "23503") {
    return res.status(409).json({ erro: "Não é possível excluir: o cadastro possui transações de moedas" });
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const porta = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Banco conectado");
    await new InstituicaoService().popularInicial();
    await new ProfessorService().popularInicial();
    app.listen(porta, () => {
      console.log(`Servidor rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar no banco:", erro);
    process.exit(1);
  });
