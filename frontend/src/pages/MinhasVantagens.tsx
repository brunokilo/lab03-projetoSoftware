import { useEffect, useState } from "react";
import { api } from "../api";
import type { TipoAviso, Vantagem } from "../types";
import { substituirRota } from "../hooks/useRota";
import CartaoVantagem from "../components/CartaoVantagem";
import Confirmacao from "../components/Confirmacao";
import EstadoVazio from "../components/EstadoVazio";
import FormVantagem from "../components/FormVantagem";
import Icone from "../components/Icone";

interface Props {
  abrirCadastro: boolean;
  notificar: (tipo: TipoAviso, mensagem: string) => void;
}

// Vantagens da empresa logada: cadastrar, editar, ativar/desativar e excluir
export default function MinhasVantagens({ abrirCadastro, notificar }: Props) {
  const [vantagens, setVantagens] = useState<Vantagem[] | null>(null);
  const [erro, setErro] = useState("");
  // null = fechado; { vantagem: undefined } = cadastro; { vantagem } = edição
  const [formulario, setFormulario] = useState<{ vantagem?: Vantagem } | null>(() => (abrirCadastro ? {} : null));
  const [excluindo, setExcluindo] = useState<Vantagem | null>(null);
  const [alternando, setAlternando] = useState<string | null>(null);

  useEffect(() => {
    api<Vantagem[]>("/vantagens/minhas")
      .then(setVantagens)
      .catch((e: Error) => setErro(e.message));
  }, []);

  // O atalho #/minhas-vantagens/novo (visão geral) já abre o cadastro; aqui só volta a URL para #/minhas-vantagens
  useEffect(() => {
    if (abrirCadastro) substituirRota("/minhas-vantagens");
  }, [abrirCadastro]);

  async function salvar(dados: object, id?: string) {
    const corpo = JSON.stringify(dados);
    const salva = id
      ? await api<Vantagem>(`/vantagens/${id}`, { method: "PUT", body: corpo })
      : await api<Vantagem>("/vantagens", { method: "POST", body: corpo });
    setVantagens((lista) => (id ? (lista ?? []).map((v) => (v.id === id ? salva : v)) : [...(lista ?? []), salva]));
    setFormulario(null);
    notificar("sucesso", id ? `${salva.nome} atualizada.` : `${salva.nome} já aparece para os alunos.`);
  }

  async function alternarAtiva(vantagem: Vantagem) {
    setAlternando(vantagem.id);
    try {
      const salva = await api<Vantagem>(`/vantagens/${vantagem.id}`, {
        method: "PUT",
        body: JSON.stringify({ ativa: !vantagem.ativa }),
      });
      setVantagens((lista) => (lista ?? []).map((v) => (v.id === salva.id ? salva : v)));
      notificar("sucesso", salva.ativa ? `${salva.nome} voltou para o catálogo.` : `${salva.nome} saiu do catálogo.`);
    } catch (e) {
      notificar("erro", (e as Error).message);
    } finally {
      setAlternando(null);
    }
  }

  async function remover(vantagem: Vantagem) {
    try {
      await api(`/vantagens/${vantagem.id}`, { method: "DELETE" });
      setVantagens((lista) => (lista ?? []).filter((v) => v.id !== vantagem.id));
      notificar("sucesso", `${vantagem.nome} foi excluída.`);
    } catch (e) {
      notificar("erro", (e as Error).message);
    }
  }

  const ordenadas = [...(vantagens ?? [])].sort(
    (a, b) => Number(b.ativa) - Number(a.ativa) || a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <h1>Minhas vantagens</h1>
          <p>
            Produtos e descontos que sua empresa oferece. Vantagens ativas aparecem no catálogo dos alunos; as
            inativas ficam guardadas e podem voltar quando você quiser.
          </p>
        </div>
        <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
          <Icone nome="mais" />
          Nova vantagem
        </button>
      </div>

      {erro ? (
        <section className="cartao">
          <EstadoVazio icone="alerta" titulo="Não foi possível carregar suas vantagens" descricao={erro} />
        </section>
      ) : !vantagens ? (
        <div className="vantagens-grade">
          {[0, 1, 2].map((i) => (
            <span key={i} className="esqueleto" style={{ height: 320 }} />
          ))}
        </div>
      ) : vantagens.length === 0 ? (
        <section className="cartao">
          <EstadoVazio
            icone="presente"
            titulo="Nenhuma vantagem cadastrada"
            descricao="Cadastre a primeira vantagem, com descrição, foto e custo em moedas, para os alunos poderem trocá-la."
            acao={
              <button type="button" className="botao botao-primario" onClick={() => setFormulario({})}>
                <Icone nome="mais" />
                Cadastrar vantagem
              </button>
            }
          />
        </section>
      ) : (
        <div className="vantagens-grade">
          {ordenadas.map((v) => (
            <CartaoVantagem
              key={v.id}
              vantagem={v}
              etiqueta={<span className={`vantagem-status${v.ativa ? " ativa" : ""}`}>{v.ativa ? "Ativa" : "Inativa"}</span>}
            >
              <button
                type="button"
                className="botao botao-secundario"
                onClick={() => alternarAtiva(v)}
                disabled={alternando === v.id}
              >
                {alternando === v.id && <Icone nome="carregando" className="girando" />}
                {v.ativa ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                className="botao-icone"
                onClick={() => setFormulario({ vantagem: v })}
                title="Editar"
                aria-label={`Editar ${v.nome}`}
              >
                <Icone nome="editar" tamanho={16} />
              </button>
              <button
                type="button"
                className="botao-icone perigo"
                onClick={() => setExcluindo(v)}
                title="Excluir"
                aria-label={`Excluir ${v.nome}`}
              >
                <Icone nome="excluir" tamanho={16} />
              </button>
            </CartaoVantagem>
          ))}
        </div>
      )}

      {formulario && (
        <FormVantagem
          vantagem={formulario.vantagem}
          aoFechar={() => setFormulario(null)}
          aoSalvar={(dados) => salvar(dados, formulario.vantagem?.id)}
        />
      )}

      {excluindo && (
        <Confirmacao
          titulo="Excluir vantagem"
          textoConfirmar="Excluir vantagem"
          aoFechar={() => setExcluindo(null)}
          aoConfirmar={async () => {
            await remover(excluindo);
            setExcluindo(null);
          }}
        >
          <p>
            Tem certeza que deseja excluir <strong>{excluindo.nome}</strong>?
          </p>
          <p className="texto-suave">
            A vantagem e a foto serão removidas. Se quiser só tirá-la do catálogo por um tempo, use “Desativar”.
          </p>
        </Confirmacao>
      )}
    </>
  );
}
