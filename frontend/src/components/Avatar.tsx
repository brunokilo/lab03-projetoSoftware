import { iniciais } from "../utils/formatos";

// Cor fixa por nome, para a mesma pessoa ter sempre o mesmo avatar
function matiz(texto: string) {
  let hash = 0;
  for (const letra of texto) hash = (hash * 31 + letra.charCodeAt(0)) % 360;
  return hash;
}

export default function Avatar({ nome, quadrado = false }: { nome: string; quadrado?: boolean }) {
  const h = matiz(nome);
  return (
    <span
      className={`avatar${quadrado ? " avatar-quadrado" : ""}`}
      style={{ background: `hsl(${h} 70% 92%)`, color: `hsl(${h} 55% 32%)` }}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}
