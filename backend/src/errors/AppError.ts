// Erro com código HTTP, lançado pelos services e tratado em um só lugar (index.ts)
export class AppError extends Error {
  constructor(
    public mensagem: string,
    public status: number = 400
  ) {
    super(mensagem);
  }
}
