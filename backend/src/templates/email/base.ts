// Peças compartilhadas pelos templates de e-mail: escape de HTML, plural e a moldura visual

export function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function moedas(valor: number): string {
  return `${valor.toLocaleString("pt-BR")} ${valor === 1 ? "moeda" : "moedas"}`;
}

export interface EmailMontado {
  assunto: string;
  html: string;
  texto: string;
}

// Moldura única dos e-mails do sistema: o conteúdo de cada template entra no meio
export function moldura(titulo: string, conteudo: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#f5f6fa;font-family:Segoe UI,Arial,sans-serif;color:#101828;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ec;border-radius:12px;">
    <tr>
      <td style="padding:20px 28px;background:#0f1b3d;border-radius:12px 12px 0 0;color:#ffffff;">
        <strong style="font-size:16px;">Moeda Estudantil</strong><br>
        <span style="font-size:12px;color:#c3cbe0;">Sistema de mérito</span>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;">${escapar(titulo)}</h1>
        ${conteudo}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #e4e7ec;font-size:12px;color:#667085;">
        Esta é uma mensagem automática do Sistema de Moeda Estudantil. Não responda a este e-mail.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Caixa de destaque com a quantidade de moedas
export function destaque(texto: string): string {
  return `<p style="margin:0 0 20px;padding:14px 18px;background:#fff4db;border:1px solid #fedf89;border-radius:8px;font-size:22px;font-weight:700;color:#7a4d00;">${escapar(texto)}</p>`;
}

// Mensagem escrita pelo professor, em destaque e com as quebras de linha preservadas
export function citacao(texto: string): string {
  return `<blockquote style="margin:0 0 20px;padding:12px 16px;border-left:4px solid #3b5bdb;background:#edf2ff;white-space:pre-wrap;">${escapar(texto)}</blockquote>`;
}
