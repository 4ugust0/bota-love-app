/**
 * 🔥 BOTA LOVE APP - Email Templates
 * 
 * Templates HTML responsivos e bonitos para emails do Bota Love.
 * 
 * @author Bota Love Team
 */

// =============================================================================
// 🎨 CONSTANTES DE ESTILO
// =============================================================================

const COLORS = {
  primary: '#2E7D32',        // Verde rural
  primaryDark: '#1B5E20',    // Verde escuro
  primaryLight: '#4CAF50',   // Verde claro
  secondary: '#8D6E63',      // Marrom terra
  accent: '#D4AD63',         // Dourado elegante
  background: '#FFFFFF',     // Branco
  white: '#FFFFFF',
  text: '#3E2723',           // Marrom escuro
  textLight: '#5D4037',      // Marrom médio
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  success: '#4CAF50',
  warning: '#FFA726',
  gold: '#D4AD63',           // Dourado para caixas
  beige: '#FFF8E1',          // Bege claro
};

// =============================================================================
// 📧 TEMPLATE DE VERIFICAÇÃO DE EMAIL
// =============================================================================

export interface VerificationEmailData {
  name: string;
  code: string;
  expiryMinutes?: number;
}

/**
 * Gera HTML do email de verificação
 */
export function getVerificationEmailTemplate(data: VerificationEmailData): string {
  const { name, code, expiryMinutes = 30 } = data;
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Código de Verificação - Bota Love</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .code-box {
        font-size: 28px !important;
        letter-spacing: 6px !important;
        padding: 20px 15px !important;
      }
      .header-emoji {
        font-size: 40px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AD63 0%, #B8924F 100%); padding: 40px 30px; text-align: center;">
              <div class="header-emoji" style="font-size: 50px; margin-bottom: 15px;">🌾💚</div>
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                Bota Love
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Amor que nasce da terra
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 22px; font-weight: 600;">
                Olá, ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6;">
                Que bom ter você conosco! Para completar seu cadastro e começar a encontrar seu par perfeito, use o código abaixo:
              </p>
              
              <!-- Code Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div class="code-box" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%);
                      border: 3px solid #D4AD63;
                      border-radius: 12px;
                      padding: 25px 35px;
                      font-size: 36px;
                      font-weight: 800;
                      letter-spacing: 10px;
                      color: #B8924F;
                      font-family: 'Courier New', monospace;
                    ">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timer Info -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <div style="
                      display: inline-flex;
                      align-items: center;
                      background-color: ${COLORS.lightGray};
                      padding: 12px 20px;
                      border-radius: 8px;
                    ">
                      <span style="font-size: 20px; margin-right: 10px;">⏱️</span>
                      <span style="color: ${COLORS.textLight}; font-size: 14px;">
                        Este código expira em <strong style="color: ${COLORS.accent};">${expiryMinutes} minutos</strong>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions -->
              <div style="
                background-color: ${COLORS.lightGray};
                border-radius: 12px;
                padding: 20px;
                margin: 25px 0;
              ">
                <p style="margin: 0 0 15px 0; color: ${COLORS.text}; font-size: 14px; font-weight: 600;">
                  📝 Como usar:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.8;">
                  <li>Abra o app Bota Love</li>
                  <li>Digite o código de 6 dígitos acima</li>
                  <li>Pronto! Seu email estará verificado</li>
                </ol>
              </div>
              
            </td>
          </tr>
          
          <!-- Security Warning -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="
                background-color: #FFF3E0;
                border-left: 4px solid ${COLORS.warning};
                padding: 15px 20px;
                border-radius: 0 8px 8px 0;
              ">
                <p style="margin: 0; color: ${COLORS.textLight}; font-size: 13px; line-height: 1.5;">
                  <strong style="color: ${COLORS.accent};">🔒 Dica de segurança:</strong><br>
                  Nunca compartilhe este código com ninguém. Nossa equipe nunca pedirá seu código por telefone ou mensagem.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 0;">
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: ${COLORS.gray}; font-size: 13px;">
                Se você não solicitou este código, ignore este email.
              </p>
              
              <div style="margin: 20px 0;">
                <span style="font-size: 24px;">🌻 🐄 🌾 🚜 💚</span>
              </div>
              
              <p style="margin: 0; color: ${COLORS.gray}; font-size: 12px;">
                © ${new Date().getFullYear()} Bota Love - Todos os direitos reservados
              </p>
              <p style="margin: 8px 0 0 0; color: ${COLORS.gray}; font-size: 12px;">
                Conectando corações no campo 💚
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Outside Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; color: ${COLORS.gray}; font-size: 11px;">
                Você recebeu este email porque se cadastrou no Bota Love.<br>
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

// =============================================================================
// 📧 TEMPLATE DE REENVIO DE CÓDIGO
// =============================================================================

/**
 * Gera HTML do email de reenvio de código
 */
export function getResendCodeEmailTemplate(data: VerificationEmailData): string {
  const { name, code, expiryMinutes = 30 } = data;
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Novo Código de Verificação - Bota Love</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .code-box {
        font-size: 28px !important;
        letter-spacing: 6px !important;
        padding: 20px 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.secondary} 0%, #6D4C41 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 15px;">🔄💚</div>
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                Bota Love
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Seu novo código chegou!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 22px; font-weight: 600;">
                Oi de novo, ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6;">
                Você solicitou um novo código de verificação. Aqui está ele, fresquinho:
              </p>
              
              <!-- Code Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div class="code-box" style="
                      display: inline-block;
                      background: linear-gradient(135deg, ${COLORS.background} 0%, #FFF3E0 100%);
                      border: 3px dashed ${COLORS.secondary};
                      border-radius: 12px;
                      padding: 25px 35px;
                      font-size: 36px;
                      font-weight: 800;
                      letter-spacing: 10px;
                      color: #5D4037;
                      font-family: 'Courier New', monospace;
                    ">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <div style="
                      display: inline-flex;
                      align-items: center;
                      background-color: ${COLORS.lightGray};
                      padding: 12px 20px;
                      border-radius: 8px;
                    ">
                      <span style="font-size: 20px; margin-right: 10px;">⏱️</span>
                      <span style="color: ${COLORS.textLight}; font-size: 14px;">
                        Código válido por <strong style="color: ${COLORS.accent};">${expiryMinutes} minutos</strong>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <div style="
                background-color: #E3F2FD;
                border-left: 4px solid #2196F3;
                padding: 15px 20px;
                border-radius: 0 8px 8px 0;
                margin: 25px 0;
              ">
                <p style="margin: 0; color: ${COLORS.textLight}; font-size: 13px; line-height: 1.5;">
                  <strong style="color: #1976D2;">ℹ️ Observação:</strong><br>
                  O código anterior foi invalidado. Use apenas este novo código.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Security Warning -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="
                background-color: #FFF3E0;
                border-left: 4px solid ${COLORS.warning};
                padding: 15px 20px;
                border-radius: 0 8px 8px 0;
              ">
                <p style="margin: 0; color: ${COLORS.textLight}; font-size: 13px; line-height: 1.5;">
                  <strong style="color: ${COLORS.accent};">🔒 Lembrete:</strong><br>
                  Nunca compartilhe seu código com ninguém!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <div style="margin: 0 0 15px 0;">
                <span style="font-size: 24px;">🌻 🐄 🌾 🚜 💚</span>
              </div>
              
              <p style="margin: 0; color: ${COLORS.gray}; font-size: 12px;">
                © ${new Date().getFullYear()} Bota Love - Todos os direitos reservados
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

// =============================================================================
// 📧 TEMPLATE DE EMAIL DE BOAS-VINDAS
// =============================================================================

export interface WelcomeEmailData {
  name: string;
}

/**
 * Gera HTML do email de boas-vindas
 */
export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  const { name } = data;
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bem-vindo ao Bota Love!</title>
  <style>
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AD63 0%, #B8924F 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 15px;">🎉💚🌾</div>
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                Bem-vindo ao Bota Love!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                O amor começa aqui no campo
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 22px; font-weight: 600;">
                Olá, ${firstName}! 🤠
              </h2>
              
              <p style="margin: 0 0 20px 0; color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6;">
                Que alegria ter você na nossa comunidade! O <strong>Bota Love</strong> foi feito especialmente para pessoas como você que valorizam a vida no campo e buscam conexões verdadeiras.
              </p>
              
              <!-- Complete Profile CTA -->
              <div style="background: linear-gradient(135deg, ${COLORS.background} 0%, #FFF3E0 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">📝✨</div>
                <h3 style="margin: 0 0 10px 0; color: ${COLORS.text}; font-size: 18px;">Complete seu perfil!</h3>
                <p style="margin: 0 0 20px 0; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.5;">
                  Perfis completos têm <strong style="color: ${COLORS.accent};">3x mais chances</strong> de encontrar matches! Adicione suas fotos, interesses e conte um pouco sobre você.
                </p>
                <a href="botalove://edit-profile" style="
                  display: inline-block;
                  background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
                  color: ${COLORS.white};
                  padding: 14px 30px;
                  border-radius: 25px;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 14px;
                ">
                  Completar Meu Perfil →
                </a>
              </div>
              
              <!-- Tips -->
              <div style="background-color: ${COLORS.lightGray}; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; color: ${COLORS.text}; font-size: 14px; font-weight: 600;">
                  🌟 Dicas para arrasar no Bota Love:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.8;">
                  <li>Adicione pelo menos 3 fotos (mostrando seu rosto claramente)</li>
                  <li>Escreva uma bio autêntica contando sobre você</li>
                  <li>Selecione seus interesses para encontrar pessoas compatíveis</li>
                  <li>Seja você mesmo! Conexões verdadeiras começam com autenticidade</li>
                </ul>
              </div>
              
              <p style="margin: 20px 0 0 0; color: ${COLORS.textLight}; font-size: 14px; text-align: center;">
                Estamos torcendo por você! 💚🌾
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <div style="margin: 0 0 15px 0;">
                <span style="font-size: 24px;">🌻 🐄 🌾 🚜 💚</span>
              </div>
              <p style="margin: 0; color: ${COLORS.gray}; font-size: 12px;">
                © ${new Date().getFullYear()} Bota Love - Todos os direitos reservados
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

// =============================================================================
// 📧 ASSUNTOS DE EMAIL
// =============================================================================

export const EMAIL_SUBJECTS = {
  VERIFICATION: '🌾 Código de Verificação - Bota Love',
  RESEND_CODE: '🔄 Novo Código de Verificação - Bota Love',
  PASSWORD_RESET: '🔑 Redefinir Senha - Bota Love',
  WELCOME: '🌾 Bem-vindo ao Bota Love!',
  MATCH: '💚 Você tem um novo Match!',
};

// =============================================================================
// 📧 TEMPLATE DE RECUPERAÇÃO DE SENHA
// =============================================================================

export interface PasswordResetEmailData {
  name: string;
  code: string;
  expiryMinutes?: number;
}

/**
 * Gera HTML do email de recuperação de senha
 */
export function getPasswordResetEmailTemplate(data: PasswordResetEmailData): string {
  const { name, code, expiryMinutes = 30 } = data;
  const firstName = name ? name.split(' ')[0] : 'Usuário';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Redefinir Senha - Bota Love</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .code-box {
        font-size: 28px !important;
        letter-spacing: 6px !important;
        padding: 20px 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.accent} 0%, #E65100 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 15px;">🔑💚</div>
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                Bota Love
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Recuperação de Senha
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <h2 style="margin: 0 0 20px 0; color: ${COLORS.text}; font-size: 22px; font-weight: 600;">
                Olá, ${firstName}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar:
              </p>
              
              <!-- Code Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <div class="code-box" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%);
                      border: 3px dashed ${COLORS.accent};
                      border-radius: 12px;
                      padding: 25px 35px;
                      font-size: 36px;
                      font-weight: 800;
                      letter-spacing: 10px;
                      color: #E65100;
                      font-family: 'Courier New', monospace;
                    ">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <div style="display: inline-flex; align-items: center; background-color: #FFF3E0; padding: 10px 20px; border-radius: 20px;">
                      <span style="font-size: 18px; margin-right: 8px;">⏱️</span>
                      <span style="color: ${COLORS.accent}; font-size: 14px; font-weight: 600;">
                        Válido por ${expiryMinutes} minutos
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <div style="background-color: #FFF8E1; border-left: 4px solid ${COLORS.warning}; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: ${COLORS.text}; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.
                </p>
              </div>
              
              <!-- Security Note -->
              <div style="background-color: ${COLORS.lightGray}; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: ${COLORS.text}; font-size: 14px; font-weight: 600;">
                  🔒 Dicas de Segurança:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: ${COLORS.textLight}; font-size: 14px; line-height: 1.8;">
                  <li>Crie uma senha forte com letras, números e símbolos</li>
                  <li>Não compartilhe sua senha com ninguém</li>
                  <li>Use uma senha única para cada conta</li>
                </ul>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="margin: 0 0 10px 0; color: ${COLORS.gray}; font-size: 12px;">
                Este email foi enviado porque foi solicitada uma redefinição de senha.
              </p>
              <div style="margin: 15px 0;">
                <span style="font-size: 24px;">🌾💚🔐</span>
              </div>
              <p style="margin: 0; color: ${COLORS.gray}; font-size: 12px;">
                © ${new Date().getFullYear()} Bota Love - Todos os direitos reservados
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
