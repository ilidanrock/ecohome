export const runtime = 'nodejs';

import nodemailer from 'nodemailer';
import { NextResponse, type NextRequest } from 'next/server';

import { withCORS } from '@/lib/cors';
import { getVerificationEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const { email, token } = await request.json();

  if (!email || !token) {
    const response = NextResponse.json(
      { error: 'Missing required fields: email and token' },
      { status: 400 }
    );
    return withCORS(request, response);
  }

  const verificationBaseUrl = process.env.NEXTAUTH_URL;
  if (!verificationBaseUrl) {
    const response = NextResponse.json(
      { error: 'NEXTAUTH_URL is not configured' },
      { status: 500 }
    );
    return withCORS(request, response);
  }

  const smtpHost = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpSecure =
    process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
  const smtpUser = process.env.SMTP_USER ?? process.env.EMAIL_FROM;
  const smtpPass = process.env.SMTP_PASS ?? process.env.GOOGLE_APP_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM;

  if (!smtpUser || !smtpPass || !emailFrom) {
    const response = NextResponse.json(
      {
        error:
          'Email transport is not fully configured. Please set EMAIL_FROM, SMTP_USER and SMTP_PASS',
      },
      { status: 500 }
    );
    return withCORS(request, response);
  }

  const verificationUrl = `${verificationBaseUrl}/api/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: '✉️ Verifica tu correo electrónico',
      html: getVerificationEmailTemplate(verificationUrl),
    });

    const response = NextResponse.json({ message: 'Correo enviado', id: info.messageId });
    return withCORS(request, response);
  } catch (error) {
    const errorResponse = NextResponse.json({ error }, { status: 500 });
    return withCORS(request, errorResponse);
  }
}

export function OPTIONS(request: NextRequest) {
  return withCORS(request, new NextResponse(null, { status: 204 }));
}
