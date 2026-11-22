import { Request, Response } from "express";
import { ResgateService } from "../services/ResgateService";

export class ResgateController {
  private service = new ResgateService();
  
  resgatar = async (req: Request, res: Response) => {
    res.status(201).json(await this.service.resgatar(req.usuario!.id, req.body ?? {}));
  };
}
