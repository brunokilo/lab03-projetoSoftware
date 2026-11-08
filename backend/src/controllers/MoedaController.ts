import { Request, Response } from "express";
import { MoedaService } from "../services/MoedaService";

export class MoedaController {
  private service = new MoedaService();

  // O professor vem do token (req.usuario), nunca do corpo da requisição
  enviar = async (req: Request, res: Response) => {
    res.status(201).json(await this.service.enviar(req.usuario!.id, req.body ?? {}));
  };

  saldo = async (req: Request, res: Response) => {
    res.json(await this.service.saldo(req.usuario!));
  };
}
