import { useState } from "react";
import type { Empresa } from "../types";
import { compararNomes, exibirCnpj, normalizar, somenteDigitos } from "../utils/formatos";
import Avatar from "../components/Avatar";
import EstadoVazio from "../components/EstadoVazio";
import Icone from "../components/Icone";
import Paginacao from "../components/Paginacao";

interface Props {
  empresas: Empresa[];
  carregando: boolean;
  indisponivel: boolean;
}

const POR_PAGINA = 8;

// Lista das parceiras para todos os perfis. Cada empresa se cadastra sozinha e só edita o próprio
// cadastro (em "Meu cadastro"), então aqui não há cadastrar, editar ou excluir
export default function Empresas({ empresas, carregando, indisponivel }: Props) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

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
            descricao="Assim que uma empresa se cadastrar, ela aparece aqui com as vantagens que oferece."
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
    </>
  );
}
