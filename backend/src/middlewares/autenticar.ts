import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { Perfil } from "../repositories/ContaRepository";
import { UsuarioLogado } from "../services/AuthService";

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioLogado;
    }
  }
}

const PERFIS: Perfil[] = ["aluno", "professor", "empresa"];

// Exige o cabeçalho "Authorization: Bearer <token>" e deixa quem fez a requisição em req.usuario
export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");
  if (tipo !== "Bearer" || !token) throw new AppError("Autenticação necessária", 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === "string" || !payload.sub || !PERFIS.includes(payload.perfil)) {
      throw new Error("token inválido");
    }
    req.usuario = { id: payload.sub, perfil: payload.perfil };
  } catch {
    throw new AppError("Sessão expirada ou inválida. Entre novamente.", 401);
  }
  next();
}

// Limita a rota a certos perfis. Usar depois do "autenticar"
export function exigirPerfil(...perfis: Perfil[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      throw new AppError("Você não tem permissão para acessar este recurso", 403);
    }
    next();
  };
}
