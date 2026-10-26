import { Request, Response } from "express";
import { ProfessorService } from "../services/ProfessorService";

export class ProfessorController {
  private service = new ProfessorService();

  listar = async (_req: Request, res: Response) => {
    res.json(await this.service.listar());
  };

  buscar = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.service.buscar(req.params.id));
  };

  creditarSemestre = async (_req: Request, res: Response) => {
    res.json(await this.service.creditarSemestre());
  };
}
