import { useSyncExternalStore } from "react";

// Rotas pela hash da URL (#/alunos), para a página continuar a mesma ao recarregar
function assinar(aoMudar: () => void) {
  window.addEventListener("hashchange", aoMudar);
  return () => window.removeEventListener("hashchange", aoMudar);
}

function lerRota() {
  return window.location.hash.replace(/^#/, "") || "/";
}

export function useRota() {
  return useSyncExternalStore(assinar, lerRota);
}

export function navegar(rota: string) {
  window.location.hash = rota;
}

// Troca a URL sem criar entrada no histórico (usado para limpar o "/novo" depois de abrir o formulário)
export function substituirRota(rota: string) {
  history.replaceState(null, "", `#${rota}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
