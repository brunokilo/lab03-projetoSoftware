import { useCallback, useEffect, useRef, useState } from "react";
import { api, guardarToken, lerToken, limparToken, SESSAO_EXPIRADA } from "./api";
import type { AlunoResumo, Aviso, Empresa, Instituicao, Resumo, TipoAviso, Usuario } from "./types";
import { navegar, useRota } from "./hooks/useRota";
import { lerPagina, podeAcessar, titulos } from "./rotas";
import Layout from "./components/Layout";
import Avisos from "./components/Avisos";
import Icone from "./components/Icone";
import VisaoGeral from "./pages/VisaoGeral";
import Empresas from "./pages/Empresas";
import EnviarMoedas from "./pages/EnviarMoedas";
import Extrato from "./pages/Extrato";
import Vantagens from "./pages/Vantagens";
import MinhasVantagens from "./pages/MinhasVantagens";
import MeuCadastro from "./pages/MeuCadastro";
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
  return <Painel usuario={usuario} aoAtualizar={setUsuario} aoSair={sair} />;
}

// PAINEL CARREGANDO OS DADOS PARA QUE O PROGRAMA NAO FIQUE DANDO GET SEMPRE QUE TROCAR DE PAGINA.
// Cada perfil só carrega o que pode ver: a lista de alunos, por exemplo, é só do professor
function Painel({
  usuario,
  aoAtualizar,
  aoSair,
}: {
  usuario: Usuario;
  aoAtualizar: (usuario: Usuario) => void;
  aoSair: () => void;
}) {
  const rota = lerPagina(useRota());
  // Quem abre por URL uma página que o perfil não pode usar volta para a visão geral
  const pagina = podeAcessar(rota.pagina, usuario.perfil) ? rota.pagina : "visao-geral";
  const novo = rota.novo && pagina === rota.pagina;
  const professor = usuario.perfil === "professor";
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
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
      const [dadosResumo, listaEmpresas, listaInstituicoes, listaAlunos] = await Promise.all([
        api<Resumo>("/resumo"),
        api<Empresa[]>("/empresas"),
        api<Instituicao[]>("/instituicoes"),
        professor ? api<AlunoResumo[]>("/alunos") : Promise.resolve([]),
      ]);
      setResumo(dadosResumo);
      setEmpresas(listaEmpresas);
      setInstituicoes(listaInstituicoes);
      setAlunos(listaAlunos);
      setServidorOnline(true);
    } catch (e) {
      setErroConexao((e as Error).message);
      setServidorOnline(false);
    } finally {
      setCarregando(false);
    }
  }, [professor]);

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
          resumo={resumo}
          empresas={empresas}
          perfil={usuario.perfil}
          carregando={carregando}
          indisponivel={Boolean(erroConexao)}
        />
      )}
      {pagina === "empresas" && (
        <Empresas empresas={empresas} carregando={carregando} indisponivel={Boolean(erroConexao)} />
      )}
      {pagina === "enviar-moedas" && (
        <EnviarMoedas alunos={alunos} carregando={carregando} notificar={notificar} />
      )}
      {pagina === "extrato" && <Extrato perfil={usuario.perfil} />}
      {pagina === "vantagens" && <Vantagens perfil={usuario.perfil} notificar={notificar} />}
      {pagina === "minhas-vantagens" && <MinhasVantagens abrirCadastro={novo} notificar={notificar} />}
      {pagina === "meu-cadastro" && (
        <MeuCadastro
          usuario={usuario}
          instituicoes={instituicoes}
          notificar={notificar}
          aoAtualizar={aoAtualizar}
          aoExcluirConta={aoSair}
        />
      )}

      <Avisos avisos={avisos} aoFechar={fecharAviso} />
    </Layout>
  );
}
