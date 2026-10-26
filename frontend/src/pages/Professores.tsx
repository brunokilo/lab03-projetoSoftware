import { useState } from "react";
import type { Instituicao, Professor } from "../types";
import { compararNomes, exibirCpf, exibirMoedas, normalizar, somenteDigitos } from "../utils/formatos";
import Avatar from "../components/Avatar";
import EstadoVazio from "../components/EstadoVazio";
import Icone from "../components/Icone";
import Paginacao from "../components/Paginacao";

interface Props {
  professores: Professor[];
  instituicoes: Instituicao[];
  carregando: boolean;
  indisponivel: boolean;
}

const POR_PAGINA = 8;

// Professores vêm pré-cadastrados pelas instituições, então a tela é só de consulta
export default function Professores({ professores, instituicoes, carregando, indisponivel }: Props) {
  const [busca, setBusca] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");
  const [pagina, setPagina] = useState(1);

  const termo = normalizar(busca.trim());
  const digitos = somenteDigitos(busca);
  const filtrados = professores
    .filter((p) => !instituicaoId || p.instituicao?.id === instituicaoId)
    .filter(
      (p) =>
        !termo ||
        normalizar(`${p.nome} ${p.email} ${p.departamento}`).includes(termo) ||
        (digitos.length >= 3 && somenteDigitos(p.cpf).includes(digitos)),
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
          <h1>Professores</h1>
          <p>
            Professores cadastrados pelas instituições participantes. A cada semestre, cada um recebe 1.000 moedas
            para distribuir aos alunos, e o saldo que não for usado continua na conta para o semestre seguinte.
          </p>
        </div>
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
              placeholder="Buscar por nome, e-mail, departamento ou CPF"
              aria-label="Buscar professores"
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
          <div className="tabela-container">
            <table>
              <tbody>
                {Array.from({ length: 4 }, (_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="celula-pessoa">
                        <span className="esqueleto esqueleto-circulo" />
                        <span className="esqueleto" style={{ width: 180 }} />
                      </div>
                    </td>
                    <td>
                      <span className="esqueleto" style={{ width: 140 }} />
                    </td>
                    <td>
                      <span className="esqueleto" style={{ width: 100 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : indisponivel ? (
          <EstadoVazio
            icone="alerta"
            titulo="Dados indisponíveis"
            descricao="Não foi possível carregar a lista de professores. Tente novamente quando o servidor estiver disponível."
          />
        ) : professores.length === 0 ? (
          <EstadoVazio
            icone="professor"
            titulo="Nenhum professor cadastrado"
            descricao="Os professores aparecem aqui quando a instituição envia a lista no momento da parceria."
          />
        ) : filtrados.length === 0 ? (
          <EstadoVazio
            icone="buscar"
            titulo="Nenhum professor encontrado"
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
                    <th>Professor</th>
                    <th className="ocultar-celular">CPF</th>
                    <th className="ocultar-celular">Departamento</th>
                    <th>Instituição</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="celula-pessoa">
                          <Avatar nome={p.nome} />
                          <div>
                            <strong>{p.nome}</strong>
                            <small>{p.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="numero ocultar-celular">{exibirCpf(p.cpf)}</td>
                      <td className="ocultar-celular">{p.departamento}</td>
                      <td>
                        <span className="etiqueta">{p.instituicao?.nome ?? "—"}</span>
                      </td>
                      <td className="numero">{exibirMoedas(p.conta?.saldo ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao
              pagina={paginaAtual}
              porPagina={POR_PAGINA}
              total={filtrados.length}
              rotulo={filtrados.length === 1 ? "professor" : "professores"}
              aoMudar={setPagina}
            />
          </>
        )}
      </section>
    </>
  );
}
