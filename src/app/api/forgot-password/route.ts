import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: "Se o e-mail estiver cadastrado, você receberá um link de redefinição." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2h

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expires },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message: "Se o e-mail estiver cadastrado, você receberá um link de redefinição.",
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
