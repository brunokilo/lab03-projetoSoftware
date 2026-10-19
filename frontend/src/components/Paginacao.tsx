import Icone from "./Icone";

interface Props {
  pagina: number;
  porPagina: number;
  total: number;
  rotulo: string;
  aoMudar: (pagina: number) => void;
}

export default function Paginacao({ pagina, porPagina, total, rotulo, aoMudar }: Props) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className="paginacao">
      <span>
        Mostrando <strong>{inicio}–{fim}</strong> de <strong>{total}</strong> {rotulo}
      </span>
      <div className="paginacao-botoes">
        <button
          type="button"
          className="botao-icone com-borda"
          onClick={() => aoMudar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          <Icone nome="anterior" tamanho={16} />
        </button>
        <span className="paginacao-atual">
          {pagina} / {totalPaginas}
        </span>
        <button
          type="button"
          className="botao-icone com-borda"
          onClick={() => aoMudar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
        >
          <Icone nome="proximo" tamanho={16} />
        </button>
      </div>
    </div>
  );
}
