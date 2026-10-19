import type { ReactNode } from "react";
import Icone, { type NomeIcone } from "./Icone";

interface Props {
  icone: NomeIcone;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}

export default function EstadoVazio({ icone, titulo, descricao, acao }: Props) {
  return (
    <div className="estado-vazio">
      <span className="estado-vazio-icone">
        <Icone nome={icone} tamanho={26} />
      </span>
      <h3>{titulo}</h3>
      <p>{descricao}</p>
      {acao}
    </div>
  );
}
