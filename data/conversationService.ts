
export type ConversationStatus = 'active' | 'inactive_48h' | 'inactive_5days' | 'pending_closure' | 'archived';
export type CloseReason = 'no_chemistry' | 'focused_on_work' | 'met_someone' | 'other';

export interface ConversationReminder {
  id: string;
  chatId: string;
  userId: string;
  otherUserId: string;
  lastMessageDate: Date;
  status: ConversationStatus;
  remindersSent: number;
  lastReminderDate?: Date;
}

export interface ClosureMessage {
  reason: CloseReason;
  message: string;
  emoji: string;
}

// Mensagens automáticas de encerramento baseadas no motivo
export const CLOSURE_MESSAGES: Record<CloseReason, ClosureMessage> = {
  no_chemistry: {
    reason: 'no_chemistry',
    message: 'Foi bom prosear, mas não seguimos pela mesma trilha. Boa sorte no Agro! 🌾',
    emoji: '🤝',
  },
  focused_on_work: {
    reason: 'focused_on_work',
    message: 'Obrigado(a) pela prosa! Mas agora to focado(a) na lida rural. Até mais! 🚜',
    emoji: '💼',
  },
  met_someone: {
    reason: 'met_someone',
    message: 'Conheci outro(a) Agrolove e vou dar uma chance. Desejo tudo de bom! ❤️',
    emoji: '💕',
  },
  other: {
    reason: 'other',
    message: 'Obrigado(a) pela prosa, mas vou tocar minha estrada por outro rumo. 🛣️',
    emoji: '👋',
  },
};

// Mensagens de lembrete baseadas no tempo de inatividade
export const REMINDER_MESSAGES = {
  first: (userName: string) =>
    `Ei, ${userName}, a pessoa ainda está esperando sua resposta. Vai deixar ela esperando, não é? 🤠`,
  second: () =>
    'Parece que essa prosa esfriou... Quer continuar ou encerrar educadamente? 🌙',
  closure_suggestion: () =>
    'Já faz um tempo que a conversa parou. Que tal dar um retorno ou encerrar de forma respeitosa? ⏰',
};

// Mock de conversas com lembretes
export let MOCK_REMINDERS: ConversationReminder[] = [
  {
    id: 'reminder-1',
    chatId: 'chat_user-0_user-1',
    userId: 'user-0',
    otherUserId: 'user-1',
    lastMessageDate: new Date(Date.now() - 49 * 60 * 60 * 1000), // 49 horas atrás
    status: 'inactive_48h',
    remindersSent: 1,
    lastReminderDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
  },
  {
    id: 'reminder-2',
    chatId: 'chat_user-0_user-2',
    userId: 'user-0',
    otherUserId: 'user-2',
    lastMessageDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
    status: 'inactive_5days',
    remindersSent: 2,
    lastReminderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
  },
  {
    id: 'reminder-3',
    chatId: 'chat_user-0_user-3',
    userId: 'user-0',
    otherUserId: 'user-3',
    lastMessageDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 dias atrás
    status: 'pending_closure',
    remindersSent: 3,
    lastReminderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
  },
];

/**
 * Calcula o status da conversa baseado na última mensagem
 */
export function calculateConversationStatus(lastMessageDate: Date): ConversationStatus {
  const now = new Date();
  const hoursDiff = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff < 48) {
    return 'active';
  } else if (hoursDiff < 120) { // 5 dias
    return 'inactive_48h';
  } else if (hoursDiff < 168) { // 7 dias
    return 'inactive_5days';
  } else {
    return 'pending_closure';
  }
}

/**
 * Verifica se deve enviar lembrete para a conversa
 */
export function shouldSendReminder(reminder: ConversationReminder): boolean {
  const status = calculateConversationStatus(reminder.lastMessageDate);
  
  // Se já arquivou, não envia lembrete
  if (reminder.status === 'archived') {
    return false;
  }
  
  // Se mudou o status, deve enviar lembrete
  if (status !== reminder.status && status !== 'active') {
    return true;
  }
  
  return false;
}

/**
 * Obtém a mensagem de lembrete apropriada
 */
export function getReminderMessage(reminder: ConversationReminder, userName: string): string {
  const status = calculateConversationStatus(reminder.lastMessageDate);
  
  switch (status) {
    case 'inactive_48h':
      return REMINDER_MESSAGES.first(userName);
    case 'inactive_5days':
      return REMINDER_MESSAGES.second();
    case 'pending_closure':
      return REMINDER_MESSAGES.closure_suggestion();
    default:
      return '';
  }
}

/**
 * Arquiva conversa automaticamente após 7 dias sem ação
 */
export function autoArchiveConversation(reminderId: string): void {
  const index = MOCK_REMINDERS.findIndex(r => r.id === reminderId);
  if (index !== -1) {
    MOCK_REMINDERS[index].status = 'archived';
  }
}

/**
 * Marca a conversa como respondida (reseta status)
 */
export function markConversationAsResponded(reminderId: string): void {
  const index = MOCK_REMINDERS.findIndex(r => r.id === reminderId);
  if (index !== -1) {
    MOCK_REMINDERS[index].lastMessageDate = new Date();
    MOCK_REMINDERS[index].status = 'active';
    MOCK_REMINDERS[index].remindersSent = 0;
  }
}

/**
 * Encerra conversa com motivo e envia mensagem automática
 */
export function closeConversation(
  reminderId: string,
  reason: CloseReason
): ClosureMessage {
  const index = MOCK_REMINDERS.findIndex(r => r.id === reminderId);
  if (index !== -1) {
    MOCK_REMINDERS[index].status = 'archived';
  }
  
  return CLOSURE_MESSAGES[reason];
}

/**
 * Obtém conversas pendentes de lembrete para um usuário
 */
export function getPendingReminders(userId: string): ConversationReminder[] {
  return MOCK_REMINDERS.filter(
    r => r.userId === userId && r.status !== 'archived' && r.status !== 'active'
  );
}

/**
 * Obtém conversas arquivadas
 */
export function getArchivedConversations(userId: string): ConversationReminder[] {
  return MOCK_REMINDERS.filter(r => r.userId === userId && r.status === 'archived');
}
