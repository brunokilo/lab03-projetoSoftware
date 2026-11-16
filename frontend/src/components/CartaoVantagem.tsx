import type { ReactNode } from "react";
import { urlArquivo } from "../api";
import type { Vantagem } from "../types";
import { exibirMoedas } from "../utils/formatos";
import Icone from "./Icone";

interface Props {
  vantagem: Vantagem;
  mostrarEmpresa?: boolean;
  etiqueta?: ReactNode;
  children?: ReactNode;
}

// Cartão de uma vantagem: foto, nome, empresa, descrição e custo. O rodapé (children) muda por tela
export default function CartaoVantagem({ vantagem, mostrarEmpresa = false, etiqueta, children }: Props) {
  return (
    <article className={`cartao vantagem-cartao${vantagem.ativa ? "" : " inativa"}`}>
      <div className="vantagem-foto">
        {vantagem.foto ? (
          <img src={urlArquivo(vantagem.foto)} alt={vantagem.nome} loading="lazy" />
        ) : (
          <Icone nome="presente" tamanho={32} />
        )}
        {etiqueta}
      </div>
      <div className="vantagem-corpo">
        {mostrarEmpresa && <small className="vantagem-empresa">{vantagem.empresa.nome}</small>}
        <h3>{vantagem.nome}</h3>
        <p>{vantagem.descricao}</p>
        <strong className="vantagem-custo">
          <Icone nome="moeda" tamanho={16} />
          {exibirMoedas(vantagem.custoMoedas)}
        </strong>
      </div>
      {children && <div className="vantagem-rodape">{children}</div>}
    </article>
  );
}
