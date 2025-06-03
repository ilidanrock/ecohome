import { Resend } from "resend"
import { getVerificationEmailTemplate } from "./email-tamplates"


const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

    await resend.emails.send({
      from: "EcoHome <onboarding@resend.dev>",
      to: email,
      subject: "✉️ Verifica tu correo electrónico",
      html: getVerificationEmailTemplate(verificationUrl),
    })

    console.log("Email de verificación enviado exitosamente")
    return {
        success: true,
        message: "Email de verificación enviado exitosamente"
    }
  } catch (error) {
    console.error("Error enviando email de verificación:", error)
    throw error
  }
}

