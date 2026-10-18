import { useState } from "react";
import type { Empresa } from "../types";

interface Props {
  empresas: Empresa[];
  onAdicionar: (dados: object) => Promise<void>;
  onRemover: (id: string) => Promise<void>;
}

const formVazio = { nome: "", email: "", senha: "", cnpj: "" };

export default function Empresas({ empresas, onAdicionar, onRemover }: Props) {
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
    try {
      await onAdicionar(form);
      setForm(formVazio);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div>
      <h2>Empresas parceiras</h2>

      <form onSubmit={salvar}>
        {campo("nome", "Nome")}
        {campo("email", "Email", "email")}
        {campo("senha", "Senha", "password")}
        {campo("cnpj", "CNPJ")}
        <button type="submit">Cadastrar</button>
        {erro && <p>{erro}</p>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>CNPJ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id}>
              <td>{e.nome}</td>
              <td>{e.email}</td>
              <td>{e.cnpj}</td>
              <td>
                <button onClick={() => onRemover(e.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
