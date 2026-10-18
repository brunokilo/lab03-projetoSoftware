import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ mensagem: "API Moeda Estudantil no ar" });
});

const porta = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Banco conectado");
    app.listen(porta, () => {
      console.log(`Servidor rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar no banco:", erro);
    process.exit(1);
  });
