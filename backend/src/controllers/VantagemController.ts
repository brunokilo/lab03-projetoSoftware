import { Request, Response } from "express";
import { VantagemService } from "../services/VantagemService";

export class VantagemController {
  private service = new VantagemService();

  catalogo = async (_req: Request, res: Response) => {
    res.json(await this.service.listarCatalogo());
  };

  // A empresa vem do token (req.usuario), nunca do corpo da requisição
  minhas = async (req: Request, res: Response) => {
    res.json(await this.service.listarDaEmpresa(req.usuario!.id));
  };

  criar = async (req: Request, res: Response) => {
    res.status(201).json(await this.service.criar(req.usuario!.id, req.body ?? {}));
  };

  atualizar = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.service.atualizar(req.usuario!.id, req.params.id, req.body ?? {}));
  };

  remover = async (req: Request<{ id: string }>, res: Response) => {
    await this.service.remover(req.usuario!.id, req.params.id);
    res.status(204).send();
  };
}
