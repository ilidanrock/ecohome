export const runtime = "nodejs";

import nodemailer from "nodemailer";
import { NextResponse, type NextRequest } from "next/server";

import { withCORS } from "@/lib/cors";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  const { email, token } = await request.json();

  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "rluis747@gmail.com",
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"EcoHome" <rluis747@gmail.com>`,
      to: email,
      subject: "✉️ Verifica tu correo electrónico",
      html: getVerificationEmailTemplate(verificationUrl),
    });

    const response = NextResponse.json({ message: "Correo enviado", id: info.messageId });
    return withCORS(request, response);
  } catch (error) {
    const errorResponse = NextResponse.json({ error }, { status: 500 });
    return withCORS(request, errorResponse);
  }
}

export function OPTIONS(request: NextRequest) {
  return withCORS(request, new NextResponse(null, { status: 204 }));
}
