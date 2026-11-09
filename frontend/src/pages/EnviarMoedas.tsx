import { useEffect, useId, useState, type FormEvent } from "react";
import { api } from "../api";
import type { Aluno, EnvioRealizado, TipoAviso } from "../types";
import { compararNomes } from "../utils/formatos";
import { Campo } from "../components/Campo";
import EstadoVazio from "../components/EstadoVazio";
import Icone from "../components/Icone";

interface Props {
  alunos: Aluno[];
  carregando: boolean;
  notificar: (tipo: TipoAviso, mensagem: string) => void;
}

const MAX_MOTIVO = 500;

export default function EnviarMoedas({ alunos, carregando, notificar }: Props) {
  const idForm = useId();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [alunoId, setAlunoId] = useState("");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erros, setErros] = useState<{ alunoId?: string; valor?: string; motivo?: string }>({});
  const [erroServidor, setErroServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api<{ saldo: number }>("/moedas/saldo")
      .then((r) => setSaldo(r.saldo))
      .catch(() => {});
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const quantidade = Number(valor);
    const encontrados: typeof erros = {};
    if (!alunoId) encontrados.alunoId = "Selecione o aluno";
    if (!valor) encontrados.valor = "Informe a quantidade";
    else if (!Number.isInteger(quantidade) || quantidade <= 0) encontrados.valor = "Informe um número inteiro maior que zero";
    else if (saldo !== null && quantidade > saldo) encontrados.valor = `Saldo insuficiente: você tem ${saldo.toLocaleString("pt-BR")} moedas`;
    if (!motivo.trim()) encontrados.motivo = "Explique o motivo do reconhecimento";
    setErros(encontrados);
    setErroServidor("");
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const envio = await api<EnvioRealizado>("/moedas/enviar", {
        method: "POST",
        body: JSON.stringify({ alunoId, valor: quantidade, motivo: motivo.trim() }),
      });
      setSaldo(envio.saldoProfessor);
      setAlunoId("");
      setValor("");
      setMotivo("");
      notificar("sucesso", `${envio.valor.toLocaleString("pt-BR")} moedas enviadas para ${envio.aluno.nome}.`);
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const ordenados = [...alunos].sort(compararNomes);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Enviar moedas</h1>
          <p>Reconheça um aluno por bom comportamento, participação em aula e outras conquistas.</p>
        </div>
      </div>

      <section className="cartao indicador saldo-destaque">
        <div className="indicador-topo">
          <span>Seu saldo</span>
          <span className="indicador-icone tom-dourado">
            <Icone nome="moeda" />
          </span>
        </div>
        {saldo === null ? (
          <span className="esqueleto" style={{ width: 90, height: 30 }} />
        ) : (
          <span className="indicador-valor">{saldo.toLocaleString("pt-BR")}</span>
        )}
        <span className="indicador-rodape">moedas disponíveis para enviar</span>
      </section>

      <section className="cartao formulario-pagina">
        {!carregando && alunos.length === 0 ? (
          <EstadoVazio
            icone="aluno"
            titulo="Nenhum aluno cadastrado"
            descricao="Ainda não há alunos para receber moedas. Eles se cadastram pela tela de login."
          />
        ) : (
          <form id={idForm} onSubmit={enviar} noValidate>
            {erroServidor && (
              <div className="erro-servidor" role="alert">
                <Icone nome="alerta" />
                <span>{erroServidor}</span>
              </div>
            )}

            <div className="grade-form">
              <Campo rotulo="Aluno" obrigatorio erro={erros.alunoId}>
                {(id) => (
                  <select
                    id={id}
                    value={alunoId}
                    onChange={(e) => {
                      setAlunoId(e.target.value);
                      setErros((x) => ({ ...x, alunoId: undefined }));
                    }}
                    aria-invalid={Boolean(erros.alunoId)}
                    disabled={carregando}
                  >
                    <option value="">{carregando ? "Carregando…" : "Selecione…"}</option>
                    {ordenados.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                        {a.instituicao ? ` · ${a.instituicao.nome}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </Campo>

              <Campo rotulo="Quantidade de moedas" obrigatorio erro={erros.valor} colunas={6}>
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={valor}
                    onChange={(e) => {
                      setValor(e.target.value);
                      setErros((x) => ({ ...x, valor: undefined }));
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
                dica={`${motivo.length}/${MAX_MOTIVO} caracteres. O aluno verá esta mensagem.`}
              >
                {(id) => (
                  <textarea
                    id={id}
                    value={motivo}
                    maxLength={MAX_MOTIVO}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setErros((x) => ({ ...x, motivo: undefined }));
                    }}
                    aria-invalid={Boolean(erros.motivo)}
                    placeholder="Ex.: Excelente participação no debate de hoje."
                  />
                )}
              </Campo>
            </div>

            <div className="formulario-rodape">
              <button type="submit" className="botao botao-primario" disabled={enviando || carregando}>
                {enviando ? <Icone nome="carregando" className="girando" /> : <Icone nome="enviar" />}
                {enviando ? "Enviando…" : "Enviar moedas"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
