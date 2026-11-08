import { useEffect, useState } from "react";
import { api } from "../api";
import type { Extrato as DadosExtrato } from "../types";
import { exibirDataHora, exibirMoedas } from "../utils/formatos";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  tipo: "professor" | "aluno";
  pessoa: { id: string; nome: string };
  aoFechar: () => void;
}

// Busca o extrato sempre que abre, para mostrar o saldo e as transações mais recentes
export default function Extrato({ tipo, pessoa, aoFechar }: Props) {
  const [extrato, setExtrato] = useState<DadosExtrato | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    api<DadosExtrato>(`/${tipo === "professor" ? "professores" : "alunos"}/${pessoa.id}/extrato`)
      .then((dados) => ativo && setExtrato(dados))
      .catch((e) => ativo && setErro((e as Error).message));
    return () => {
      ativo = false;
    };
  }, [tipo, pessoa.id]);

  const professor = tipo === "professor";
  const total = extrato?.transacoes.reduce((soma, t) => soma + t.valor, 0) ?? 0;

  return (
    <Modal
      titulo="Extrato da conta"
      descricao={pessoa.nome}
      aoFechar={aoFechar}
      rodape={
        <button type="button" className="botao botao-secundario" onClick={aoFechar}>
          Fechar
        </button>
      }
    >
      {erro ? (
        <div className="erro-servidor" role="alert">
          <Icone nome="alerta" />
          <span>{erro}</span>
        </div>
      ) : !extrato ? (
        <div className="extrato-carregando" aria-busy="true">
          <span className="esqueleto" style={{ height: 72 }} />
          <span className="esqueleto" style={{ height: 56 }} />
          <span className="esqueleto" style={{ height: 56 }} />
        </div>
      ) : (
        <>
          <div className="extrato-resumo">
            <div>
              <span>Saldo atual</span>
              <strong>{exibirMoedas(extrato.saldo)}</strong>
            </div>
            <div>
              <span>{professor ? "Total enviado" : "Total recebido"}</span>
              <strong>{exibirMoedas(total)}</strong>
            </div>
          </div>

          {extrato.transacoes.length === 0 ? (
            <p className="texto-suave extrato-vazio">
              {professor ? "Este professor ainda não enviou moedas." : "Este aluno ainda não recebeu moedas."}
            </p>
          ) : (
            <ul className="extrato-lista">
              {extrato.transacoes.map((t) => (
                <li key={t.id}>
                  <span className={`extrato-icone ${professor ? "saida" : "entrada"}`}>
                    <Icone nome={professor ? "enviar" : "moeda"} tamanho={16} />
                  </span>
                  <div className="extrato-detalhe">
                    <strong>
                      {professor
                        ? `Enviado para ${t.aluno?.nome ?? "aluno removido"}`
                        : `Recebido de ${t.professor.nome}`}
                    </strong>
                    <p>{t.motivo}</p>
                    <small>{exibirDataHora(t.dataHora)}</small>
                  </div>
                  <span className={`extrato-valor ${professor ? "saida" : "entrada"}`}>
                    {professor ? "−" : "+"}
                    {t.valor.toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
