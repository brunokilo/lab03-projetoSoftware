import { useEffect, useState } from "react";
import { api } from "../api";
import type { Extrato as DadosExtrato, Perfil } from "../types";
import { exibirDataHora } from "../utils/formatos";
import EstadoVazio from "../components/EstadoVazio";
import Icone from "../components/Icone";

export default function Extrato({ perfil }: { perfil: Perfil }) {
  const [dados, setDados] = useState<DadosExtrato | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api<DadosExtrato>("/moedas/extrato")
      .then(setDados)
      .catch((e: Error) => setErro(e.message));
  }, []);

  const professor = perfil === "professor";

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Extrato</h1>
          <p>
            {professor
              ? "Seu saldo atual e as moedas que você já enviou aos alunos."
              : "Seu saldo atual e as moedas que você recebeu dos professores."}
          </p>
        </div>
      </div>

      <section className="cartao indicador saldo-destaque">
        <div className="indicador-topo">
          <span>Saldo atual</span>
          <span className="indicador-icone tom-dourado">
            <Icone nome="moeda" />
          </span>
        </div>
        {dados ? (
          <span className="indicador-valor">{dados.saldo.toLocaleString("pt-BR")}</span>
        ) : erro ? (
          <span className="indicador-valor">—</span>
        ) : (
          <span className="esqueleto" style={{ width: 90, height: 30 }} />
        )}
        <span className="indicador-rodape">moedas</span>
      </section>

      <section className="cartao">
        <header className="cartao-cabecalho">
          <div>
            <h2>Movimentações</h2>
            <p>Da mais recente para a mais antiga.</p>
          </div>
        </header>

        {erro ? (
          <EstadoVazio icone="alerta" titulo="Não foi possível carregar o extrato" descricao={erro} />
        ) : !dados ? (
          <div className="cartao-corpo">
            <span className="esqueleto" style={{ height: 36 }} />
          </div>
        ) : dados.transacoes.length === 0 ? (
          <EstadoVazio
            icone="moeda"
            titulo={professor ? "Nenhum envio ainda" : "Nenhuma moeda recebida ainda"}
            descricao={
              professor
                ? "Quando você enviar moedas a um aluno, o envio aparece aqui."
                : "Quando um professor reconhecer você com moedas, a movimentação aparece aqui."
            }
          />
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>{professor ? "Aluno" : "Professor"}</th>
                  <th>Motivo</th>
                  <th className="direita">Moedas</th>
                </tr>
              </thead>
              <tbody>
                {dados.transacoes.map((t) => (
                  <tr key={t.id}>
                    <td className="numero">{exibirDataHora(t.dataHora)}</td>
                    <td>{t.contraparte.nome}</td>
                    <td className="motivo">{t.motivo}</td>
                    <td className={`numero direita valor-${t.sentido}`}>
                      {t.sentido === "entrada" ? "+" : "−"}
                      {t.valor.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
