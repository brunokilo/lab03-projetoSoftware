import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { urlArquivo } from "../api";
import type { Vantagem } from "../types";
import { Campo } from "./Campo";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  vantagem?: Vantagem;
  aoSalvar: (dados: object) => Promise<void>;
  aoFechar: () => void;
}

const LIMITE = { nome: 80, descricao: 1000 };
const TIPOS_FOTO = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;

type Erros = Partial<Record<"nome" | "descricao" | "custo" | "foto", string>>;

function lerComoDataUrl(arquivo: File) {
  return new Promise<string>((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => resolver(String(leitor.result));
    leitor.onerror = () => rejeitar(new Error("Não foi possível ler a imagem"));
    leitor.readAsDataURL(arquivo);
  });
}

export default function FormVantagem({ vantagem, aoSalvar, aoFechar }: Props) {
  const editando = Boolean(vantagem);
  const idForm = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [nome, setNome] = useState(vantagem?.nome ?? "");
  const [descricao, setDescricao] = useState(vantagem?.descricao ?? "");
  const [custo, setCusto] = useState(vantagem ? String(vantagem.custoMoedas) : "");
  // Foto nova escolhida agora (data URL); sem ela, na edição continua a foto atual
  const [foto, setFoto] = useState<string | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const previa = foto ?? (vantagem?.foto ? urlArquivo(vantagem.foto) : null);

  async function escolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (!TIPOS_FOTO.includes(arquivo.type)) {
      setErros((v) => ({ ...v, foto: "Escolha uma imagem PNG, JPEG ou WebP" }));
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErros((v) => ({ ...v, foto: "A foto deve ter no máximo 2 MB" }));
      return;
    }
    try {
      setFoto(await lerComoDataUrl(arquivo));
      setErros((v) => ({ ...v, foto: undefined }));
    } catch (erro) {
      setErros((v) => ({ ...v, foto: (erro as Error).message }));
    }
  }

  function validar(): Erros {
    const encontrados: Erros = {};
    const quantidade = Number(custo);
    if (!nome.trim()) encontrados.nome = "Campo obrigatório";
    if (!descricao.trim()) encontrados.descricao = "Descreva o que o aluno recebe na troca";
    if (!custo) encontrados.custo = "Campo obrigatório";
    else if (!Number.isInteger(quantidade) || quantidade <= 0) encontrados.custo = "Informe um número inteiro maior que zero";
    if (!previa) encontrados.foto = "Envie uma foto do produto";
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

    setSalvando(true);
    try {
      await aoSalvar({
        nome: nome.trim(),
        descricao: descricao.trim(),
        custoMoedas: Number(custo),
        ...(foto ? { foto } : {}),
      });
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? "Editar vantagem" : "Nova vantagem"}
      descricao={
        editando
          ? `Atualize os dados de ${vantagem?.nome}.`
          : "Ofereça um produto ou desconto que os alunos podem trocar por moedas."
      }
      aoFechar={salvando ? () => {} : aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form={idForm} className="botao botao-primario" disabled={salvando}>
            {salvando && <Icone nome="carregando" className="girando" />}
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar vantagem"}
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

        <div className="grade-form">
          <Campo rotulo="Foto do produto" obrigatorio erro={erros.foto} dica="PNG, JPEG ou WebP, até 2 MB">
            {(id) => (
              <div className="seletor-foto">
                <div className="seletor-foto-previa">
                  {previa ? <img src={previa} alt="Prévia da foto" /> : <Icone nome="presente" tamanho={28} />}
                </div>
                <label className="botao botao-secundario" htmlFor={id}>
                  <Icone nome="editar" tamanho={16} />
                  {previa ? "Trocar foto" : "Escolher foto"}
                </label>
                <input
                  id={id}
                  className="sr-only"
                  type="file"
                  accept={TIPOS_FOTO.join(",")}
                  onChange={escolherFoto}
                  aria-invalid={Boolean(erros.foto)}
                />
              </div>
            )}
          </Campo>
          <Campo rotulo="Nome" obrigatorio erro={erros.nome} colunas={8}>
            {(id) => (
              <input
                id={id}
                value={nome}
                maxLength={LIMITE.nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErros((v) => ({ ...v, nome: undefined }));
                }}
                aria-invalid={Boolean(erros.nome)}
                placeholder="Ex.: Almoço executivo"
                autoFocus
              />
            )}
          </Campo>
          <Campo rotulo="Custo em moedas" obrigatorio erro={erros.custo} colunas={4}>
            {(id) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={custo}
                onChange={(e) => {
                  setCusto(e.target.value);
                  setErros((v) => ({ ...v, custo: undefined }));
                }}
                aria-invalid={Boolean(erros.custo)}
                placeholder="Ex.: 120"
              />
            )}
          </Campo>
          <Campo
            rotulo="Descrição"
            obrigatorio
            erro={erros.descricao}
            dica={`${descricao.length}/${LIMITE.descricao} · o que o aluno recebe e como usar na troca presencial`}
          >
            {(id) => (
              <textarea
                id={id}
                rows={4}
                maxLength={LIMITE.descricao}
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  setErros((v) => ({ ...v, descricao: undefined }));
                }}
                aria-invalid={Boolean(erros.descricao)}
                placeholder="Ex.: Prato do dia com suco natural, válido de segunda a sexta na cantina do campus."
              />
            )}
          </Campo>
        </div>
      </form>
    </Modal>
  );
}
