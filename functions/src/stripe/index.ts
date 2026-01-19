/**
 * 🔥 BOTA LOVE APP - Stripe PIX Cloud Functions
 * 
 * Cloud Functions para processamento de pagamentos via PIX:
 * - Criar pagamento PIX
 * - Verificar status do pagamento
 * - Webhook para confirmar pagamentos
 * - Histórico de pagamentos
 * 
 * O Stripe é usado apenas como gateway PIX.
 * Os valores dos produtos vêm do app/backend.
 * 
 * @author Bota Love Team
 * @version 2.0.0
 */

import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const db = getFirestore();

// Configurações
const REGION = 'southamerica-east1';
const PIX_EXPIRATION_MINUTES = 30; // PIX expira em 30 minutos

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface ProductData {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category: 'premium' | 'network' | 'store';
  metadata?: Record<string, any>;
}

interface PixCheckoutRequest {
  userId: string;
  product: ProductData;
  customerEmail?: string;
  customerName?: string;
}

// =============================================================================
// 💳 CRIAR PAGAMENTO PIX
// =============================================================================

export const createPixPayment = onCall(
  { region: REGION },
  async (request) => {
    const { userId, product, customerEmail, customerName } = request.data as PixCheckoutRequest;

    // Validações
    if (!userId) {
      throw new HttpsError('invalid-argument', 'userId é obrigatório');
    }
    if (!product || !product.id || !product.amount) {
      throw new HttpsError('invalid-argument', 'Dados do produto inválidos');
    }
    if (product.amount < 100) {
      throw new HttpsError('invalid-argument', 'Valor mínimo é R$ 1,00');
    }

    try {
      // Buscar ou criar customer no Stripe
      let customerId: string | undefined;
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData?.stripe?.customerId) {
        customerId = userData.stripe.customerId;
      } else if (customerEmail) {
        // Criar customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            userId,
            appName: 'BotaLove',
          },
        });
        customerId = customer.id;
        
        // Salvar customerId no usuário
        await db.collection('users').doc(userId).update({
          'stripe.customerId': customerId,
          'stripe.createdAt': FieldValue.serverTimestamp(),
        });
      }

      // Criar PaymentIntent com PIX
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.amount,
        currency: 'brl',
        payment_method_types: ['pix'],
        customer: customerId,
        description: `${product.name} - Bota Love`,
        metadata: {
          userId,
          productId: product.id,
          productName: product.name,
          category: product.category,
          ...product.metadata,
        },
        // PIX expira em 30 minutos
        payment_method_options: {
          pix: {
            expires_after_seconds: PIX_EXPIRATION_MINUTES * 60,
          },
        },
      });

      // Confirmar para gerar o QR Code PIX
      const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method_data: {
          type: 'pix',
        },
        return_url: 'botalove://payment-callback',
      });

      // Extrair dados do PIX
      const pixAction = confirmedIntent.next_action?.pix_display_qr_code;
      const expiresAt = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);

      // Salvar pagamento no Firestore
      await db.collection('payments').doc(paymentIntent.id).set({
        id: paymentIntent.id,
        userId,
        productId: product.id,
        productName: product.name,
        category: product.category,
        amount: product.amount,
        currency: 'brl',
        status: 'pending',
        pixCode: pixAction?.data || null,
        pixQrCode: pixAction?.image_url_png || null,
        expiresAt: expiresAt.toISOString(),
        metadata: product.metadata || {},
        createdAt: FieldValue.serverTimestamp(),
      });

      // Adicionar à lista de pagamentos do usuário
      await db.collection('users').doc(userId).update({
        'payments': FieldValue.arrayUnion(paymentIntent.id),
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        pixCode: pixAction?.data,
        pixQrCode: pixAction?.image_url_png,
        expiresAt: expiresAt.toISOString(),
        url: confirmedIntent.next_action?.redirect_to_url?.url,
      };
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new HttpsError('internal', error.message || 'Erro ao processar pagamento');
    }
  }
);

// =============================================================================
// 📊 VERIFICAR STATUS DO PAGAMENTO
// =============================================================================

export const getPixPaymentStatus = onCall(
  { region: REGION },
  async (request) => {
    const { paymentId } = request.data;

    if (!paymentId) {
      throw new HttpsError('invalid-argument', 'paymentId é obrigatório');
    }

    try {
      // Buscar no Firestore
      const paymentDoc = await db.collection('payments').doc(paymentId).get();
      
      if (!paymentDoc.exists) {
        throw new HttpsError('not-found', 'Pagamento não encontrado');
      }

      const payment = paymentDoc.data();

      // Se ainda está pendente, verificar no Stripe
      if (payment?.status === 'pending') {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        
        // Atualizar status se mudou
        if (paymentIntent.status !== 'requires_action') {
          const newStatus = mapStripeStatus(paymentIntent.status);
          
          await db.collection('payments').doc(paymentId).update({
            status: newStatus,
            updatedAt: FieldValue.serverTimestamp(),
            ...(newStatus === 'succeeded' ? { paidAt: FieldValue.serverTimestamp() } : {}),
          });

          payment.status = newStatus;
        }

        // Verificar se expirou
        if (payment?.expiresAt && new Date(payment.expiresAt) < new Date()) {
          await db.collection('payments').doc(paymentId).update({
            status: 'expired',
            updatedAt: FieldValue.serverTimestamp(),
          });
          payment.status = 'expired';
        }
      }

      return {
        success: true,
        payment: {
          id: payment?.id,
          status: payment?.status,
          amount: payment?.amount,
          productId: payment?.productId,
          productName: payment?.productName,
          category: payment?.category,
          pixCode: payment?.pixCode,
          pixQrCode: payment?.pixQrCode,
          expiresAt: payment?.expiresAt,
          paidAt: payment?.paidAt,
          userId: payment?.userId,
          createdAt: payment?.createdAt?.toDate?.()?.toISOString() || payment?.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Erro ao verificar pagamento:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// =============================================================================
// 📜 HISTÓRICO DE PAGAMENTOS
// =============================================================================

export const getPaymentHistory = onCall(
  { region: REGION },
  async (request) => {
    const { userId, limit = 20 } = request.data;

    if (!userId) {
      throw new HttpsError('invalid-argument', 'userId é obrigatório');
    }

    try {
      const paymentsSnapshot = await db.collection('payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const payments = paymentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          status: data.status,
          amount: data.amount,
          productId: data.productId,
          productName: data.productName,
          category: data.category,
          expiresAt: data.expiresAt,
          paidAt: data.paidAt?.toDate?.()?.toISOString() || data.paidAt,
          userId: data.userId,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        };
      });

      return {
        success: true,
        payments,
        total: payments.length,
      };
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// =============================================================================
// ❌ CANCELAR PAGAMENTO
// =============================================================================

export const cancelPixPayment = onCall(
  { region: REGION },
  async (request) => {
    const { paymentId } = request.data;

    if (!paymentId) {
      throw new HttpsError('invalid-argument', 'paymentId é obrigatório');
    }

    try {
      // Cancelar no Stripe
      await stripe.paymentIntents.cancel(paymentId);

      // Atualizar no Firestore
      await db.collection('payments').doc(paymentId).update({
        status: 'canceled',
        canceledAt: FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao cancelar pagamento:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// =============================================================================
// 🔔 WEBHOOK DO STRIPE
// =============================================================================

export const stripeWebhook = onRequest(
  { region: REGION },
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      res.status(400).send('Missing signature or webhook secret');
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Processar eventos
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Evento não tratado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).send('Internal Error');
    }
  }
);

// =============================================================================
// 🔧 HANDLERS DO WEBHOOK
// =============================================================================

/**
 * Pagamento PIX confirmado
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { id, metadata } = paymentIntent;
  const { userId, productId, category } = metadata;

  console.log(`✅ Pagamento ${id} confirmado para usuário ${userId}`);

  // Atualizar pagamento
  await db.collection('payments').doc(id).update({
    status: 'succeeded',
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Aplicar benefícios baseado na categoria
  const userRef = db.collection('users').doc(userId);

  switch (category) {
    case 'premium':
      await activatePremiumPlan(userRef, productId, metadata);
      break;

    case 'network':
      await activateNetworkPlan(userRef, productId, metadata);
      break;

    case 'store':
      await creditStoreItems(userRef, productId, metadata);
      break;
  }
}

/**
 * Pagamento falhou
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id } = paymentIntent;

  console.log(`❌ Pagamento ${id} falhou`);

  await db.collection('payments').doc(id).update({
    status: 'failed',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Pagamento cancelado
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const { id } = paymentIntent;

  console.log(`🚫 Pagamento ${id} cancelado`);

  await db.collection('payments').doc(id).update({
    status: 'canceled',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// =============================================================================
// 🎁 APLICAR BENEFÍCIOS
// =============================================================================

/**
 * Ativa plano Premium
 */
async function activatePremiumPlan(
  userRef: FirebaseFirestore.DocumentReference,
  productId: string,
  metadata: Stripe.Metadata
) {
  // Determinar duração baseado no productId
  let daysToAdd = 30; // padrão mensal
  
  if (productId.includes('quarterly') || productId.includes('trimestral')) {
    daysToAdd = 90;
  } else if (productId.includes('annual') || productId.includes('anual')) {
    daysToAdd = 365;
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysToAdd);

  await userRef.update({
    'subscription.plan': productId,
    'subscription.status': 'active',
    'subscription.startDate': FieldValue.serverTimestamp(),
    'subscription.endDate': endDate.toISOString(),
    'subscription.paidAt': FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`🌟 Premium ${productId} ativado até ${endDate.toISOString()}`);
}

/**
 * Ativa plano Network Rural
 */
async function activateNetworkPlan(
  userRef: FirebaseFirestore.DocumentReference,
  productId: string,
  metadata: Stripe.Metadata
) {
  const isLifetime = productId.includes('lifetime') || productId.includes('vitalicio');
  
  let endDate: Date | null = null;
  if (!isLifetime) {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // mensal
  }

  await userRef.update({
    'networkRural.isActive': true,
    'networkRural.subscription.plan': isLifetime ? 'lifetime' : 'monthly',
    'networkRural.subscription.status': 'active',
    'networkRural.subscription.startDate': FieldValue.serverTimestamp(),
    'networkRural.subscription.endDate': endDate?.toISOString() || null,
    'networkRural.subscription.isLifetime': isLifetime,
    'networkRural.subscription.paidAt': FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`🌾 Network Rural ${productId} ativado${isLifetime ? ' (vitalício)' : ''}`);
}

/**
 * Credita itens da loja
 */
async function creditStoreItems(
  userRef: FirebaseFirestore.DocumentReference,
  productId: string,
  metadata: Stripe.Metadata
) {
  const quantity = parseInt(metadata.quantity || '0', 10);
  const itemType = metadata.itemType || '';

  const updates: Record<string, any> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (itemType === 'super_like' || productId.includes('super_like')) {
    updates['inventory.superLikes'] = FieldValue.increment(quantity || extractQuantity(productId));
  }
  
  if (itemType === 'boost' || productId.includes('boost')) {
    updates['inventory.boosts'] = FieldValue.increment(quantity || extractQuantity(productId));
  }

  if (itemType === 'combo' || productId.includes('combo')) {
    // Combo: 10 super likes + 5 boosts
    updates['inventory.superLikes'] = FieldValue.increment(10);
    updates['inventory.boosts'] = FieldValue.increment(5);
  }

  await userRef.update(updates);

  console.log(`🎁 Itens creditados: ${productId}`);
}

/**
 * Extrai quantidade do productId (ex: 'super_like_5' -> 5)
 */
function extractQuantity(productId: string): number {
  const match = productId.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Mapeia status do Stripe para nosso status
 */
function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'succeeded': 'succeeded',
    'processing': 'processing',
    'requires_payment_method': 'failed',
    'requires_confirmation': 'pending',
    'requires_action': 'pending',
    'canceled': 'canceled',
  };
  return statusMap[stripeStatus] || 'pending';
}
