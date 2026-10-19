import type { Aviso } from "../types";
import Icone from "./Icone";

interface Props {
  avisos: Aviso[];
  aoFechar: (id: number) => void;
}

// Notificações temporárias no canto da tela (sucesso ou erro de uma operação)
export default function Avisos({ avisos, aoFechar }: Props) {
  return (
    <div className="avisos" role="status" aria-live="polite">
      {avisos.map((aviso) => (
        <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`}>
          <Icone nome={aviso.tipo === "sucesso" ? "sucesso" : "alerta"} />
          <span>{aviso.mensagem}</span>
          <button type="button" className="botao-icone" onClick={() => aoFechar(aviso.id)} aria-label="Fechar aviso">
            <Icone nome="fechar" tamanho={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
