import { Router } from "express";
import { AlunoController } from "../controllers/AlunoController";
import { EmpresaController } from "../controllers/EmpresaController";
import { InstituicaoController } from "../controllers/InstituicaoController";
import { AuthController } from "../controllers/AuthController";
import { MoedaController } from "../controllers/MoedaController";
import { autenticar, exigirPerfil } from "../middlewares/autenticar";

const routes = Router();

const auth = new AuthController();
routes.post("/login", auth.login);
routes.get("/me", autenticar, auth.me);

const moedas = new MoedaController();
routes.post("/moedas/enviar", autenticar, exigirPerfil("professor"), moedas.enviar);
routes.get("/moedas/saldo", autenticar, exigirPerfil("professor", "aluno"), moedas.saldo);

const alunos = new AlunoController();
routes.get("/alunos", alunos.listar);
routes.get("/alunos/:id", alunos.buscar);
routes.post("/alunos", alunos.criar);
routes.put("/alunos/:id", alunos.atualizar);
routes.delete("/alunos/:id", alunos.remover);

const empresas = new EmpresaController();
routes.get("/empresas", empresas.listar);
routes.get("/empresas/:id", empresas.buscar);
routes.post("/empresas", empresas.criar);
routes.put("/empresas/:id", empresas.atualizar);
routes.delete("/empresas/:id", empresas.remover);

const instituicoes = new InstituicaoController();
routes.get("/instituicoes", instituicoes.listar);

export default routes;
