import { useEffect, useState } from "react";
import { api } from "../api";
import type { Perfil, ResgateRealizado, TipoAviso, Vantagem } from "../types";
import { exibirMoedas, normalizar } from "../utils/formatos";
import CartaoVantagem from "../components/CartaoVantagem";
import EstadoVazio from "../components/EstadoVazio";
import Icone from "../components/Icone";
import TrocaVantagem from "../components/TrocaVantagem";

// Catálogo das vantagens ativas das empresas parceiras. Para o aluno, mostra se o saldo já é suficiente
export default function Vantagens({ perfil, notificar }: { perfil: Perfil; notificar: (tipo: TipoAviso, mensagem: string) => void }) {
  const aluno = perfil === "aluno";
  const [vantagens, setVantagens] = useState<Vantagem[] | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [trocando, setTrocando] = useState<Vantagem | null>(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    api<Vantagem[]>("/vantagens")
      .then(setVantagens)
      .catch((e: Error) => setErro(e.message));
    if (aluno) {
      api<{ saldo: number }>("/moedas/saldo")
        .then((r) => setSaldo(r.saldo))
        .catch(() => {});
    }
  }, [aluno]);

  const termo = normalizar(busca.trim());
  const filtradas = (vantagens ?? []).filter(
    (v) => !termo || normalizar(`${v.nome} ${v.descricao} ${v.empresa.nome}`).includes(termo),
  );

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Vantagens</h1>
          <p>
            {aluno
              ? "Produtos e descontos das empresas parceiras que você pode trocar pelas suas moedas."
              : "Produtos e descontos que os alunos podem trocar pelas moedas que você envia."}
          </p>
        </div>
        {aluno && saldo !== null && (
          <span className="saldo-pilula">
            <Icone nome="moeda" tamanho={16} />
            Seu saldo: <strong>{exibirMoedas(saldo)}</strong>
          </span>
        )}
      </div>


      {erro ? (
        <section className="cartao">
          <EstadoVazio icone="alerta" titulo="Não foi possível carregar as vantagens" descricao={erro} />
        </section>
      ) : !vantagens ? (
        <div className="vantagens-grade">
          {[0, 1, 2].map((i) => (
            <span key={i} className="esqueleto" style={{ height: 320 }} />
          ))}
        </div>
      ) : vantagens.length === 0 ? (
        <section className="cartao">
          <EstadoVazio
            icone="presente"
            titulo="Nenhuma vantagem disponível"
            descricao="As vantagens aparecem aqui assim que as empresas parceiras cadastrarem."
          />
        </section>
      ) : (
        <>
          <div className="busca busca-larga">
            <Icone nome="buscar" tamanho={16} />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, descrição ou empresa"
              aria-label="Buscar vantagens"
            />
          </div>
          {filtradas.length === 0 ? (
            <section className="cartao">
              <EstadoVazio icone="buscar" titulo="Nenhuma vantagem encontrada" descricao={`Nada corresponde a "${busca.trim()}".`} />
            </section>
          ) : (
            <div className="vantagens-grade">
              {filtradas.map((v) => (
                <CartaoVantagem key={v.id} vantagem={v} mostrarEmpresa>
                  {aluno && saldo !== null && (
                    <>
                      <button
                        type="button"
                        className="botao botao-primario"
                        onClick={() => setTrocando(v)}
                        disabled={saldo < v.custoMoedas}
                      >
                        <Icone nome="presente" tamanho={16} />
                        Trocar
                      </button>
                      <span className={`vantagem-alcance${saldo >= v.custoMoedas ? " suficiente" : ""}`}>
                        {saldo >= v.custoMoedas ? "Saldo suficiente" : `Faltam ${exibirMoedas(v.custoMoedas - saldo)}`}
                      </span>
                    </>
                  )}
                </CartaoVantagem>
              ))}
            </div>
          )}
        </>
      )}

      {trocando && saldo !== null && (
        <TrocaVantagem
          vantagem={trocando}
          saldo={saldo}
          aoTrocar={(r: ResgateRealizado) => {
            setSaldo(r.saldoAluno);
            notificar("sucesso", `${r.vantagem.nome} trocada! Código do cupom: ${r.codigo}.`);
          }}
          aoFechar={() => setTrocando(null)}
        />
      )}
    </>
  );
}
