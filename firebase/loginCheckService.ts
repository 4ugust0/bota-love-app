/**
 * 🔥 BOTA LOVE APP - Login Check Service
 * 
 * Serviço para verificações de status do usuário no login.
 * Chamado automaticamente no login, mas pode ser invocado manualmente.
 * 
 * Funcionalidades:
 * - Verifica assinaturas expiradas
 * - Verifica trial expirando
 * - Verifica chats inativos
 * - Limpa dados antigos do usuário
 * 
 * @author Bota Love Team
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface LoginNotification {
  type: 'subscription_expired' | 'trial_expiring' | 'inactive_chat' | 'info';
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface LoginCheckResult {
  subscriptionUpdated: boolean;
  subscriptionExpired: boolean;
  trialExpiringDays: number | null;
  inactiveChatsCount: number;
  cleanedDataCount: number;
  notifications: LoginNotification[];
}

// =============================================================================
// 🔍 FUNÇÃO DE VERIFICAÇÃO DE LOGIN
// =============================================================================

/**
 * Executa verificações de status do usuário
 * 
 * Esta função é chamada automaticamente no login, mas pode ser chamada
 * manualmente em outros momentos (ex: ao abrir o app após ficar em background)
 * 
 * @param userId - ID do usuário a verificar
 * @returns Resultado das verificações
 */
export async function performLoginCheck(userId: string): Promise<LoginCheckResult | null> {
  try {
    const onUserLogin = httpsCallable<{ userId: string }, LoginCheckResult>(
      functions, 
      'onUserLogin'
    );
    
    const result = await onUserLogin({ userId });
    
    console.log('✅ Verificação de login concluída:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('❌ Erro na verificação de login:', error);
    return null;
  }
}

/**
 * Verifica se há notificações importantes no resultado da verificação
 */
export function hasImportantNotifications(result: LoginCheckResult): boolean {
  return (
    result.subscriptionExpired ||
    (result.trialExpiringDays !== null && result.trialExpiringDays <= 3) ||
    result.inactiveChatsCount > 0
  );
}

/**
 * Retorna apenas as notificações de alta prioridade
 */
export function getHighPriorityNotifications(result: LoginCheckResult): LoginNotification[] {
  return result.notifications.filter(
    (n) => n.type === 'subscription_expired' || n.type === 'trial_expiring'
  );
}

/**
 * Retorna notificações de chats inativos
 */
export function getInactiveChatNotifications(result: LoginCheckResult): LoginNotification[] {
  return result.notifications.filter((n) => n.type === 'inactive_chat');
}
