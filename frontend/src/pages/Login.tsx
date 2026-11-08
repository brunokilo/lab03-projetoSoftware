import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { Aluno, Instituicao, Usuario } from "../types";
import { emailValido } from "../utils/formatos";
import { Campo, InputSenha } from "../components/Campo";
import FormAluno from "../components/FormAluno";
import Icone from "../components/Icone";

interface Props {
  aoEntrar: (token: string, usuario: Usuario) => void;
}

export default function Login({ aoEntrar }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroServidor, setErroServidor] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  // null = cadastro fechado; lista = cadastro aberto (as instituições são públicas)
  const [instituicoes, setInstituicoes] = useState<Instituicao[] | null>(null);
  const [abrindoCadastro, setAbrindoCadastro] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    const encontrados: typeof erros = {};
    if (!email.trim()) encontrados.email = "Informe o e-mail";
    else if (!emailValido(email)) encontrados.email = "E-mail inválido";
    if (!senha) encontrados.senha = "Informe a senha";
    setErros(encontrados);
    setErroServidor("");
    setSucesso("");
    if (Object.keys(encontrados).length > 0) return;

    setEntrando(true);
    try {
      const resposta = await api<{ token: string; usuario: Usuario }>("/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });
      aoEntrar(resposta.token, resposta.usuario);
    } catch (erro) {
      setErroServidor((erro as Error).message);
      setEntrando(false);
    }
  }

  async function abrirCadastro() {
    setErroServidor("");
    setSucesso("");
    setAbrindoCadastro(true);
    try {
      setInstituicoes(await api<Instituicao[]>("/instituicoes"));
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setAbrindoCadastro(false);
    }
  }

  return (
    <main className="pagina-login">
      <section className="cartao-login">
        <div className="login-marca">
          <span className="marca-logo">
            <Icone nome="moeda" tamanho={20} />
          </span>
          <div>
            <strong>Moeda Estudantil</strong>
            <small>Sistema de mérito</small>
          </div>
        </div>

        <h1>Entrar</h1>
        <p className="texto-suave">Use o e-mail e a senha cadastrados para acessar o sistema.</p>

        <form onSubmit={entrar} noValidate>
          {sucesso && (
            <div className="aviso-sucesso" role="status">
              <Icone nome="sucesso" />
              <span>{sucesso}</span>
            </div>
          )}
          {erroServidor && (
            <div className="erro-servidor" role="alert">
              <Icone nome="alerta" />
              <span>{erroServidor}</span>
            </div>
          )}

          <div className="grade-form">
            <Campo rotulo="E-mail" erro={erros.email}>
              {(id) => (
                <input
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErros((x) => ({ ...x, email: undefined }));
                  }}
                  aria-invalid={Boolean(erros.email)}
                  autoComplete="username"
                  autoFocus
                  placeholder="nome@email.com"
                />
              )}
            </Campo>
            <Campo rotulo="Senha" erro={erros.senha}>
              {(id) => (
                <InputSenha
                  id={id}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErros((x) => ({ ...x, senha: undefined }));
                  }}
                  aria-invalid={Boolean(erros.senha)}
                  autoComplete="current-password"
                />
              )}
            </Campo>
          </div>

          <button type="submit" className="botao botao-primario botao-bloco" disabled={entrando}>
            {entrando && <Icone nome="carregando" className="girando" />}
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="login-rodape">
          Ainda não tem conta?{" "}
          <button type="button" className="link-botao" onClick={abrirCadastro} disabled={abrindoCadastro}>
            Criar conta de aluno
          </button>
        </p>
      </section>

      {instituicoes && (
        <FormAluno
          instituicoes={instituicoes}
          aoFechar={() => setInstituicoes(null)}
          aoSalvar={async (dados) => {
            const criado = await api<Aluno>("/alunos", { method: "POST", body: JSON.stringify(dados) });
            setEmail(criado.email);
            setSenha("");
            setSucesso("Cadastro realizado! Digite sua senha para entrar.");
            setInstituicoes(null);
          }}
        />
      )}
    </main>
  );
}
