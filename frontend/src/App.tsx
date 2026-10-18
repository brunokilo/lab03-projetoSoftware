import { useEffect, useState } from "react";
import { api } from "./api";
import type { Aluno, Empresa, Instituicao } from "./types";
import Alunos from "./pages/Alunos";
import Empresas from "./pages/Empresas";

// APP CARREGANDO OS DADOS PARA QUE O PROGRAMA NAO FIQUE DANDO GET SEMPRE QUE TROCAR DE PAGINA
export default function App() {
  const [pagina, setPagina] = useState<"alunos" | "empresas">("alunos");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);

  useEffect(() => {
    api<Aluno[]>("/alunos").then(setAlunos);
    api<Empresa[]>("/empresas").then(setEmpresas);
    api<Instituicao[]>("/instituicoes").then(setInstituicoes);
  }, []);

  // Cada função chama o back-end e atualiza a lista em memória com a resposta
  async function adicionarAluno(dados: object) {
    const novo = await api<Aluno>("/alunos", { method: "POST", body: JSON.stringify(dados) });
    setAlunos((lista) => [...lista, novo]);
  }

  async function removerAluno(id: string) {
    await api(`/alunos/${id}`, { method: "DELETE" });
    setAlunos((lista) => lista.filter((a) => a.id !== id));
  }

  async function adicionarEmpresa(dados: object) {
    const nova = await api<Empresa>("/empresas", { method: "POST", body: JSON.stringify(dados) });
    setEmpresas((lista) => [...lista, nova]);
  }

  async function removerEmpresa(id: string) {
    await api(`/empresas/${id}`, { method: "DELETE" });
    setEmpresas((lista) => lista.filter((e) => e.id !== id));
  }

  return (
    <div>
      <h1>Sistema de Moeda Estudantil</h1>
      <nav>
        <button onClick={() => setPagina("alunos")}>Alunos</button>{" "}
        <button onClick={() => setPagina("empresas")}>Empresas</button>
      </nav>
      {pagina === "alunos" ? (
        <Alunos
          alunos={alunos}
          instituicoes={instituicoes}
          onAdicionar={adicionarAluno}
          onRemover={removerAluno}
        />
      ) : (
        <Empresas empresas={empresas} onAdicionar={adicionarEmpresa} onRemover={removerEmpresa} />
      )}
    </div>
  );
}
