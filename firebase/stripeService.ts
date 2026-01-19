/**
 * 🔥 BOTA LOVE APP - Stripe Service (PIX)
 * 
 * Serviço de pagamentos com Stripe via PIX:
 * - Pagamento de planos Premium
 * - Pagamento de planos Network Rural
 * - Compra de itens da loja (Super Likes, Boosts)
 * - Histórico de pagamentos
 * 
 * Os valores dos produtos vêm do Firebase/backend, não do Stripe Dashboard.
 * O Stripe é usado apenas como gateway de pagamento PIX.
 * 
 * @author Bota Love Team
 * @version 2.0.0
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

// =============================================================================
// 📝 TIPOS
// =============================================================================

/** Categorias de produtos */
export type ProductCategory = 'premium' | 'network' | 'store';

/** Dados do produto para checkout */
export interface ProductData {
  id: string;           // ID único do produto (ex: 'premium_monthly', 'super_like_5')
  name: string;         // Nome exibido (ex: 'Premium Mensal')
  description?: string; // Descrição do produto
  amount: number;       // Valor em centavos (R$ 49,90 = 4990)
  category: ProductCategory;
  metadata?: Record<string, any>; // Dados adicionais (quantity, etc)
}

/** Request para criar checkout PIX */
export interface PixCheckoutRequest {
  userId: string;
  product: ProductData;
  customerEmail?: string;
  customerName?: string;
}

/** Response do checkout PIX */
export interface PixCheckoutResponse {
  success: boolean;
  paymentId?: string;    // ID do pagamento no Stripe
  pixCode?: string;      // Código PIX copia e cola
  pixQrCode?: string;    // QR Code em base64
  expiresAt?: string;    // Quando o PIX expira (ISO string)
  url?: string;          // URL do checkout hosted (fallback)
  error?: string;
}

/** Status do pagamento */
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'expired' | 'canceled';
  amount: number;
  productId: string;
  productName: string;
  category: ProductCategory;
  pixCode?: string;
  pixQrCode?: string;
  expiresAt?: string;
  paidAt?: string;
  userId: string;
  createdAt: string;
}

/** Histórico de pagamentos */
export interface PaymentHistoryResponse {
  success: boolean;
  payments?: PaymentStatus[];
  total?: number;
  error?: string;
}

// =============================================================================
// 💳 CHECKOUT PIX
// =============================================================================

/**
 * Cria um pagamento PIX via Stripe
 * O valor vem do produto passado, não do Stripe Dashboard
 */
export async function createPixPayment(
  request: PixCheckoutRequest
): Promise<PixCheckoutResponse> {
  try {
    const createPix = httpsCallable<PixCheckoutRequest, PixCheckoutResponse>(
      functions,
      'createPixPayment'
    );

    const result = await createPix(request);
    return result.data;
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar pagamento PIX',
    };
  }
}

/**
 * Checkout para plano Premium via PIX
 */
export async function checkoutPremium(
  userId: string,
  product: ProductData,
  email?: string,
  name?: string
): Promise<PixCheckoutResponse> {
  return createPixPayment({
    userId,
    product: {
      ...product,
      category: 'premium',
    },
    customerEmail: email,
    customerName: name,
  });
}

/**
 * Checkout para Network Rural via PIX
 */
export async function checkoutNetwork(
  userId: string,
  product: ProductData,
  email?: string,
  name?: string
): Promise<PixCheckoutResponse> {
  return createPixPayment({
    userId,
    product: {
      ...product,
      category: 'network',
    },
    customerEmail: email,
    customerName: name,
  });
}

/**
 * Checkout para item da loja via PIX
 */
export async function checkoutStoreItem(
  userId: string,
  product: ProductData,
  email?: string,
  name?: string
): Promise<PixCheckoutResponse> {
  return createPixPayment({
    userId,
    product: {
      ...product,
      category: 'store',
    },
    customerEmail: email,
    customerName: name,
  });
}

// =============================================================================
// 📊 STATUS DO PAGAMENTO
// =============================================================================

/**
 * Verifica o status de um pagamento
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<{ success: boolean; payment?: PaymentStatus; error?: string }> {
  try {
    const getStatus = httpsCallable<{ paymentId: string }, { success: boolean; payment?: PaymentStatus; error?: string }>(
      functions,
      'getPixPaymentStatus'
    );

    const result = await getStatus({ paymentId });
    return result.data;
  } catch (error: any) {
    console.error('Erro ao obter status do pagamento:', error);
    return {
      success: false,
      error: error.message || 'Erro ao obter status',
    };
  }
}

/**
 * Obtém histórico de pagamentos do usuário
 */
export async function getPaymentHistory(
  userId: string,
  limit?: number
): Promise<PaymentHistoryResponse> {
  try {
    const getHistory = httpsCallable<{ userId: string; limit?: number }, PaymentHistoryResponse>(
      functions,
      'getPaymentHistory'
    );

    const result = await getHistory({ userId, limit });
    return result.data;
  } catch (error: any) {
    console.error('Erro ao obter histórico:', error);
    return {
      success: false,
      error: error.message || 'Erro ao obter histórico',
    };
  }
}

// =============================================================================
// 🔄 CANCELAMENTO
// =============================================================================

/**
 * Cancela um pagamento pendente
 */
export async function cancelPayment(
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cancel = httpsCallable<{ paymentId: string }, { success: boolean; error?: string }>(
      functions,
      'cancelPixPayment'
    );

    const result = await cancel({ paymentId });
    return result.data;
  } catch (error: any) {
    console.error('Erro ao cancelar pagamento:', error);
    return {
      success: false,
      error: error.message || 'Erro ao cancelar pagamento',
    };
  }
}

// =============================================================================
// 🔧 UTILITÁRIOS
// =============================================================================

/**
 * Formata valor de centavos para reais
 */
export function formatPrice(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Verifica se um pagamento está pendente e pode ser pago
 */
export function isPaymentPending(status: PaymentStatus): boolean {
  return status.status === 'pending' && 
         status.expiresAt ? new Date(status.expiresAt) > new Date() : false;
}

/**
 * Verifica se um pagamento expirou
 */
export function isPaymentExpired(status: PaymentStatus): boolean {
  if (status.status === 'expired') return true;
  if (status.status === 'pending' && status.expiresAt) {
    return new Date(status.expiresAt) <= new Date();
  }
  return false;
}
