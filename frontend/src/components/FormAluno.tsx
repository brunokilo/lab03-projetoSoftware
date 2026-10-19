import { useId, useRef, useState, type ComponentProps, type FormEvent } from "react";
import type { Aluno, Instituicao } from "../types";
import {
  UFS,
  emailValido,
  exibirCpf,
  mascararCep,
  mascararCpf,
  somenteDigitos,
} from "../utils/formatos";
import { buscarCep } from "../utils/cep";
import { Campo, InputSenha, SecaoFormulario } from "./Campo";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  aluno?: Aluno;
  instituicoes: Instituicao[];
  aoSalvar: (dados: object) => Promise<void>;
  aoFechar: () => void;
}

const SUGESTOES_CURSO = [
  "Administração",
  "Arquitetura e Urbanismo",
  "Ciência da Computação",
  "Direito",
  "Engenharia Civil",
  "Engenharia de Computação",
  "Engenharia de Software",
  "Medicina",
  "Psicologia",
  "Sistemas de Informação",
];

function valoresIniciais(aluno?: Aluno) {
  const e = aluno?.endereco;
  return {
    nome: aluno?.nome ?? "",
    cpf: aluno ? exibirCpf(aluno.cpf) : "",
    rg: aluno?.rg ?? "",
    instituicaoId: aluno?.instituicao?.id ?? "",
    curso: aluno?.curso ?? "",
    cep: e ? mascararCep(e.cep) : "",
    rua: e?.rua ?? "",
    numero: e?.numero ?? "",
    complemento: e?.complemento ?? "",
    bairro: e?.bairro ?? "",
    cidade: e?.cidade ?? "",
    estado: e?.estado ?? "",
    email: aluno?.email ?? "",
    senha: "",
    confirmacaoSenha: "",
  };
}

type Valores = ReturnType<typeof valoresIniciais>;
type Erros = Partial<Record<keyof Valores, string>>;

function validar(v: Valores, editando: boolean): Erros {
  const erros: Erros = {};
  const obrigatorio = "Campo obrigatório";

  if (!v.nome.trim()) erros.nome = obrigatorio;
  else if (v.nome.trim().split(/\s+/).length < 2) erros.nome = "Informe nome e sobrenome";
  if (!v.cpf) erros.cpf = obrigatorio;
  if (!v.rg.trim()) erros.rg = obrigatorio;
  if (!v.instituicaoId) erros.instituicaoId = "Selecione a instituição de ensino";
  if (!v.curso.trim()) erros.curso = obrigatorio;

  if (somenteDigitos(v.cep).length !== 8) erros.cep = "Informe os 8 dígitos do CEP";
  for (const campo of ["rua", "numero", "bairro", "cidade"] as const) {
    if (!v[campo].trim()) erros[campo] = obrigatorio;
  }
  if (!v.estado) erros.estado = "Selecione a UF";

  if (!v.email.trim()) erros.email = obrigatorio;
  else if (!emailValido(v.email)) erros.email = "E-mail inválido";
  // Na edição a senha é opcional: em branco mantém a atual
  if (!editando || v.senha) {
    if (v.senha.length < 6) erros.senha = "A senha deve ter pelo menos 6 caracteres";
    if (v.confirmacaoSenha !== v.senha) erros.confirmacaoSenha = "As senhas não conferem";
  }
  return erros;
}

export default function FormAluno({ aluno, instituicoes, aoSalvar, aoFechar }: Props) {
  const editando = Boolean(aluno);
  const idForm = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const ultimoCep = useRef("");
  const [valores, setValores] = useState(() => valoresIniciais(aluno));
  const [erros, setErros] = useState<Erros>({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [situacaoCep, setSituacaoCep] = useState<"buscando" | "encontrado" | "nao-encontrado" | null>(null);

  function definir(campo: keyof Valores, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function entrada(
    campo: keyof Valores,
    extras: ComponentProps<"input"> = {},
    mascara?: (valor: string) => string,
  ) {
    return (id: string) => (
      <input
        id={id}
        value={valores[campo]}
        onChange={(e) => definir(campo, mascara ? mascara(e.target.value) : e.target.value)}
        aria-invalid={Boolean(erros[campo])}
        {...extras}
      />
    );
  }

  // Ao completar o CEP, busca o endereço e preenche rua, bairro, cidade e UF
  async function alterarCep(valor: string) {
    const cep = mascararCep(valor);
    definir("cep", cep);
    if (somenteDigitos(cep).length !== 8) {
      ultimoCep.current = "";
      setSituacaoCep(null);
      return;
    }
    if (cep === ultimoCep.current) return;
    ultimoCep.current = cep;
    setSituacaoCep("buscando");
    const endereco = await buscarCep(cep);
    if (ultimoCep.current !== cep) return;
    if (!endereco) {
      setSituacaoCep("nao-encontrado");
      return;
    }
    setValores((v) => ({
      ...v,
      rua: endereco.rua || v.rua,
      bairro: endereco.bairro || v.bairro,
      cidade: endereco.cidade || v.cidade,
      estado: endereco.estado || v.estado,
    }));
    setErros((e) => ({ ...e, rua: undefined, bairro: undefined, cidade: undefined, estado: undefined }));
    setSituacaoCep("encontrado");
    numeroRef.current?.focus();
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar(valores, editando);
    setErros(encontrados);
    setErroServidor("");
    if (Object.keys(encontrados).length > 0) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    const v = valores;
    setSalvando(true);
    try {
      await aoSalvar({
        nome: v.nome.trim(),
        email: v.email.trim().toLowerCase(),
        cpf: mascararCpf(v.cpf),
        rg: v.rg.trim(),
        curso: v.curso.trim(),
        instituicaoId: v.instituicaoId,
        endereco: {
          cep: mascararCep(v.cep),
          rua: v.rua.trim(),
          numero: v.numero.trim(),
          complemento: v.complemento.trim() || null,
          bairro: v.bairro.trim(),
          cidade: v.cidade.trim(),
          estado: v.estado,
        },
        ...(v.senha ? { senha: v.senha } : {}),
      });
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  const dicaCep = {
    buscando: (
      <>
        <Icone nome="carregando" tamanho={12} className="girando" /> Buscando endereço…
      </>
    ),
    encontrado: "Endereço preenchido a partir do CEP.",
    "nao-encontrado": "CEP não encontrado. Preencha o endereço manualmente.",
  };

  return (
    <Modal
      titulo={editando ? "Editar aluno" : "Cadastrar aluno"}
      descricao={
        editando
          ? `Atualize os dados de ${aluno?.nome}.`
          : "Preencha os dados do estudante para incluí-lo no programa de mérito."
      }
      aoFechar={aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form={idForm} className="botao botao-primario" disabled={salvando}>
            {salvando && <Icone nome="carregando" className="girando" />}
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar aluno"}
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

        <SecaoFormulario titulo="Dados pessoais">
          <Campo rotulo="Nome completo" obrigatorio erro={erros.nome}>
            {entrada("nome", { autoFocus: true, maxLength: 120, autoComplete: "name", placeholder: "Ex.: Maria Oliveira Santos" })}
          </Campo>
          <Campo rotulo="CPF" obrigatorio erro={erros.cpf} colunas={6}>
            {entrada("cpf", { inputMode: "numeric", placeholder: "000.000.000-00" }, mascararCpf)}
          </Campo>
          <Campo rotulo="RG" obrigatorio erro={erros.rg} colunas={6}>
            {entrada("rg", { maxLength: 20, placeholder: "Ex.: MG-12.345.678" })}
          </Campo>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Dados acadêmicos"
          descricao="Apenas instituições parceiras do programa aparecem na lista."
        >
          <Campo rotulo="Instituição de ensino" obrigatorio erro={erros.instituicaoId} colunas={6}>
            {(id) => (
              <select
                id={id}
                value={valores.instituicaoId}
                onChange={(e) => definir("instituicaoId", e.target.value)}
                aria-invalid={Boolean(erros.instituicaoId)}
              >
                <option value="">Selecione…</option>
                {instituicoes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo rotulo="Curso" obrigatorio erro={erros.curso} colunas={6}>
            {(id) => (
              <>
                {entrada("curso", { maxLength: 120, list: `${idForm}-cursos`, placeholder: "Ex.: Engenharia de Software" })(id)}
                <datalist id={`${idForm}-cursos`}>
                  {SUGESTOES_CURSO.map((curso) => (
                    <option key={curso} value={curso} />
                  ))}
                </datalist>
              </>
            )}
          </Campo>
        </SecaoFormulario>

        <SecaoFormulario titulo="Endereço">
          <Campo
            rotulo="CEP"
            obrigatorio
            erro={erros.cep}
            dica={situacaoCep ? dicaCep[situacaoCep] : "Preenche o endereço sozinho."}
            colunas={4}
          >
            {(id) => (
              <input
                id={id}
                value={valores.cep}
                onChange={(e) => alterarCep(e.target.value)}
                aria-invalid={Boolean(erros.cep)}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
              />
            )}
          </Campo>
          <Campo rotulo="Rua" obrigatorio erro={erros.rua} colunas={8}>
            {entrada("rua", { maxLength: 150, autoComplete: "address-line1" })}
          </Campo>
          <Campo rotulo="Número" obrigatorio erro={erros.numero} colunas={3}>
            {entrada("numero", { maxLength: 20, ref: numeroRef })}
          </Campo>
          <Campo rotulo="Complemento" colunas={4}>
            {entrada("complemento", { maxLength: 100, placeholder: "Apto, bloco…" })}
          </Campo>
          <Campo rotulo="Bairro" obrigatorio erro={erros.bairro} colunas={5}>
            {entrada("bairro", { maxLength: 100 })}
          </Campo>
          <Campo rotulo="Cidade" obrigatorio erro={erros.cidade} colunas={8}>
            {entrada("cidade", { maxLength: 100, autoComplete: "address-level2" })}
          </Campo>
          <Campo rotulo="UF" obrigatorio erro={erros.estado} colunas={4}>
            {(id) => (
              <select
                id={id}
                value={valores.estado}
                onChange={(e) => definir("estado", e.target.value)}
                aria-invalid={Boolean(erros.estado)}
              >
                <option value="">Selecione…</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Acesso ao sistema"
          descricao={
            editando
              ? "Deixe a senha em branco para manter a senha atual."
              : "O aluno usará este e-mail e senha para entrar no sistema e consultar o extrato de moedas."
          }
        >
          <Campo rotulo="E-mail" obrigatorio erro={erros.email}>
            {entrada("email", { type: "email", maxLength: 255, autoComplete: "email", placeholder: "nome@email.com" })}
          </Campo>
          <Campo rotulo={editando ? "Nova senha" : "Senha"} obrigatorio={!editando} erro={erros.senha} colunas={6}>
            {(id) => (
              <InputSenha
                id={id}
                value={valores.senha}
                onChange={(e) => definir("senha", e.target.value)}
                aria-invalid={Boolean(erros.senha)}
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
              />
            )}
          </Campo>
          <Campo rotulo="Confirmar senha" obrigatorio={!editando} erro={erros.confirmacaoSenha} colunas={6}>
            {(id) => (
              <InputSenha
                id={id}
                value={valores.confirmacaoSenha}
                onChange={(e) => definir("confirmacaoSenha", e.target.value)}
                aria-invalid={Boolean(erros.confirmacaoSenha)}
                autoComplete="new-password"
              />
            )}
          </Campo>
        </SecaoFormulario>
      </form>
    </Modal>
  );
}
