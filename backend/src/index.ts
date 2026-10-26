import "reflect-metadata";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import routes from "./routes";
import { AppError } from "./errors/AppError";
import { InstituicaoService } from "./services/InstituicaoService";
import { ProfessorService } from "./services/ProfessorService";
import { AlunoService } from "./services/AlunoService";

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
  // Id que não é um UUID válido (ex.: /alunos/abc)
  if (erro?.code === "22P02" || erro?.driverError?.code === "22P02") {
    return res.status(400).json({ erro: "Identificador inválido" });
  }
  // Texto maior que o tamanho da coluna (ex.: UF com 3 letras)
  if (erro?.code === "22001" || erro?.driverError?.code === "22001") {
    return res.status(400).json({ erro: "Um dos campos excede o tamanho permitido" });
  }
  if (erro?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "O corpo da requisição não é um JSON válido" });
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const porta = Number(process.env.PORT) || 3000;
const UM_DIA = 24 * 60 * 60 * 1000;

async function creditarSemestre() {
  try {
    const { semestre, professoresCreditados } = await new ProfessorService().creditarSemestre();
    if (professoresCreditados > 0) {
      console.log(`Crédito do semestre ${semestre} feito para ${professoresCreditados} professor(es)`);
    }
  } catch (erro) {
    console.error("Erro ao creditar o semestre:", erro);
  }
}

AppDataSource.initialize()
  .then(async () => {
    console.log("Banco conectado");
    await new InstituicaoService().popularInicial();
    await new ProfessorService().popularInicial();
    await new AlunoService().garantirContas();
    await creditarSemestre();
    // Confere uma vez por dia se começou um semestre novo
    setInterval(creditarSemestre, UM_DIA);
    app.listen(porta, () => {
      console.log(`Servidor rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao iniciar o servidor:", erro);
    process.exit(1);
  });
