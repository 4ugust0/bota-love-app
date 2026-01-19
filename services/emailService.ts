/**
 * 🔥 BOTA LOVE APP - Email Service
 * 
 * Serviço de email simulado para notificações de assinatura
 * Em produção, integraria com SendGrid, AWS SES, ou similar
 * 
 * @author Bota Love Team
 */

import { Plan } from '@/data/mockData';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface SubscriptionEmailData {
  userName: string;
  userEmail: string;
  plan: Plan;
  startDate: Date;
  nextBillingDate: Date;
  paymentMethod?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// =============================================================================
// 📧 TEMPLATES DE EMAIL
// =============================================================================

/**
 * Template de email de boas-vindas após assinatura
 */
export function getSubscriptionWelcomeTemplate(data: SubscriptionEmailData): EmailTemplate {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getBillingCycleText = (cycle: Plan['billing_cycle']) => {
    switch (cycle) {
      case 'monthly': return 'mensal';
      case 'quarterly': return 'trimestral';
      case 'annual': return 'anual';
      default: return 'mensal';
    }
  };

  const subject = `🎉 Bem-vindo ao ${data.plan.title}! Sua assinatura está ativa`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🌾 Bota Love
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Amor que nasce no campo
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Welcome Message -->
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; text-align: center;">
                🎉 Parabéns, ${data.userName}!
              </h2>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                Sua assinatura do plano <strong style="color: #D4A574;">${data.plan.title}</strong> foi ativada com sucesso!
              </p>
              
              <!-- Plan Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFF9F0 0%, #FFF5E6 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 5px; color: #D4A574; font-size: 20px;">
                            ${data.plan.title}
                          </h3>
                          <p style="margin: 0; color: #888888; font-size: 14px;">
                            ${data.plan.description}
                          </p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0; color: #D4A574; font-size: 28px; font-weight: bold;">
                            ${formatCurrency(data.plan.price)}
                          </p>
                          <p style="margin: 0; color: #888888; font-size: 12px;">
                            /${getBillingCycleText(data.plan.billing_cycle)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Subscription Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
                    <span style="color: #888888; font-size: 14px;">📅 Data de início</span>
                    <span style="float: right; color: #333333; font-size: 14px; font-weight: 500;">
                      ${formatDate(data.startDate)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
                    <span style="color: #888888; font-size: 14px;">🔄 Próxima cobrança</span>
                    <span style="float: right; color: #333333; font-size: 14px; font-weight: 500;">
                      ${formatDate(data.nextBillingDate)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
                    <span style="color: #888888; font-size: 14px;">💳 Recorrência</span>
                    <span style="float: right; color: #333333; font-size: 14px; font-weight: 500;">
                      ${getBillingCycleText(data.plan.billing_cycle).charAt(0).toUpperCase() + getBillingCycleText(data.plan.billing_cycle).slice(1)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <span style="color: #888888; font-size: 14px;">💰 Valor</span>
                    <span style="float: right; color: #333333; font-size: 14px; font-weight: 500;">
                      ${formatCurrency(data.plan.price)}
                    </span>
                  </td>
                </tr>
              </table>
              
              <!-- Features -->
              <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">
                ✨ Seus benefícios Premium:
              </h3>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                ${data.plan.features.slice(0, 6).map(feature => `
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">
                    ✓ ${feature}
                  </td>
                </tr>
                `).join('')}
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); color: #ffffff; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                      Abrir Bota Love
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                Você receberá notificações sobre sua assinatura neste email.
              </p>
              <p style="margin: 0 0 10px; color: #888888; font-size: 12px;">
                Para cancelar ou gerenciar sua assinatura, acesse as configurações do app.
              </p>
              <p style="margin: 0; color: #aaaaaa; font-size: 11px;">
                © ${new Date().getFullYear()} Bota Love. Todos os direitos reservados.
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

  const textContent = `
🎉 Bem-vindo ao ${data.plan.title}!

Olá, ${data.userName}!

Sua assinatura foi ativada com sucesso!

📋 DETALHES DA ASSINATURA
========================
Plano: ${data.plan.title}
Valor: ${formatCurrency(data.plan.price)}/${getBillingCycleText(data.plan.billing_cycle)}
Data de início: ${formatDate(data.startDate)}
Próxima cobrança: ${formatDate(data.nextBillingDate)}

✨ SEUS BENEFÍCIOS:
${data.plan.features.map(f => `• ${f}`).join('\n')}

Aproveite todos os recursos Premium!

--
Bota Love - Amor que nasce no campo
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Template de email de renovação
 */
export function getRenewalReminderTemplate(data: SubscriptionEmailData): EmailTemplate {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const subject = `🔔 Lembrete: Sua assinatura ${data.plan.title} será renovada em breve`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🌾 Bota Love
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; text-align: center;">
                🔔 Lembrete de Renovação
              </h2>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                Olá, ${data.userName}! Sua assinatura <strong style="color: #D4A574;">${data.plan.title}</strong> será renovada automaticamente em <strong>${formatDate(data.nextBillingDate)}</strong>.
              </p>
              
              <!-- Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #666666; font-size: 14px;">
                      <strong>Valor:</strong> ${formatCurrency(data.plan.price)}<br>
                      <strong>Data:</strong> ${formatDate(data.nextBillingDate)}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #888888; font-size: 14px; text-align: center;">
                Se não deseja renovar, você pode cancelar nas configurações do app antes da data de renovação.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #aaaaaa; font-size: 11px;">
                © ${new Date().getFullYear()} Bota Love. Todos os direitos reservados.
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

  const textContent = `
🔔 Lembrete de Renovação

Olá, ${data.userName}!

Sua assinatura ${data.plan.title} será renovada automaticamente em ${formatDate(data.nextBillingDate)}.

Valor: ${formatCurrency(data.plan.price)}

Se não deseja renovar, você pode cancelar nas configurações do app antes da data de renovação.

--
Bota Love - Amor que nasce no campo
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Template de email de cancelamento
 */
export function getCancellationTemplate(data: SubscriptionEmailData): EmailTemplate {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const subject = `😢 Sua assinatura ${data.plan.title} foi cancelada`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🌾 Bota Love
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; text-align: center;">
                😢 Sentiremos sua falta
              </h2>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                Olá, ${data.userName}. Sua assinatura <strong>${data.plan.title}</strong> foi cancelada. Você ainda terá acesso aos benefícios Premium até <strong>${formatDate(data.nextBillingDate)}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6; text-align: center;">
                Esperamos ver você de volta em breve! Você sempre pode reativar sua assinatura a qualquer momento.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%); color: #ffffff; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                      Reativar Assinatura
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #aaaaaa; font-size: 11px;">
                © ${new Date().getFullYear()} Bota Love. Todos os direitos reservados.
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

  const textContent = `
😢 Sentiremos sua falta

Olá, ${data.userName}.

Sua assinatura ${data.plan.title} foi cancelada.
Você ainda terá acesso aos benefícios Premium até ${formatDate(data.nextBillingDate)}.

Esperamos ver você de volta em breve!

--
Bota Love - Amor que nasce no campo
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

// =============================================================================
// 📤 FUNÇÕES DE ENVIO (SIMULADO)
// =============================================================================

/**
 * Simula o envio de email
 * Em produção, integraria com um serviço de email real
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<EmailResult> {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  // Log para debug (em produção, removeria)
  console.log('📧 EMAIL ENVIADO (SIMULADO)');
  console.log('Para:', to);
  console.log('Assunto:', template.subject);
  console.log('---');
  console.log(template.textContent);
  console.log('---');

  // Simular sucesso
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Envia email de boas-vindas após assinatura
 */
export async function sendSubscriptionWelcomeEmail(
  data: SubscriptionEmailData
): Promise<EmailResult> {
  const template = getSubscriptionWelcomeTemplate(data);
  return sendEmail(data.userEmail, template);
}

/**
 * Envia lembrete de renovação
 */
export async function sendRenewalReminderEmail(
  data: SubscriptionEmailData
): Promise<EmailResult> {
  const template = getRenewalReminderTemplate(data);
  return sendEmail(data.userEmail, template);
}

/**
 * Envia email de cancelamento
 */
export async function sendCancellationEmail(
  data: SubscriptionEmailData
): Promise<EmailResult> {
  const template = getCancellationTemplate(data);
  return sendEmail(data.userEmail, template);
}
