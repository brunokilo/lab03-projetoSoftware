import { useState, type ReactNode } from "react";
import Icone, { type NomeIcone } from "./Icone";
import { titulos, type Pagina } from "../rotas";

const menu: { secao: string; itens: { pagina: Pagina; rotulo: string; icone: NomeIcone }[] }[] = [
  {
    secao: "Geral",
    itens: [{ pagina: "visao-geral", rotulo: "Visão geral", icone: "painel" }],
  },
  {
    secao: "Cadastros",
    itens: [
      { pagina: "alunos", rotulo: "Alunos", icone: "aluno" },
      { pagina: "empresas", rotulo: "Empresas parceiras", icone: "empresa" },
    ],
  },
];

interface Props {
  pagina: Pagina;
  servidorOnline: boolean | null;
  children: ReactNode;
}

export default function Layout({ pagina, servidorOnline, children }: Props) {
  // Guarda em qual página o menu (celular) foi aberto: ao trocar de página ele fecha sozinho
  const [menuAbertoEm, setMenuAbertoEm] = useState<Pagina | null>(null);
  const menuAberto = menuAbertoEm === pagina;
  const setMenuAberto = (aberto: boolean) => setMenuAbertoEm(aberto ? pagina : null);

  const status =
    servidorOnline === null
      ? { classe: "verificando", texto: "Conectando ao servidor…" }
      : servidorOnline
        ? { classe: "online", texto: "Servidor online" }
        : { classe: "offline", texto: "Servidor indisponível" };

  return (
    <div className={`app${menuAberto ? " menu-aberto" : ""}`}>
      <aside className="barra-lateral">
        <a href="#/" className="marca" onClick={() => setMenuAberto(false)}>
          <span className="marca-logo">
            <Icone nome="moeda" tamanho={20} />
          </span>
          <span>
            <strong>Moeda Estudantil</strong>
            <small>Sistema de mérito</small>
          </span>
        </a>

        <nav className="menu" aria-label="Navegação principal">
          {menu.map((grupo) => (
            <div key={grupo.secao} className="menu-grupo">
              <span className="menu-secao">{grupo.secao}</span>
              {grupo.itens.map((item) => (
                <a
                  key={item.pagina}
                  href={item.pagina === "visao-geral" ? "#/" : `#/${item.pagina}`}
                  className={`menu-item${pagina === item.pagina ? " ativo" : ""}`}
                  aria-current={pagina === item.pagina ? "page" : undefined}
                  onClick={() => setMenuAberto(false)}
                >
                  <Icone nome={item.icone} />
                  {item.rotulo}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="barra-lateral-rodape">
          <span className={`status status-${status.classe}`}>
            <span className="status-ponto" />
            {status.texto}
          </span>
          <small>Versão 1.0 · Lab. de Projeto de Software</small>
        </div>
      </aside>

      <div className="fundo-menu" onClick={() => setMenuAberto(false)} />

      <div className="conteudo">
        <header className="barra-topo">
          <button
            type="button"
            className="botao-icone botao-menu"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <Icone nome="menu" />
          </button>
          <nav className="trilha" aria-label="Você está em">
            <span>Moeda Estudantil</span>
            <Icone nome="proximo" tamanho={14} />
            <strong>{titulos[pagina]}</strong>
          </nav>
          <span className="data-hoje">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </header>
        <main className="principal">{children}</main>
      </div>
    </div>
  );
}
