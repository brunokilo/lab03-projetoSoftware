import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "../errors/AppError";

// Pasta servida pela API em /uploads (fica em backend/uploads, fora do controle de versão)
export const PASTA_UPLOADS = path.resolve(__dirname, "../../uploads");

const TAMANHO_MAXIMO = 2 * 1024 * 1024;

// Os primeiros bytes de cada formato: a extensão do data URL sozinha não garante que é mesmo uma imagem
const FORMATOS: Record<string, { extensao: string; confere: (b: Buffer) => boolean }> = {
  "image/png": { extensao: "png", confere: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/jpeg": { extensao: "jpg", confere: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": { extensao: "webp", confere: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
};

export class FotoService {
  // Recebe a foto como data URL ("data:image/png;base64,...") e devolve o caminho público
  async salvar(dataUrl: unknown, pasta: string) {
    const partes = typeof dataUrl === "string" ? /^data:([a-z/]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl) : null;
    const formato = partes && FORMATOS[partes[1]];
    if (!partes || !formato) throw new AppError("A foto deve ser uma imagem PNG, JPEG ou WebP");

    const bytes = Buffer.from(partes[2], "base64");
    if (bytes.length > TAMANHO_MAXIMO) throw new AppError("A foto deve ter no máximo 2 MB");
    if (!formato.confere(bytes)) throw new AppError("O arquivo enviado não é uma imagem válida");

    const nome = `${randomUUID()}.${formato.extensao}`;
    await mkdir(path.join(PASTA_UPLOADS, pasta), { recursive: true });
    await writeFile(path.join(PASTA_UPLOADS, pasta, nome), bytes);
    return `/uploads/${pasta}/${nome}`;
  }

  // Apaga uma foto salva por este serviço; se o arquivo já não existe, não há o que fazer
  async remover(caminho: string | null | undefined) {
    if (!caminho?.startsWith("/uploads/")) return;
    const arquivo = path.resolve(PASTA_UPLOADS, caminho.slice("/uploads/".length));
    if (!arquivo.startsWith(PASTA_UPLOADS + path.sep)) return;
    await unlink(arquivo).catch(() => {});
  }
}
