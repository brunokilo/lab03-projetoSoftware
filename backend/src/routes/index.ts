import { Router } from "express";
import { AlunoController } from "../controllers/AlunoController";
import { EmpresaController } from "../controllers/EmpresaController";
import { InstituicaoController } from "../controllers/InstituicaoController";
import { AuthController } from "../controllers/AuthController";
import { MoedaController } from "../controllers/MoedaController";
import { VantagemController } from "../controllers/VantagemController";
import { ResumoController } from "../controllers/ResumoController";
import { autenticar, exigirPerfil, exigirProprioCadastro } from "../middlewares/autenticar";

const routes = Router();

// Públicas: entrar e criar conta (aluno e empresa se cadastram sozinhos; professores são pré-cadastrados)
const auth = new AuthController();
routes.post("/login", auth.login);
routes.get("/me", autenticar, auth.me);

const instituicoes = new InstituicaoController();
routes.get("/instituicoes", instituicoes.listar);

const alunos = new AlunoController();
routes.post("/alunos", alunos.criar);
routes.get("/alunos", autenticar, exigirPerfil("professor"), alunos.listarParaEnvio);
routes.get("/alunos/:id", autenticar, exigirProprioCadastro("aluno"), alunos.buscar);
routes.put("/alunos/:id", autenticar, exigirProprioCadastro("aluno"), alunos.atualizar);
routes.delete("/alunos/:id", autenticar, exigirProprioCadastro("aluno"), alunos.remover);

const empresas = new EmpresaController();
routes.post("/empresas", empresas.criar);
routes.get("/empresas", autenticar, empresas.listar);
routes.get("/empresas/:id", autenticar, exigirProprioCadastro("empresa"), empresas.buscar);
routes.put("/empresas/:id", autenticar, exigirProprioCadastro("empresa"), empresas.atualizar);
routes.delete("/empresas/:id", autenticar, exigirProprioCadastro("empresa"), empresas.remover);

const vantagens = new VantagemController();
routes.get("/vantagens", autenticar, exigirPerfil("aluno", "professor"), vantagens.catalogo);
routes.get("/vantagens/minhas", autenticar, exigirPerfil("empresa"), vantagens.minhas);
routes.post("/vantagens", autenticar, exigirPerfil("empresa"), vantagens.criar);
routes.put("/vantagens/:id", autenticar, exigirPerfil("empresa"), vantagens.atualizar);
routes.delete("/vantagens/:id", autenticar, exigirPerfil("empresa"), vantagens.remover);

const moedas = new MoedaController();
routes.post("/moedas/enviar", autenticar, exigirPerfil("professor"), moedas.enviar);
routes.get("/moedas/extrato", autenticar, exigirPerfil("professor", "aluno"), moedas.extrato);
routes.get("/moedas/saldo", autenticar, exigirPerfil("professor", "aluno"), moedas.saldo);

const resumo = new ResumoController();
routes.get("/resumo", autenticar, resumo.gerar);

export default routes;
