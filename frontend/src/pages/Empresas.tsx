import { useEffect, useState } from "react";
import type { Empresa } from "../types";
import { compararNomes, exibirCnpj, normalizar, somenteDigitos } from "../utils/formatos";
import { substituirRota } from "../hooks/useRota";
import Avatar from "../components/Avatar";
import Confirmacao from "../components/Confirmacao";
import EstadoVazio from "../components/EstadoVazio";
import FormEmpresa from "../components/FormEmpresa";
import Icone from "../components/Icone";
import Paginacao from "../components/Paginacao";

interface Props {
  empresas: Empresa[];
  carregando: boolean;
  indisponivel: boolean;
  abrirCadastro: boolean;
  aoSalvar: (dados: object, id?: string) => Promise<void>;
  aoRemover: (empresa: Empresa) => Promise<void>;
}

const POR_PAGINA = 8;

export default function Empresas({ empresas, carregando, indisponivel, abrirCadastro, aoSalvar, aoRemover }: Props) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [formulario, setFormulario] = useState<{ empresa?: Empresa } | null>(null);
  const [excluindo, setExcluindo] = useState<Empresa | null>(null);

  useEffect(() => {
    if (!abrirCadastro) return;
    setFormulario({});
    substituirRota("/empresas");
  }, [abrirCadastro]);

  const termo = normalizar(busca.trim());
  const digitos = somenteDigitos(busca);
  const filtradas = empresas
    .filter(
      (e) =>
        !termo ||
        normalizar(`${e.nome} ${e.email}`).includes(termo) ||
        (digitos.length >= 3 && somenteDigitos(e.cnpj).includes(digitos)),
    )
    .sort(compararNomes);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Empresas parceiras</h1>
          <p>
            Empresas que oferecem vantagens aos alunos, como descontos em restaurantes, mensalidades ou materiais,
            em troca de moedas estudantis.
          </p>
        </div>
        <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
          <Icone nome="mais" />
          Nova empresa
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
              placeholder="Buscar por nome, e-mail ou CNPJ"
              aria-label="Buscar empresas"
            />
          </div>
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
                      <span className="esqueleto" style={{ width: 180 }} />
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
            descricao="Não foi possível carregar as empresas parceiras. Tente novamente quando o servidor estiver disponível."
          />
        ) : empresas.length === 0 ? (
          <EstadoVazio
            icone="empresa"
            titulo="Nenhuma empresa parceira"
            descricao="Cadastre empresas para que os alunos tenham vantagens disponíveis para trocar suas moedas."
            acao={
              <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
                <Icone nome="mais" />
                Cadastrar empresa
              </button>
            }
          />
        ) : filtradas.length === 0 ? (
          <EstadoVazio
            icone="buscar"
            titulo="Nenhuma empresa encontrada"
            descricao={`Nenhuma empresa corresponde a "${busca.trim()}".`}
            acao={
              <button type="button" className="botao botao-secundario" onClick={() => setBusca("")}>
                Limpar busca
              </button>
            }
          />
        ) : (
          <>
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>CNPJ</th>
                    <th className="ocultar-celular">E-mail de contato</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="celula-pessoa">
                          <Avatar nome={e.nome} quadrado />
                          <strong>{e.nome}</strong>
                        </div>
                      </td>
                      <td className="numero">{exibirCnpj(e.cnpj)}</td>
                      <td className="ocultar-celular">
                        <a className="link" href={`mailto:${e.email}`}>
                          {e.email}
                        </a>
                      </td>
                      <td className="acoes">
                        <button
                          type="button"
                          className="botao-icone"
                          onClick={() => setFormulario({ empresa: e })}
                          title="Editar"
                          aria-label={`Editar ${e.nome}`}
                        >
                          <Icone nome="editar" tamanho={16} />
                        </button>
                        <button
                          type="button"
                          className="botao-icone perigo"
                          onClick={() => setExcluindo(e)}
                          title="Excluir"
                          aria-label={`Excluir ${e.nome}`}
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
              total={filtradas.length}
              rotulo={filtradas.length === 1 ? "empresa" : "empresas"}
              aoMudar={setPagina}
            />
          </>
        )}
      </section>

      {formulario && (
        <FormEmpresa
          empresa={formulario.empresa}
          aoFechar={() => setFormulario(null)}
          aoSalvar={async (dados) => {
            await aoSalvar(dados, formulario.empresa?.id);
            setFormulario(null);
          }}
        />
      )}

      {excluindo && (
        <Confirmacao
          titulo="Excluir empresa parceira"
          textoConfirmar="Excluir empresa"
          aoFechar={() => setExcluindo(null)}
          aoConfirmar={async () => {
            await aoRemover(excluindo);
            setExcluindo(null);
          }}
        >
          <p>
            Tem certeza que deseja excluir <strong>{excluindo.nome}</strong>?
          </p>
          <p className="texto-suave">
            A empresa perderá o acesso ao sistema e as vantagens oferecidas por ela também serão removidas. Essa
            ação não pode ser desfeita.
          </p>
        </Confirmacao>
      )}
    </>
  );
}
