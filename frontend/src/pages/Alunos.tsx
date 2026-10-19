import { useEffect, useState } from "react";
import type { Aluno, Instituicao } from "../types";
import { compararNomes, exibirCpf, normalizar, somenteDigitos } from "../utils/formatos";
import { substituirRota } from "../hooks/useRota";
import Avatar from "../components/Avatar";
import Confirmacao from "../components/Confirmacao";
import EstadoVazio from "../components/EstadoVazio";
import FormAluno from "../components/FormAluno";
import Icone from "../components/Icone";
import Paginacao from "../components/Paginacao";

interface Props {
  alunos: Aluno[];
  instituicoes: Instituicao[];
  carregando: boolean;
  indisponivel: boolean;
  abrirCadastro: boolean;
  aoSalvar: (dados: object, id?: string) => Promise<void>;
  aoRemover: (aluno: Aluno) => Promise<void>;
}

const POR_PAGINA = 8;

export default function Alunos({
  alunos,
  instituicoes,
  carregando,
  indisponivel,
  abrirCadastro,
  aoSalvar,
  aoRemover,
}: Props) {
  const [busca, setBusca] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");
  const [pagina, setPagina] = useState(1);
  // null = fechado; { aluno: undefined } = cadastro; { aluno } = edição
  const [formulario, setFormulario] = useState<{ aluno?: Aluno } | null>(null);
  const [excluindo, setExcluindo] = useState<Aluno | null>(null);

  // A rota #/alunos/novo (atalho da visão geral) abre o cadastro e volta a URL para #/alunos
  useEffect(() => {
    if (!abrirCadastro) return;
    setFormulario({});
    substituirRota("/alunos");
  }, [abrirCadastro]);

  const termo = normalizar(busca.trim());
  const digitos = somenteDigitos(busca);
  const filtrados = alunos
    .filter((a) => !instituicaoId || a.instituicao?.id === instituicaoId)
    .filter(
      (a) =>
        !termo ||
        normalizar(`${a.nome} ${a.email} ${a.curso}`).includes(termo) ||
        (digitos.length >= 3 && somenteDigitos(a.cpf).includes(digitos)),
    )
    .sort(compararNomes);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const filtrando = Boolean(termo || instituicaoId);

  function limparFiltros() {
    setBusca("");
    setInstituicaoId("");
    setPagina(1);
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Alunos</h1>
          <p>
            Estudantes participantes do programa de mérito. Eles recebem moedas dos professores e podem trocá-las
            por vantagens oferecidas pelas empresas parceiras.
          </p>
        </div>
        <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
          <Icone nome="mais" />
          Novo aluno
        </button>
      </div>

      <section className="cartao">
        <div className="barra-ferramentas">
          <div className="busca">
            <Icone nome="buscar" tamanho={16} />
            <input
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nome, e-mail, CPF ou curso"
              aria-label="Buscar alunos"
            />
          </div>
          <select
            className="filtro"
            value={instituicaoId}
            onChange={(e) => {
              setInstituicaoId(e.target.value);
              setPagina(1);
            }}
            aria-label="Filtrar por instituição"
          >
            <option value="">Todas as instituições</option>
            {instituicoes.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </select>
          {filtrando && (
            <button type="button" className="botao botao-secundario" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>

        {carregando ? (
          <TabelaCarregando />
        ) : indisponivel ? (
          <EstadoVazio
            icone="alerta"
            titulo="Dados indisponíveis"
            descricao="Não foi possível carregar a lista de alunos. Tente novamente quando o servidor estiver disponível."
          />
        ) : alunos.length === 0 ? (
          <EstadoVazio
            icone="aluno"
            titulo="Nenhum aluno cadastrado"
            descricao="Cadastre o primeiro estudante para que ele possa começar a receber moedas dos professores."
            acao={
              <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
                <Icone nome="mais" />
                Cadastrar aluno
              </button>
            }
          />
        ) : filtrados.length === 0 ? (
          <EstadoVazio
            icone="buscar"
            titulo="Nenhum aluno encontrado"
            descricao="Nenhum cadastro corresponde aos filtros aplicados. Tente buscar por outro termo."
            acao={
              <button type="button" className="botao botao-secundario" onClick={limparFiltros}>
                Limpar filtros
              </button>
            }
          />
        ) : (
          <>
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th className="ocultar-celular">CPF</th>
                    <th className="ocultar-celular">Curso</th>
                    <th>Instituição</th>
                    <th className="ocultar-celular">Cidade</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="celula-pessoa">
                          <Avatar nome={a.nome} />
                          <div>
                            <strong>{a.nome}</strong>
                            <small>{a.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="numero ocultar-celular">{exibirCpf(a.cpf)}</td>
                      <td className="ocultar-celular">{a.curso}</td>
                      <td>
                        <span className="etiqueta">{a.instituicao?.nome ?? "—"}</span>
                      </td>
                      <td className="sem-quebra ocultar-celular">
                        {a.endereco ? `${a.endereco.cidade}/${a.endereco.estado}` : "—"}
                      </td>
                      <td className="acoes">
                        <button
                          type="button"
                          className="botao-icone"
                          onClick={() => setFormulario({ aluno: a })}
                          title="Editar"
                          aria-label={`Editar ${a.nome}`}
                        >
                          <Icone nome="editar" tamanho={16} />
                        </button>
                        <button
                          type="button"
                          className="botao-icone perigo"
                          onClick={() => setExcluindo(a)}
                          title="Excluir"
                          aria-label={`Excluir ${a.nome}`}
                        >
                          <Icone nome="excluir" tamanho={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao
              pagina={paginaAtual}
              porPagina={POR_PAGINA}
              total={filtrados.length}
              rotulo={filtrados.length === 1 ? "aluno" : "alunos"}
              aoMudar={setPagina}
            />
          </>
        )}
      </section>

      {formulario && (
        <FormAluno
          aluno={formulario.aluno}
          instituicoes={instituicoes}
          aoFechar={() => setFormulario(null)}
          aoSalvar={async (dados) => {
            await aoSalvar(dados, formulario.aluno?.id);
            setFormulario(null);
          }}
        />
      )}

      {excluindo && (
        <Confirmacao
          titulo="Excluir aluno"
          textoConfirmar="Excluir aluno"
          aoFechar={() => setExcluindo(null)}
          aoConfirmar={async () => {
            await aoRemover(excluindo);
            setExcluindo(null);
          }}
        >
          <p>
            Tem certeza que deseja excluir o cadastro de <strong>{excluindo.nome}</strong>?
          </p>
          <p className="texto-suave">
            Os dados pessoais e o endereço do aluno serão removidos permanentemente. Essa ação não pode ser desfeita.
          </p>
        </Confirmacao>
      )}
    </>
  );
}

function TabelaCarregando() {
  return (
    <div className="tabela-container">
      <table>
        <tbody>
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              <td>
                <div className="celula-pessoa">
                  <span className="esqueleto esqueleto-circulo" />
                  <div className="esqueleto-grupo">
                    <span className="esqueleto" style={{ width: 160 }} />
                    <span className="esqueleto" style={{ width: 120 }} />
                  </div>
                </div>
              </td>
              <td>
                <span className="esqueleto" style={{ width: 110 }} />
              </td>
              <td>
                <span className="esqueleto" style={{ width: 140 }} />
              </td>
              <td>
                <span className="esqueleto" style={{ width: 90 }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
