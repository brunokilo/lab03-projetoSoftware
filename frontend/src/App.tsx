import { useCallback, useEffect, useRef, useState } from "react";
import { api, guardarToken, lerToken, limparToken, SESSAO_EXPIRADA } from "./api";
import type { Aluno, Aviso, Empresa, Instituicao, TipoAviso, Usuario } from "./types";
import { navegar, useRota } from "./hooks/useRota";
import { lerPagina, podeAcessar, titulos } from "./rotas";
import Layout from "./components/Layout";
import Avisos from "./components/Avisos";
import Icone from "./components/Icone";
import VisaoGeral from "./pages/VisaoGeral";
import Alunos from "./pages/Alunos";
import Empresas from "./pages/Empresas";
import EnviarMoedas from "./pages/EnviarMoedas";
import Extrato from "./pages/Extrato";
import Login from "./pages/Login";

// Controla a sessão: sem usuário logado só aparece o login
export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Se há token guardado, confirma com a API (GET /me) antes de decidir entre login e painel
  const [verificando, setVerificando] = useState(() => Boolean(lerToken()));

  useEffect(() => {
    if (!lerToken()) return;
    api<Usuario>("/me")
      .then(setUsuario)
      .catch(() => {})
      .finally(() => setVerificando(false));
  }, []);

  // A API recusou o token em alguma chamada: volta para o login
  useEffect(() => {
    const expirou = () => setUsuario(null);
    window.addEventListener(SESSAO_EXPIRADA, expirou);
    return () => window.removeEventListener(SESSAO_EXPIRADA, expirou);
  }, []);

  function entrar(token: string, logado: Usuario) {
    guardarToken(token);
    setUsuario(logado);
  }

  function sair() {
    limparToken();
    setUsuario(null);
    navegar("/");
  }

  if (verificando) return <div className="tela-verificando">Verificando sessão…</div>;
  if (!usuario) return <Login aoEntrar={entrar} />;
  return <Painel usuario={usuario} aoSair={sair} />;
}

// PAINEL CARREGANDO OS DADOS PARA QUE O PROGRAMA NAO FIQUE DANDO GET SEMPRE QUE TROCAR DE PAGINA
function Painel({ usuario, aoSair }: { usuario: Usuario; aoSair: () => void }) {
  const rota = lerPagina(useRota());
  // Quem abre por URL uma página que o perfil não pode usar volta para a visão geral
  const pagina = podeAcessar(rota.pagina, usuario.perfil) ? rota.pagina : "visao-geral";
  const novo = rota.novo && pagina === rota.pagina;
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
    <Layout pagina={pagina} servidorOnline={servidorOnline} usuario={usuario} aoSair={aoSair}>
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

      {pagina === "enviar-moedas" && (
        <EnviarMoedas alunos={alunos} carregando={carregando} notificar={notificar} />
      )}
      {pagina === "extrato" && <Extrato perfil={usuario.perfil} />}

      <Avisos avisos={avisos} aoFechar={fecharAviso} />
    </Layout>
  );
}
