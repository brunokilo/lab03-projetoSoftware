import { useId, useRef, useState, type FormEvent } from "react";
import type { Aluno, Professor } from "../types";
import { compararNomes, exibirMoedas } from "../utils/formatos";
import { Campo } from "./Campo";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  professor: Professor;
  alunos: Aluno[];
  aoEnviar: (dados: { alunoId: string; valor: number; motivo: string }) => Promise<void>;
  aoFechar: () => void;
}

const TAMANHO_MAXIMO_MOTIVO = 500;

type Erros = Partial<Record<"alunoId" | "valor" | "motivo", string>>;

export default function FormEnvio({ professor, alunos, aoEnviar, aoFechar }: Props) {
  const idForm = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const saldo = professor.conta?.saldo ?? 0;
  // O professor só reconhece alunos da própria instituição
  const elegiveis = alunos.filter((a) => a.instituicao?.id === professor.instituicao?.id).sort(compararNomes);

  const [alunoId, setAlunoId] = useState("");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroServidor, setErroServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function validar(): Erros {
    const encontrados: Erros = {};
    const quantidade = Number(valor);
    if (!alunoId) encontrados.alunoId = "Selecione o aluno";
    if (!valor) encontrados.valor = "Campo obrigatório";
    else if (!Number.isInteger(quantidade) || quantidade <= 0) encontrados.valor = "Informe um número inteiro maior que zero";
    else if (quantidade > saldo) encontrados.valor = `Saldo insuficiente: disponível ${exibirMoedas(saldo)}`;
    if (!motivo.trim()) encontrados.motivo = "Conte por que o aluno está sendo reconhecido";
    return encontrados;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    setErroServidor("");
    if (Object.keys(encontrados).length > 0) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    setEnviando(true);
    try {
      await aoEnviar({ alunoId, valor: Number(valor), motivo: motivo.trim() });
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo="Enviar moedas"
      descricao={`${professor.nome} · saldo disponível: ${exibirMoedas(saldo)}`}
      largura="pequena"
      aoFechar={enviando ? () => {} : aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={enviando}>
            Cancelar
          </button>
          <button
            type="submit"
            form={idForm}
            className="botao botao-primario"
            disabled={enviando || saldo === 0 || elegiveis.length === 0}
          >
            {enviando ? <Icone nome="carregando" className="girando" /> : <Icone nome="enviar" />}
            {enviando ? "Enviando…" : "Enviar moedas"}
          </button>
        </>
      }
    >
      <form id={idForm} ref={formRef} onSubmit={enviar} noValidate>
        {erroServidor && (
          <div className="erro-servidor" role="alert">
            <Icone nome="alerta" />
            <span>{erroServidor}</span>
          </div>
        )}

        {saldo === 0 ? (
          <div className="nota">
            <Icone nome="moeda" />
            <span>O professor não tem moedas no momento. O próximo crédito de 1.000 moedas chega no início do semestre.</span>
          </div>
        ) : elegiveis.length === 0 ? (
          <div className="nota">
            <Icone nome="aluno" />
            <span>Nenhum aluno de {professor.instituicao?.nome} está cadastrado para receber moedas.</span>
          </div>
        ) : null}

        <div className="grade-form">
          <Campo rotulo="Aluno" obrigatorio erro={erros.alunoId} dica={`Alunos de ${professor.instituicao?.nome}`}>
            {(id) => (
              <select
                id={id}
                value={alunoId}
                onChange={(e) => {
                  setAlunoId(e.target.value);
                  setErros((v) => ({ ...v, alunoId: undefined }));
                }}
                aria-invalid={Boolean(erros.alunoId)}
                autoFocus
              >
                <option value="">Selecione…</option>
                {elegiveis.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} · {a.curso}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo rotulo="Quantidade de moedas" obrigatorio erro={erros.valor}>
            {(id) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                max={saldo}
                step={1}
                value={valor}
                onChange={(e) => {
                  setValor(e.target.value);
                  setErros((v) => ({ ...v, valor: undefined }));
                }}
                aria-invalid={Boolean(erros.valor)}
                placeholder="Ex.: 50"
              />
            )}
          </Campo>
          <Campo
            rotulo="Motivo do reconhecimento"
            obrigatorio
            erro={erros.motivo}
            dica={`${motivo.length}/${TAMANHO_MAXIMO_MOTIVO} · o aluno recebe esta mensagem junto com as moedas`}
          >
            {(id) => (
              <textarea
                id={id}
                rows={4}
                maxLength={TAMANHO_MAXIMO_MOTIVO}
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setErros((v) => ({ ...v, motivo: undefined }));
                }}
                aria-invalid={Boolean(erros.motivo)}
                placeholder="Ex.: Ótima participação no seminário de hoje"
              />
            )}
          </Campo>
        </div>
      </form>
    </Modal>
  );
}
