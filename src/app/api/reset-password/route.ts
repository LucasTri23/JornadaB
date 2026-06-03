import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Link inválido ou expirado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Senha redefinida com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
