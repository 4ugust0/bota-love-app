/**
 * 🔥 BOTA LOVE APP - Email Service
 * 
 * Configuração e utilitários para envio de emails via Nodemailer.
 * 
 * @author Bota Love Team
 */

import * as nodemailer from 'nodemailer';
import * as path from 'path';

// =============================================================================
// 🔧 CARREGAR VARIÁVEIS DE AMBIENTE (para desenvolvimento local)
// =============================================================================

// Carregar .env da pasta raiz do projeto (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production' && !process.env.FUNCTIONS_EMULATOR) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
}

// =============================================================================
// 📧 CONFIGURAÇÃO DO NODEMAILER
// =============================================================================

/**
 * Criar transporter do Nodemailer com configurações SMTP
 * 
 * Variáveis de ambiente necessárias (definir via Firebase CLI):
 * - SMTP_HOST: Host do servidor SMTP
 * - SMTP_PORT: Porta do servidor SMTP
 * - SMTP_SECURE: Se usa SSL/TLS (true/false)
 * - SMTP_USER: Usuário/email de autenticação
 * - SMTP_PASS: Senha de autenticação
 * - SMTP_FROM_NAME: Nome exibido como remetente
 * - SMTP_FROM_EMAIL: Email do remetente
 * 
 * Para definir variáveis de ambiente:
 * firebase functions:secrets:set SMTP_HOST
 * firebase functions:secrets:set SMTP_PORT
 * firebase functions:secrets:set SMTP_USER
 * firebase functions:secrets:set SMTP_PASS
 */
export function createEmailTransporter(): nodemailer.Transporter {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  console.log('📧 Configurando transporter SMTP:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? '***configurado***' : '❌ não configurado',
  });

  return nodemailer.createTransport(config);
}

// =============================================================================
// 📤 FUNÇÃO DE ENVIO DE EMAIL
// =============================================================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Enviar email usando o transporter configurado
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log('📧 [sendEmail] Iniciando envio...');
    console.log('📧 [sendEmail] SMTP_HOST:', process.env.SMTP_HOST || 'NÃO DEFINIDO');
    console.log('📧 [sendEmail] SMTP_PORT:', process.env.SMTP_PORT || 'NÃO DEFINIDO');
    console.log('📧 [sendEmail] SMTP_USER:', process.env.SMTP_USER ? 'CONFIGURADO' : 'NÃO DEFINIDO');
    console.log('📧 [sendEmail] SMTP_PASS:', process.env.SMTP_PASS ? 'CONFIGURADO' : 'NÃO DEFINIDO');
    
    const transporter = createEmailTransporter();

    const fromName = process.env.SMTP_FROM_NAME || 'Bota Love';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    };

    console.log(`📤 Enviando email para: ${options.to}`);
    console.log(`📝 Assunto: ${options.subject}`);
    console.log(`📤 De: ${mailOptions.from}`);

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado com sucesso! Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error responseCode:', error.responseCode);
    
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar email',
    };
  }
}

// =============================================================================
// 🛠️ UTILITÁRIOS
// =============================================================================

/**
 * Remove tags HTML e retorna apenas o texto
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gera código de verificação de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
