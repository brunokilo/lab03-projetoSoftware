import { Request, Response } from "express";
import { InstituicaoService } from "../services/InstituicaoService";

export class InstituicaoController {
  private service = new InstituicaoService();

  listar = async (_req: Request, res: Response) => {
    res.json(await this.service.listar());
  };
}
