import { useState } from "react";
import { api } from "../api";
import type { ResgateRealizado, Vantagem } from "../types";
import { exibirMoedas } from "../utils/formatos";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  vantagem: Vantagem;
  saldo: number;
  aoTrocar: (resgate: ResgateRealizado) => void;
  aoFechar: () => void;
}

// Confirma a troca de moedas por uma vantagem e, depois dela, mostra o código do cupom
// (o mesmo código vai por e-mail para o aluno e para a empresa)
export default function TrocaVantagem({ vantagem, saldo, aoTrocar, aoFechar }: Props) {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [resgate, setResgate] = useState<ResgateRealizado | null>(null);

  async function confirmar() {
    setProcessando(true);
    setErro("");
    try {
      const feito = await api<ResgateRealizado>("/resgates", {
        method: "POST",
        body: JSON.stringify({ vantagemId: vantagem.id }),
      });
      setResgate(feito);
      aoTrocar(feito);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setProcessando(false);
    }
  }

  if (resgate) {
    return (
      <Modal
        titulo="Troca realizada!"
        largura="pequena"
        aoFechar={aoFechar}
        rodape={
          <button type="button" className="botao botao-primario" onClick={aoFechar}>
            Concluir
          </button>
        }
      >
        <p>
          Você trocou <strong>{exibirMoedas(resgate.valor)}</strong> por <strong>{resgate.vantagem.nome}</strong>, de{" "}
          <strong>{resgate.empresa.nome}</strong>.
        </p>
        <div className="codigo-cupom" aria-label="Código do cupom">
          {resgate.codigo}
        </div>
        <p className="texto-suave">
          Apresente este código na troca presencial. Enviamos o cupom para o seu e-mail, e a empresa recebeu o mesmo
          código para conferir. Seu novo saldo é de {exibirMoedas(resgate.saldoAluno)}.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      titulo="Trocar moedas"
      largura="pequena"
      aoFechar={processando ? () => {} : aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={processando}>
            Cancelar
          </button>
          <button type="button" className="botao botao-primario" onClick={confirmar} disabled={processando}>
            {processando && <Icone nome="carregando" className="girando" />}
            {processando ? "Trocando…" : "Confirmar troca"}
          </button>
        </>
      }
    >
      <p>
        Trocar <strong>{exibirMoedas(vantagem.custoMoedas)}</strong> por <strong>{vantagem.nome}</strong>, de{" "}
        <strong>{vantagem.empresa.nome}</strong>?
      </p>
      <p className="texto-suave">
        Seu saldo vai de {exibirMoedas(saldo)} para {exibirMoedas(saldo - vantagem.custoMoedas)}. Um código de cupom
        será gerado e enviado por e-mail para você e para a empresa.
      </p>
      {erro && (
        <p role="alert" style={{ color: "var(--perigo)", fontWeight: 600 }}>
          {erro}
        </p>
      )}
    </Modal>
  );
}
