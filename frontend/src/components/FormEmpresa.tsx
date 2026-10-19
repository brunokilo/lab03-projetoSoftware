import { useId, useRef, useState, type ComponentProps, type FormEvent } from "react";
import type { Empresa } from "../types";
import { emailValido, exibirCnpj, mascararCnpj } from "../utils/formatos";
import { Campo, InputSenha, SecaoFormulario } from "./Campo";
import Modal from "./Modal";
import Icone from "./Icone";

interface Props {
  empresa?: Empresa;
  aoSalvar: (dados: object) => Promise<void>;
  aoFechar: () => void;
}

function valoresIniciais(empresa?: Empresa) {
  return {
    nome: empresa?.nome ?? "",
    cnpj: empresa ? exibirCnpj(empresa.cnpj) : "",
    email: empresa?.email ?? "",
    senha: "",
    confirmacaoSenha: "",
  };
}

type Valores = ReturnType<typeof valoresIniciais>;
type Erros = Partial<Record<keyof Valores, string>>;

function validar(v: Valores, editando: boolean): Erros {
  const erros: Erros = {};
  if (!v.nome.trim()) erros.nome = "Campo obrigatório";
  if (!v.cnpj) erros.cnpj = "Campo obrigatório";
  if (!v.email.trim()) erros.email = "Campo obrigatório";
  else if (!emailValido(v.email)) erros.email = "E-mail inválido";
  if (!editando || v.senha) {
    if (v.senha.length < 6) erros.senha = "A senha deve ter pelo menos 6 caracteres";
    if (v.confirmacaoSenha !== v.senha) erros.confirmacaoSenha = "As senhas não conferem";
  }
  return erros;
}

export default function FormEmpresa({ empresa, aoSalvar, aoFechar }: Props) {
  const editando = Boolean(empresa);
  const idForm = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [valores, setValores] = useState(() => valoresIniciais(empresa));
  const [erros, setErros] = useState<Erros>({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  function definir(campo: keyof Valores, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function entrada(campo: keyof Valores, extras: ComponentProps<"input"> = {}, mascara?: (valor: string) => string) {
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

    setSalvando(true);
    try {
      await aoSalvar({
        nome: valores.nome.trim(),
        cnpj: mascararCnpj(valores.cnpj),
        email: valores.email.trim().toLowerCase(),
        ...(valores.senha ? { senha: valores.senha } : {}),
      });
    } catch (erro) {
      setErroServidor((erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={editando ? "Editar empresa parceira" : "Cadastrar empresa parceira"}
      descricao={
        editando
          ? `Atualize os dados de ${empresa?.nome}.`
          : "Cadastre a empresa para que ela possa oferecer vantagens aos alunos."
      }
      aoFechar={aoFechar}
      rodape={
        <>
          <button type="button" className="botao botao-secundario" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" form={idForm} className="botao botao-primario" disabled={salvando}>
            {salvando && <Icone nome="carregando" className="girando" />}
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Cadastrar empresa"}
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

        {!editando && (
          <div className="nota">
            <Icone nome="presente" />
            <span>
              Empresas parceiras oferecem vantagens (descontos, produtos ou serviços) que os alunos trocam por
              moedas estudantis. A cada troca, a empresa recebe por e-mail o código do cupom para conferência.
            </span>
          </div>
        )}

        <SecaoFormulario titulo="Dados da empresa">
          <Campo rotulo="Nome da empresa" obrigatorio erro={erros.nome} colunas={8}>
            {entrada("nome", { autoFocus: true, maxLength: 120, autoComplete: "organization", placeholder: "Ex.: Restaurante Sabor Mineiro" })}
          </Campo>
          <Campo rotulo="CNPJ" obrigatorio erro={erros.cnpj} colunas={4}>
            {entrada("cnpj", { inputMode: "numeric", placeholder: "00.000.000/0000-00" }, mascararCnpj)}
          </Campo>
        </SecaoFormulario>

        <SecaoFormulario
          titulo="Acesso ao sistema"
          descricao={
            editando
              ? "Deixe a senha em branco para manter a senha atual."
              : "Com este e-mail e senha a empresa entra no sistema para cadastrar suas vantagens."
          }
        >
          <Campo rotulo="E-mail" obrigatorio erro={erros.email}>
            {entrada("email", { type: "email", maxLength: 255, autoComplete: "email", placeholder: "contato@empresa.com.br" })}
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
