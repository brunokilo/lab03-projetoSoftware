import { Request, Response } from "express";
import { ProfessorService } from "../services/ProfessorService";
import { TransacaoService } from "../services/TransacaoService";

export class ProfessorController {
  private service = new ProfessorService();
  private transacoes = new TransacaoService();

  listar = async (_req: Request, res: Response) => {
    res.json(await this.service.listar());
  };

  buscar = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.service.buscar(req.params.id));
  };

  creditarSemestre = async (_req: Request, res: Response) => {
    res.json(await this.service.creditarSemestre());
  };

  enviarMoedas = async (req: Request<{ id: string }>, res: Response) => {
    res.status(201).json(await this.transacoes.enviarMoedas(req.params.id, req.body ?? {}));
  };

  extrato = async (req: Request<{ id: string }>, res: Response) => {
    res.json(await this.transacoes.extratoProfessor(req.params.id));
  };
}
