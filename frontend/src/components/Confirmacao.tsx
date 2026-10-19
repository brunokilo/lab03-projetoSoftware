import { useState, type ReactNode } from "react";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  aoConfirmar: () => Promise<void>;
  aoFechar: () => void;
}

// Pede confirmação antes de uma ação destrutiva, como excluir um cadastro
export default function Confirmacao({ titulo, children, textoConfirmar, aoConfirmar, aoFechar }: Props) {
  const [processando, setProcessando] = useState(false);

  async function confirmar() {
    setProcessando(true);
    try {
      await aoConfirmar();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      largura="pequena"
      aoFechar={processando ? () => {} : aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={processando}>
            Cancelar
          </button>
          <button type="button" className="botao botao-perigo" onClick={confirmar} disabled={processando}>
            {processando && <Icone nome="carregando" className="girando" />}
            {processando ? "Excluindo…" : textoConfirmar}
          </button>
        </>
      }
    >
      <div className="confirmacao">
        <span className="confirmacao-icone">
          <Icone nome="alerta" tamanho={22} />
        </span>
        <div>{children}</div>
      </div>
    </Modal>
  );
}
