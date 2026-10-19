import { useEffect, useId, type ReactNode } from "react";
import Icone from "./Icone";

interface Props {
  titulo: string;
  descricao?: string;
  largura?: "pequena" | "grande";
  aoFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
}

export default function Modal({ titulo, descricao, largura = "grande", aoFechar, children, rodape }: Props) {
  const idTitulo = useId();

  // Fecha com Esc e trava a rolagem da página enquanto o modal está aberto
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", tecla);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aoFechar]);

  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div
        className={`modal modal-${largura}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        <header className="modal-cabecalho">
          <div>
            <h2 id={idTitulo}>{titulo}</h2>
            {descricao && <p>{descricao}</p>}
          </div>
          <button type="button" className="botao-icone" onClick={aoFechar} aria-label="Fechar">
            <Icone nome="fechar" />
          </button>
        </header>
        <div className="modal-corpo">{children}</div>
        {rodape && <footer className="modal-rodape">{rodape}</footer>}
      </div>
    </div>
  );
}
