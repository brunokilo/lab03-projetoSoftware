import { Request, Response } from "express";
import { AlunoService } from "../services/AlunoService";

export class AlunoController {
  private service = new AlunoService();

  listar = async (_req: Request, res: Response) => {
    res.json(await this.service.listar());
  };

  buscar = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.service.buscar(req.params.id));
  };

  criar = async (req: Request, res: Response) => {
    res.status(201).json(await this.service.criar(req.body));
  };

  atualizar = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.service.atualizar(req.params.id, req.body));
  };

  remover = async (req: Request<{ id: string }>, res: Response) => {
    await this.service.remover(req.params.id);
    res.status(204).send();
  };
}
