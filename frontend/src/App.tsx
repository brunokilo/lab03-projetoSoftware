import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Aluno, Aviso, Empresa, Instituicao, TipoAviso } from "./types";
import { useRota } from "./hooks/useRota";
import { lerPagina, titulos } from "./rotas";
import Layout from "./components/Layout";
import Avisos from "./components/Avisos";
import Icone from "./components/Icone";
import VisaoGeral from "./pages/VisaoGeral";
import Alunos from "./pages/Alunos";
import Empresas from "./pages/Empresas";

// APP CARREGANDO OS DADOS PARA QUE O PROGRAMA NAO FIQUE DANDO GET SEMPRE QUE TROCAR DE PAGINA
export default function App() {
  const { pagina, novo } = lerPagina(useRota());
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroConexao, setErroConexao] = useState("");
  const [servidorOnline, setServidorOnline] = useState<boolean | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const proximoAviso = useRef(1);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroConexao("");
    try {
      const [listaAlunos, listaEmpresas, listaInstituicoes] = await Promise.all([
        api<Aluno[]>("/alunos"),
        api<Empresa[]>("/empresas"),
        api<Instituicao[]>("/instituicoes"),
      ]);
      setAlunos(listaAlunos);
      setEmpresas(listaEmpresas);
      setInstituicoes(listaInstituicoes);
      setServidorOnline(true);
    } catch (e) {
      setErroConexao((e as Error).message);
      setServidorOnline(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    document.title = `${titulos[pagina]} · Moeda Estudantil`;
  }, [pagina]);

  const fecharAviso = useCallback((id: number) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id));
  }, []);

  function notificar(tipo: TipoAviso, mensagem: string) {
    const id = proximoAviso.current++;
    setAvisos((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => fecharAviso(id), 4500);
  }

  // Cada função chama o back-end e atualiza a lista em memória com a resposta
  async function salvarAluno(dados: object, id?: string) {
    const corpo = JSON.stringify(dados);
    if (id) {
      const atualizado = await api<Aluno>(`/alunos/${id}`, { method: "PUT", body: corpo });
      setAlunos((lista) => lista.map((a) => (a.id === id ? atualizado : a)));
      notificar("sucesso", `Dados de ${atualizado.nome} atualizados.`);
    } else {
      const criado = await api<Aluno>("/alunos", { method: "POST", body: corpo });
      setAlunos((lista) => [...lista, criado]);
      notificar("sucesso", `Cadastro de ${criado.nome} realizado com sucesso.`);
    }
  }

  async function removerAluno(aluno: Aluno) {
    try {
      await api(`/alunos/${aluno.id}`, { method: "DELETE" });
      setAlunos((lista) => lista.filter((a) => a.id !== aluno.id));
      notificar("sucesso", `Cadastro de ${aluno.nome} excluído.`);
    } catch (e) {
      notificar("erro", (e as Error).message);
    }
  }

  async function salvarEmpresa(dados: object, id?: string) {
    const corpo = JSON.stringify(dados);
    if (id) {
      const atualizada = await api<Empresa>(`/empresas/${id}`, { method: "PUT", body: corpo });
      setEmpresas((lista) => lista.map((e) => (e.id === id ? atualizada : e)));
      notificar("sucesso", `Dados de ${atualizada.nome} atualizados.`);
    } else {
      const criada = await api<Empresa>("/empresas", { method: "POST", body: corpo });
      setEmpresas((lista) => [...lista, criada]);
      notificar("sucesso", `${criada.nome} agora é uma empresa parceira.`);
    }
  }

  async function removerEmpresa(empresa: Empresa) {
    try {
      await api(`/empresas/${empresa.id}`, { method: "DELETE" });
      setEmpresas((lista) => lista.filter((e) => e.id !== empresa.id));
      notificar("sucesso", `${empresa.nome} foi removida das empresas parceiras.`);
    } catch (e) {
      notificar("erro", (e as Error).message);
    }
  }

  return (
    <Layout pagina={pagina} servidorOnline={servidorOnline}>
      {erroConexao && (
        <div className="alerta-conexao" role="alert">
          <Icone nome="alerta" tamanho={20} />
          <div>
            <strong>Não foi possível carregar os dados</strong>
            <span>{erroConexao}</span>
          </div>
          <button type="button" className="botao botao-secundario" onClick={carregar}>
            <Icone nome="recarregar" tamanho={16} />
            Tentar novamente
          </button>
        </div>
      )}

      {pagina === "visao-geral" && (
        <VisaoGeral
          alunos={alunos}
          empresas={empresas}
          instituicoes={instituicoes}
          carregando={carregando}
          indisponivel={Boolean(erroConexao)}
        />
      )}
      {pagina === "alunos" && (
        <Alunos
          alunos={alunos}
          instituicoes={instituicoes}
          carregando={carregando}
          indisponivel={Boolean(erroConexao)}
          abrirCadastro={novo}
          aoSalvar={salvarAluno}
          aoRemover={removerAluno}
        />
      )}
      {pagina === "empresas" && (
        <Empresas
          empresas={empresas}
          carregando={carregando}
          indisponivel={Boolean(erroConexao)}
          abrirCadastro={novo}
          aoSalvar={salvarEmpresa}
          aoRemover={removerEmpresa}
        />
      )}

      <Avisos avisos={avisos} aoFechar={fecharAviso} />
    </Layout>
  );
}
