import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  private service = new AuthService();

  login = async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};
    res.json(await this.service.login(email, senha));
  };

  me = async (req: Request, res: Response) => {
    res.json(await this.service.me(req.usuario!));
  };
}
