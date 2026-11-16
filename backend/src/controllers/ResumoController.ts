import { Request, Response } from "express";
import { ResumoService } from "../services/ResumoService";

export class ResumoController {
  private service = new ResumoService();

  gerar = async (_req: Request, res: Response) => {
    res.json(await this.service.gerar());
  };
}
