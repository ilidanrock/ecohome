export const runtime = "nodejs";

import nodemailer from "nodemailer";
import { NextResponse , type NextRequest } from "next/server"
import { getVerificationEmailTemplate } from "@/lib/email-tamplates";

export async function POST(request: NextRequest) {

    const {email, token} = await request.json()

    console.log({email, token});
    

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

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
          from: `"EcoHome" <${"rluis747@gmail.com"}>`,
          to: email,
          subject: "✉️ Verifica tu correo electrónico",
          html: getVerificationEmailTemplate(verificationUrl),
        });
        console.log({info});
        
        return NextResponse.json({ message: "Correo enviado", id: info.messageId });
      } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
}
