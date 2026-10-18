import { useState } from "react";
import type { Aluno, Instituicao } from "../types";

interface Props {
  alunos: Aluno[];
  instituicoes: Instituicao[];
  onAdicionar: (dados: object) => Promise<void>;
  onRemover: (id: string) => Promise<void>;
}

const formVazio = {
  nome: "",
  email: "",
  senha: "",
  cpf: "",
  rg: "",
  curso: "",
  instituicaoId: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

export default function Alunos({ alunos, instituicoes, onAdicionar, onRemover }: Props) {
  const [form, setForm] = useState(formVazio);
  const [erro, setErro] = useState("");

  function campo(nome: keyof typeof formVazio, rotulo: string, tipo = "text") {
    return (
      <label>
        {rotulo}
        <input
          type={tipo}
          value={form[nome]}
          onChange={(e) => setForm({ ...form, [nome]: e.target.value })}
        />
      </label>
    );
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const { rua, numero, bairro, cidade, estado, cep, ...dados } = form;
    try {
      await onAdicionar({ ...dados, endereco: { rua, numero, bairro, cidade, estado, cep } });
      setForm(formVazio);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div>
      <h2>Alunos</h2>

      <form onSubmit={salvar}>
        {campo("nome", "Nome")}
        {campo("email", "Email", "email")}
        {campo("senha", "Senha", "password")}
        {campo("cpf", "CPF")}
        {campo("rg", "RG")}
        {campo("curso", "Curso")}
        <label>
          Instituição
          <select
            value={form.instituicaoId}
            onChange={(e) => setForm({ ...form, instituicaoId: e.target.value })}
          >
            <option value="">Selecione</option>
            {instituicoes.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </select>
        </label>
        {campo("rua", "Rua")}
        {campo("numero", "Número")}
        {campo("bairro", "Bairro")}
        {campo("cidade", "Cidade")}
        {campo("estado", "Estado (UF)")}
        {campo("cep", "CEP")}
        <button type="submit">Cadastrar</button>
        {erro && <p>{erro}</p>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>CPF</th>
            <th>Curso</th>
            <th>Instituição</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((a) => (
            <tr key={a.id}>
              <td>{a.nome}</td>
              <td>{a.email}</td>
              <td>{a.cpf}</td>
              <td>{a.curso}</td>
              <td>{a.instituicao?.nome}</td>
              <td>
                <button onClick={() => onRemover(a.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
