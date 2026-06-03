import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Redefinição de senha - Jornada Bíblica",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Jornada Bíblica</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">Redefinição de Senha</h2>
          <p style="color: #6b7280;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">Este link expira em 2 horas. Se você não solicitou a redefinição, ignore este e-mail.</p>
        </div>
      </div>
    `,
  });
}
