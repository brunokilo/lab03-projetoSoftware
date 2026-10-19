import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Icone from "./Icone";

interface CampoProps {
  rotulo: string;
  erro?: string;
  dica?: ReactNode;
  obrigatorio?: boolean;
  colunas?: 3 | 4 | 5 | 6 | 8 | 12;
  children: (id: string) => ReactNode;
}

// Envolve um input com rótulo, dica e mensagem de erro, ocupando N de 12 colunas do formulário
export function Campo({ rotulo, erro, dica, obrigatorio, colunas = 12, children }: CampoProps) {
  const id = useId();
  return (
    <div className={`campo col-${colunas}`}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="obrigatorio" aria-hidden="true"> *</span>}
      </label>
      {children(id)}
      {erro ? (
        <span className="campo-erro">{erro}</span>
      ) : (
        dica && <span className="campo-dica">{dica}</span>
      )}
    </div>
  );
}

type InputSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function InputSenha(props: InputSenhaProps) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="input-com-acao">
      <input {...props} type={visivel ? "text" : "password"} />
      <button
        type="button"
        className="botao-icone"
        onClick={() => setVisivel(!visivel)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
      >
        <Icone nome={visivel ? "olhoFechado" : "olho"} tamanho={16} />
      </button>
    </div>
  );
}

export function SecaoFormulario({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <fieldset className="secao-form">
      <legend>{titulo}</legend>
      {descricao && <p className="secao-form-descricao">{descricao}</p>}
      <div className="grade-form">{children}</div>
    </fieldset>
  );
}
