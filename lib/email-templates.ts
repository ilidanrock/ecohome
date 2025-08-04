export const getVerificationEmailTemplate = (verificationUrl: string, userName?: string) => {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu correo electrónico - EcoHome</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F9FA;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); padding: 40px 30px; text-align: center;">
                                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="white"/>
                                          <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="white"/>
                                          <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="white"/>
                                      </svg>
                                      <span style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">EcoHome</span>
                                  </div>
                                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                      ¡Bienvenido${userName ? ` ${userName}` : ''}!
                                  </h1>
                                  <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">
                                      Confirma tu dirección de correo electrónico
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <div style="text-align: center; margin-bottom: 30px;">
                                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative;">
                                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                              <polyline points="22,6 12,13 2,6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                          </svg>
                                      </div>
                                  </div>
                                  
                                  <h2 style="color: #343A40; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center;">
                                      Verifica tu cuenta EcoHome
                                  </h2>
                                  
                                  <p style="color: #343A40; opacity: 0.8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                      Gracias por unirte a EcoHome. Para comenzar a gestionar tu consumo energético de manera inteligente y sostenible, necesitamos verificar tu dirección de correo electrónico.
                                  </p>
                                  
                                  <div style="text-align: center; margin: 32px 0;">
                                      <a href="${verificationUrl}" 
                                         style="display: inline-block; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 14px 0 rgba(0, 123, 255, 0.4); transition: all 0.3s ease;">
                                          Verificar mi correo
                                      </a>
                                  </div>
                                  
                                  <!-- Beneficios de EcoHome -->
                                  <div style="background-color: #F8F9FA; border-radius: 8px; padding: 24px; margin: 32px 0;">
                                      <h3 style="color: #343A40; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                                          ¿Qué puedes hacer con EcoHome?
                                      </h3>
                                      <div style="display: flex; flex-direction: column; gap: 12px;">
                                          <div style="display: flex; align-items: center;">
                                              <div style="width: 24px; height: 24px; background-color: #007BFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                                  <span style="color: white; font-size: 12px;">✓</span>
                                              </div>
                                              <span style="color: #343A40; font-size: 14px;">Monitoriza tu consumo energético en tiempo real</span>
                                          </div>
                                          <div style="display: flex; align-items: center;">
                                              <div style="width: 24px; height: 24px; background-color: #28A745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                                  <span style="color: white; font-size: 12px;">✓</span>
                                              </div>
                                              <span style="color: #343A40; font-size: 14px;">Recibe recomendaciones para ahorrar energía</span>
                                          </div>
                                          <div style="display: flex; align-items: center;">
                                              <div style="width: 24px; height: 24px; background-color: #007BFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                                  <span style="color: white; font-size: 12px;">✓</span>
                                              </div>
                                              <span style="color: #343A40; font-size: 14px;">Reduce tu huella de carbono y ahorra dinero</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div style="background-color: #F8F9FA; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                      <p style="color: #343A40; opacity: 0.8; margin: 0; font-size: 14px; line-height: 1.5;">
                                          <strong>¿No puedes hacer clic en el botón?</strong><br>
                                          Copia y pega este enlace en tu navegador:<br>
                                          <span style="color: #007BFF; word-break: break-all;">${verificationUrl}</span>
                                      </p>
                                  </div>
                                  
                                  <p style="color: #343A40; opacity: 0.6; margin: 24px 0 0 0; font-size: 14px; line-height: 1.5; text-align: center;">
                                      Este enlace expirará en 24 horas por motivos de seguridad.
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                  <div style="margin-bottom: 16px;">
                                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#28A745"/>
                                          </svg>
                                          <span style="color: #343A40; font-size: 16px; font-weight: 600;">EcoHome</span>
                                      </div>
                                      <p style="color: #343A40; opacity: 0.7; margin: 0; font-size: 14px;">
                                          Empoderando la gestión sostenible de energía
                                      </p>
                                  </div>
                                  <p style="color: #343A40; opacity: 0.6; margin: 0 0 8px 0; font-size: 14px;">
                                      Si no creaste esta cuenta, puedes ignorar este correo.
                                  </p>
                                  <p style="color: #343A40; opacity: 0.5; margin: 0; font-size: 12px;">
                                      © ${new Date().getFullYear()} EcoHome. Todos los derechos reservados.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
};

export const getPasswordResetEmailTemplate = (resetUrl: string, userName?: string) => {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña - EcoHome</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F9FA;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); padding: 40px 30px; text-align: center;">
                                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="white"/>
                                      </svg>
                                      <span style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">EcoHome</span>
                                  </div>
                                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                      Restablecer contraseña
                                  </h1>
                                  <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">
                                      Solicitud de cambio de contraseña
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <div style="text-align: center; margin-bottom: 30px;">
                                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" stroke-width="2"/>
                                              <circle cx="12" cy="16" r="1" fill="white"/>
                                              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2"/>
                                          </svg>
                                      </div>
                                  </div>
                                  
                                  <h2 style="color: #343A40; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center;">
                                      ${userName ? `Hola ${userName}` : 'Hola'}
                                  </h2>
                                  
                                  <p style="color: #343A40; opacity: 0.8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                      Recibimos una solicitud para restablecer la contraseña de tu cuenta EcoHome. Si no realizaste esta solicitud, puedes ignorar este correo.
                                  </p>
                                  
                                  <div style="text-align: center; margin: 32px 0;">
                                      <a href="${resetUrl}" 
                                         style="display: inline-block; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 14px 0 rgba(0, 123, 255, 0.4);">
                                          Restablecer contraseña
                                      </a>
                                  </div>
                                  
                                  <div style="background-color: #F8F9FA; border-radius: 8px; padding: 20px; margin: 24px 0;">
                                      <p style="color: #343A40; opacity: 0.8; margin: 0; font-size: 14px; line-height: 1.5;">
                                          <strong>¿No puedes hacer clic en el botón?</strong><br>
                                          Copia y pega este enlace en tu navegador:<br>
                                          <span style="color: #007BFF; word-break: break-all;">${resetUrl}</span>
                                      </p>
                                  </div>
                                  
                                  <p style="color: #343A40; opacity: 0.6; margin: 24px 0 0 0; font-size: 14px; line-height: 1.5; text-align: center;">
                                      Este enlace expirará en 1 hora por motivos de seguridad.
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                  <div style="margin-bottom: 16px;">
                                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#28A745"/>
                                          </svg>
                                          <span style="color: #343A40; font-size: 16px; font-weight: 600;">EcoHome</span>
                                      </div>
                                      <p style="color: #343A40; opacity: 0.7; margin: 0; font-size: 14px;">
                                          Empoderando la gestión sostenible de energía
                                      </p>
                                  </div>
                                  <p style="color: #343A40; opacity: 0.6; margin: 0 0 8px 0; font-size: 14px;">
                                      Si no solicitaste este cambio, contacta con nuestro soporte.
                                  </p>
                                  <p style="color: #343A40; opacity: 0.5; margin: 0; font-size: 12px;">
                                      © ${new Date().getFullYear()} EcoHome. Todos los derechos reservados.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
};

export const getWelcomeEmailTemplate = (userName: string, dashboardUrl: string) => {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Bienvenido a EcoHome!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F9FA;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                  <td style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); padding: 40px 30px; text-align: center;">
                                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="white"/>
                                      </svg>
                                      <span style="color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">EcoHome</span>
                                  </div>
                                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                      ¡Bienvenido a EcoHome, ${userName}!
                                  </h1>
                                  <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">
                                      Tu cuenta ha sido verificada exitosamente
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <div style="text-align: center; margin-bottom: 30px;">
                                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                          <span style="color: white; font-size: 32px;">🎉</span>
                                      </div>
                                  </div>
                                  
                                  <h2 style="color: #343A40; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; text-align: center;">
                                      ¡Ya puedes comenzar!
                                  </h2>
                                  
                                  <p style="color: #343A40; opacity: 0.8; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                      Tu cuenta EcoHome está lista. Ahora puedes acceder a tu dashboard y comenzar a gestionar tu consumo energético de manera inteligente.
                                  </p>
                                  
                                  <div style="text-align: center; margin: 32px 0;">
                                      <a href="${dashboardUrl}" 
                                         style="display: inline-block; background: linear-gradient(135deg, #007BFF 0%, #28A745 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 14px 0 rgba(0, 123, 255, 0.4);">
                                          Ir a mi Dashboard
                                      </a>
                                  </div>
                                  
                                  <!-- Próximos pasos -->
                                  <div style="background-color: #F8F9FA; border-radius: 8px; padding: 24px; margin: 32px 0;">
                                      <h3 style="color: #343A40; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">
                                          Próximos pasos
                                      </h3>
                                      <div style="display: flex; flex-direction: column; gap: 16px;">
                                          <div style="display: flex; align-items: flex-start;">
                                              <div style="width: 24px; height: 24px; background-color: #007BFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                                                  <span style="color: white; font-size: 12px; font-weight: bold;">1</span>
                                              </div>
                                              <div>
                                                  <strong style="color: #343A40; font-size: 14px;">Configura tu perfil</strong>
                                                  <p style="color: #343A40; opacity: 0.7; margin: 4px 0 0 0; font-size: 13px;">Completa tu información personal y preferencias</p>
                                              </div>
                                          </div>
                                          <div style="display: flex; align-items: flex-start;">
                                              <div style="width: 24px; height: 24px; background-color: #28A745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                                                  <span style="color: white; font-size: 12px; font-weight: bold;">2</span>
                                              </div>
                                              <div>
                                                  <strong style="color: #343A40; font-size: 14px;">Conecta tus dispositivos</strong>
                                                  <p style="color: #343A40; opacity: 0.7; margin: 4px 0 0 0; font-size: 13px;">Añade medidores inteligentes para monitorizar tu consumo</p>
                                              </div>
                                          </div>
                                          <div style="display: flex; align-items: flex-start;">
                                              <div style="width: 24px; height: 24px; background-color: #007BFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; margin-top: 2px;">
                                                  <span style="color: white; font-size: 12px; font-weight: bold;">3</span>
                                              </div>
                                              <div>
                                                  <strong style="color: #343A40; font-size: 14px;">Explora las funcionalidades</strong>
                                                  <p style="color: #343A40; opacity: 0.7; margin: 4px 0 0 0; font-size: 13px;">Descubre todas las herramientas para ahorrar energía</p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #F8F9FA; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                  <div style="margin-bottom: 16px;">
                                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
                                              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#28A745"/>
                                          </svg>
                                          <span style="color: #343A40; font-size: 16px; font-weight: 600;">EcoHome</span>
                                      </div>
                                      <p style="color: #343A40; opacity: 0.7; margin: 0; font-size: 14px;">
                                          Empoderando la gestión sostenible de energía
                                      </p>
                                  </div>
                                  <p style="color: #343A40; opacity: 0.6; margin: 0 0 8px 0; font-size: 14px;">
                                      ¿Necesitas ayuda? Contacta con nuestro equipo de soporte.
                                  </p>
                                  <p style="color: #343A40; opacity: 0.5; margin: 0; font-size: 12px;">
                                      © ${new Date().getFullYear()} EcoHome. Todos los derechos reservados.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
};
