import { useEffect, useState } from "react";
import { api } from "../api";
import type { Aluno, Empresa, Instituicao, TipoAviso, Usuario } from "../types";
import { exibirCnpj, exibirCpf } from "../utils/formatos";
import Confirmacao from "../components/Confirmacao";
import EstadoVazio from "../components/EstadoVazio";
import FormAluno from "../components/FormAluno";
import FormEmpresa from "../components/FormEmpresa";
import Icone from "../components/Icone";

interface Props {
  usuario: Usuario;
  instituicoes: Instituicao[];
  notificar: (tipo: TipoAviso, mensagem: string) => void;
  aoAtualizar: (usuario: Usuario) => void;
  aoExcluirConta: () => void;
}

// Aluno e empresa veem e editam só o próprio cadastro (a API recusa o de outra pessoa)
export default function MeuCadastro({ usuario, instituicoes, notificar, aoAtualizar, aoExcluirConta }: Props) {
  const aluno = usuario.perfil === "aluno";
  const caminho = `/${aluno ? "alunos" : "empresas"}/${usuario.id}`;
  const [dados, setDados] = useState<Aluno | Empresa | null>(null);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    api<Aluno | Empresa>(caminho)
      .then(setDados)
      .catch((e: Error) => setErro(e.message));
  }, [caminho]);

  async function salvar(novos: object) {
    const salvo = await api<Aluno | Empresa>(caminho, { method: "PUT", body: JSON.stringify(novos) });
    setDados(salvo);
    setEditando(false);
    aoAtualizar({ ...usuario, nome: salvo.nome, email: salvo.email });
    notificar("sucesso", "Seus dados foram atualizados.");
  }

  async function excluirConta() {
    try {
      await api(caminho, { method: "DELETE" });
      aoExcluirConta();
    } catch (e) {
      notificar("erro", (e as Error).message);
    }
  }

  const linhas: [string, string][] = !dados
    ? []
    : aluno
      ? (() => {
          const a = dados as Aluno;
          const e = a.endereco;
          return [
            ["Nome", a.nome],
            ["E-mail", a.email],
            ["CPF", exibirCpf(a.cpf)],
            ["RG", a.rg],
            ["Instituição", a.instituicao?.nome ?? "—"],
            ["Curso", a.curso],
            ["Endereço", e ? `${e.rua}, ${e.numero}${e.complemento ? ` · ${e.complemento}` : ""} · ${e.bairro} · ${e.cidade}/${e.estado} · ${e.cep}` : "—"],
          ];
        })()
      : [
          ["Empresa", dados.nome],
          ["CNPJ", exibirCnpj((dados as Empresa).cnpj)],
          ["E-mail de acesso", dados.email],
        ];

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Meu cadastro</h1>
          <p>Seus dados no sistema. O e-mail e a senha são os que você usa para entrar.</p>
        </div>
        {dados && (
          <button type="button" className="botao botao-primario" onClick={() => setEditando(true)}>
            <Icone nome="editar" />
            Editar dados
          </button>
        )}
      </div>

      <section className="cartao">
        {erro ? (
          <EstadoVazio icone="alerta" titulo="Não foi possível carregar seu cadastro" descricao={erro} />
        ) : !dados ? (
          <div className="cartao-corpo">
            <span className="esqueleto" style={{ height: 160 }} />
          </div>
        ) : (
          <dl className="dados-cadastro">
            {linhas.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {dados && (
        <section className="cartao zona-perigo">
          <div>
            <strong>Excluir conta</strong>
            <p className="texto-suave">
              {aluno
                ? "Remove seus dados, seu endereço e sua conta de moedas. Contas que já receberam moedas não podem ser excluídas."
                : "Remove a empresa, as vantagens cadastradas e as fotos delas."}
            </p>
          </div>
          <button type="button" className="botao botao-perigo" onClick={() => setExcluindo(true)}>
            <Icone nome="excluir" />
            Excluir conta
          </button>
        </section>
      )}

      {editando && dados && aluno && (
        <FormAluno aluno={dados as Aluno} instituicoes={instituicoes} aoFechar={() => setEditando(false)} aoSalvar={salvar} />
      )}
      {editando && dados && !aluno && (
        <FormEmpresa empresa={dados as Empresa} aoFechar={() => setEditando(false)} aoSalvar={salvar} />
      )}

      {excluindo && (
        <Confirmacao
          titulo="Excluir conta"
          textoConfirmar="Excluir minha conta"
          aoFechar={() => setExcluindo(false)}
          aoConfirmar={async () => {
            await excluirConta();
            setExcluindo(false);
          }}
        >
          <p>Tem certeza que deseja excluir sua conta?</p>
          <p className="texto-suave">Você sai do sistema em seguida. Essa ação não pode ser desfeita.</p>
        </Confirmacao>
      )}
    </>
  );
}
