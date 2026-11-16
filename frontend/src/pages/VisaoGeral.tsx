import type { Empresa, Perfil, Resumo } from "../types";
import { compararNomes, exibirCnpj } from "../utils/formatos";
import Avatar from "../components/Avatar";
import Icone, { type NomeIcone } from "../components/Icone";

interface Props {
  resumo: Resumo | null;
  empresas: Empresa[];
  perfil: Perfil;
  carregando: boolean;
  indisponivel: boolean;
}

const MENSAGEM_INDISPONIVEL = "Dados indisponíveis no momento.";

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Etapas do programa, conforme as regras do sistema de mérito
const ETAPAS = [
  {
    titulo: "Professores recebem moedas",
    texto: "A cada semestre, cada professor recebe 1.000 moedas. O saldo não usado acumula para o semestre seguinte.",
  },
  {
    titulo: "Alunos são reconhecidos",
    texto: "O professor envia moedas a um aluno com uma mensagem explicando o motivo do reconhecimento.",
  },
  {
    titulo: "Aluno é notificado",
    texto: "O aluno recebe um e-mail a cada envio e acompanha o saldo e as transações pelo extrato.",
  },
  {
    titulo: "Moedas viram vantagens",
    texto: "O aluno troca moedas por vantagens das empresas parceiras e recebe um cupom por e-mail.",
  },
];

// Atalho principal de cada perfil no topo da visão geral
const ATALHOS: Record<Perfil, { href: string; texto: string; icone: NomeIcone }> = {
  professor: { href: "#/enviar-moedas", texto: "Enviar moedas", icone: "enviar" },
  aluno: { href: "#/vantagens", texto: "Ver vantagens", icone: "presente" },
  empresa: { href: "#/minhas-vantagens/novo", texto: "Nova vantagem", icone: "mais" },
};

export default function VisaoGeral({ resumo, empresas, perfil, carregando, indisponivel }: Props) {
  const atalho = ATALHOS[perfil];
  const porInstituicao = [...(resumo?.alunosPorInstituicao ?? [])]
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));
  const maior = Math.max(1, ...porInstituicao.map((i) => i.total));

  const indicadores: {
    rotulo: string;
    valor: number;
    icone: NomeIcone;
    tom: string;
    link?: { href: string; texto: string };
    rodape?: string;
  }[] = [
    { rotulo: "Alunos cadastrados", valor: resumo?.alunos ?? 0, icone: "aluno", tom: "azul", rodape: `De ${porInstituicao.length} instituições participantes` },
    { rotulo: "Empresas parceiras", valor: resumo?.empresas ?? 0, icone: "empresa", tom: "dourado", link: { href: "#/empresas", texto: "Ver empresas" } },
    perfil === "empresa"
      ? { rotulo: "Vantagens disponíveis", valor: resumo?.vantagensAtivas ?? 0, icone: "presente", tom: "verde", link: { href: "#/minhas-vantagens", texto: "Minhas vantagens" } }
      : { rotulo: "Vantagens disponíveis", valor: resumo?.vantagensAtivas ?? 0, icone: "presente", tom: "verde", link: { href: "#/vantagens", texto: "Ver vantagens" } },
    { rotulo: "Cursos representados", valor: resumo?.cursos ?? 0, icone: "livro", tom: "roxo", rodape: "Entre os alunos cadastrados" },
  ];

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>{saudacao()}!</h1>
          <p>Acompanhe os números do programa de mérito estudantil.</p>
        </div>
        <div className="acoes-rapidas">
          <a href={atalho.href} className="botao botao-primario">
            <Icone nome={atalho.icone} />
            {atalho.texto}
          </a>
        </div>
      </div>

      <div className="indicadores">
        {indicadores.map((ind) => (
          <section key={ind.rotulo} className="cartao indicador">
            <div className="indicador-topo">
              <span>{ind.rotulo}</span>
              <span className={`indicador-icone tom-${ind.tom}`}>
                <Icone nome={ind.icone} />
              </span>
            </div>
            {carregando ? (
              <span className="esqueleto" style={{ width: 64, height: 30 }} />
            ) : (
              <span className="indicador-valor">{indisponivel ? "—" : ind.valor.toLocaleString("pt-BR")}</span>
            )}
            {ind.link ? (
              <a href={ind.link.href} className="link-seta">
                {ind.link.texto}
                <Icone nome="seta" tamanho={14} />
              </a>
            ) : (
              <span className="indicador-rodape">{ind.rodape}</span>
            )}
          </section>
        ))}
      </div>

      <div className="painel-grade">
        <section className="cartao">
          <header className="cartao-cabecalho">
            <div>
              <h2>Alunos por instituição</h2>
              <p>Distribuição dos estudantes entre as instituições parceiras.</p>
            </div>
          </header>
          <div className="cartao-corpo">
            {carregando ? (
              <div className="barras">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="esqueleto" style={{ height: 30 }} />
                ))}
              </div>
            ) : indisponivel ? (
              <p className="texto-suave">{MENSAGEM_INDISPONIVEL}</p>
            ) : porInstituicao.length === 0 ? (
              <p className="texto-suave">Nenhuma instituição cadastrada.</p>
            ) : (
              <ul className="barras">
                {porInstituicao.map((i) => (
                  <li key={i.id}>
                    <div className="barra-linha">
                      <span>{i.nome}</span>
                      <strong>
                        {i.total} {i.total === 1 ? "aluno" : "alunos"}
                      </strong>
                    </div>
                    <div className="barra-trilho">
                      <div className="barra-preenchida" style={{ width: `${(i.total / maior) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="cartao">
          <header className="cartao-cabecalho">
            <div>
              <h2>Como funciona</h2>
              <p>O ciclo das moedas estudantis.</p>
            </div>
            <span className="indicador-icone tom-dourado">
              <Icone nome="moeda" />
            </span>
          </header>
          <div className="cartao-corpo">
            <ol className="passos">
              {ETAPAS.map((etapa, i) => (
                <li key={etapa.titulo} className="passo">
                  <span className="passo-numero">{i + 1}</span>
                  <div>
                    <strong>{etapa.titulo}</strong>
                    <p>{etapa.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cartao painel-largo">
          <header className="cartao-cabecalho">
            <div>
              <h2>Empresas parceiras</h2>
              <p>Empresas que oferecem vantagens aos alunos.</p>
            </div>
            <a href="#/empresas" className="link-seta">
              Ver todas
              <Icone nome="seta" tamanho={14} />
            </a>
          </header>
          {carregando ? (
            <div className="cartao-corpo">
              <span className="esqueleto" style={{ height: 36 }} />
            </div>
          ) : indisponivel ? (
            <div className="cartao-corpo">
              <p className="texto-suave">{MENSAGEM_INDISPONIVEL}</p>
            </div>
          ) : empresas.length === 0 ? (
            <div className="cartao-corpo">
              <p className="texto-suave">
                Nenhuma empresa parceira ainda.
              </p>
            </div>
          ) : (
            <ul className="lista-empresas">
              {[...empresas].sort(compararNomes).slice(0, 6).map((e) => (
                <li key={e.id}>
                  <Avatar nome={e.nome} quadrado />
                  <div>
                    <strong>{e.nome}</strong>
                    <small>{exibirCnpj(e.cnpj)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
