import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { ContaRepository, Conta, Perfil } from "../repositories/ContaRepository";
import { AppError } from "../errors/AppError";

export interface UsuarioLogado {
  id: string;
  perfil: Perfil;
}

function dadosPublicos(conta: Conta) {
  return { id: conta.id, nome: conta.nome, email: conta.email, perfil: conta.perfil };
}

// NOTA SOBRE USO DE IA: A ferramenta claude da anthropic sugeriu a seguinte linha do hash falso
// a ferramenta sugeriu que fosse criado um hash falso para aumentar a segurança em caso de e-mail inexistente.
// esse hash falso serve para gastar tempo, não revelando quais e-mails estão cadastrados
const HASH_FALSO = bcrypt.hashSync("senha-que-nunca-confere", 10);

export class AuthService {
  private contas = new ContaRepository();

  async login(email?: string, senha?: string) {
    if (!email || !senha) throw new AppError("Informe o e-mail e a senha");

    const conta = await this.contas.buscarPorEmail(email);
    const confere = await bcrypt.compare(senha, conta?.senha ?? HASH_FALSO);
    if (!conta || !confere) throw new AppError("E-mail ou senha inválidos", 401);

    const token = jwt.sign({ perfil: conta.perfil }, process.env.JWT_SECRET!, {
      subject: conta.id,
      expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as SignOptions["expiresIn"],
    });
    return { token, usuario: dadosPublicos(conta) };
  }

  async me(logado: UsuarioLogado) {
    const conta = await this.contas.buscarPorId(logado.id, logado.perfil);
    if (!conta) throw new AppError("Sessão inválida", 401);
    return dadosPublicos(conta);
  }
}
