/**
 * 🎪 BOTA LOVE APP - Event Service
 * 
 * Serviço para gerenciamento de eventos no Firestore:
 * - CRUD de eventos
 * - Pagamentos de eventos
 * - Estatísticas de eventos
 * 
 * @author Bota Love Team
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { firestore } from './config';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export type EventStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type EventType = 'show' | 'feira' | 'rodeio' | 'leilao' | 'circuito' | 'festa' | 'congresso';

export interface Event {
  id: string;
  producerId: string;
  producerName: string;
  
  // Informações básicas
  title: string;
  description: string;
  eventType: EventType;
  externalLink?: string;
  coverImage?: string;
  
  // Data e horário
  eventDate: Timestamp;
  eventTime: string;
  
  // Localização
  venueName: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  
  // Capacidade e preço
  capacity: number;
  ticketPrice?: number;
  
  // Configurações de publicação
  durationDays: number; // 15, 30, 60, 90
  highlightDays?: number; // 15, 30, 60, 90
  isHighlighted: boolean;
  
  // Status e métricas
  status: EventStatus;
  views: number;
  attendees: number;
  interested: number;
  
  // Datas
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp; // Data que o anúncio expira
  highlightExpiresAt?: Timestamp;
}

export interface EventPayment {
  id: string;
  eventId: string;
  producerId: string;
  
  // Valores
  durationPrice: number;
  highlightPrice: number;
  totalAmount: number;
  
  // Detalhes da duração
  durationDays: number;
  highlightDays?: number;
  
  // Status do pagamento
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'simulated' | 'stripe' | 'pix';
  
  // Datas
  createdAt: Timestamp;
  completedAt?: Timestamp;
  
  // Referência (para integração futura)
  transactionId?: string;
}

export interface CreateEventData {
  producerId: string;
  producerName: string;
  title: string;
  description: string;
  eventType: EventType;
  externalLink?: string;
  eventDate: Date;
  eventTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  capacity: number;
  ticketPrice?: number;
  durationDays: number;
  highlightDays?: number;
  isHighlighted: boolean;
}

// =============================================================================
// 📦 COLLECTIONS
// =============================================================================

const EVENTS_COLLECTION = 'events';
const PAYMENTS_COLLECTION = 'payments_event';

// =============================================================================
// 💳 PAGAMENTOS
// =============================================================================

/**
 * Simula o pagamento de um evento
 * (Será substituído por integração real no futuro)
 */
export async function simulateEventPayment(
  eventId: string,
  producerId: string,
  durationPrice: number,
  highlightPrice: number,
  durationDays: number,
  highlightDays?: number
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const totalAmount = durationPrice + highlightPrice;
    
    // Criar registro de pagamento
    const paymentData: any = {
      eventId,
      producerId,
      durationPrice,
      highlightPrice,
      totalAmount,
      durationDays,
      status: 'completed', // Simulado como sucesso
      paymentMethod: 'simulated',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      transactionId: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Adicionar highlightDays apenas se existir
    if (highlightDays) {
      paymentData.highlightDays = highlightDays;
    }

    const paymentRef = await addDoc(collection(firestore, PAYMENTS_COLLECTION), paymentData);

    // Atualizar status do evento para ativo
    await updateDoc(doc(firestore, EVENTS_COLLECTION, eventId), {
      status: 'active',
      updatedAt: serverTimestamp(),
    });

    return { success: true, paymentId: paymentRef.id };
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca pagamentos de um evento
 */
export async function getEventPayments(eventId: string): Promise<EventPayment[]> {
  try {
    const q = query(
      collection(firestore, PAYMENTS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventPayment));
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return [];
  }
}

/**
 * Busca todos os pagamentos de um produtor
 */
export async function getProducerPayments(producerId: string): Promise<EventPayment[]> {
  try {
    const q = query(
      collection(firestore, PAYMENTS_COLLECTION),
      where('producerId', '==', producerId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventPayment));
  } catch (error) {
    console.error('Erro ao buscar pagamentos do produtor:', error);
    return [];
  }
}

// =============================================================================
// 📅 CRUD DE EVENTOS
// =============================================================================

/**
 * Cria um novo evento
 */
export async function createEvent(data: CreateEventData): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const now = Timestamp.now();
    const eventDate = Timestamp.fromDate(data.eventDate);
    
    // Calcular data de expiração do anúncio
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);
    
    // Calcular data de expiração do destaque (se aplicável)
    let highlightExpiresAt: Timestamp | undefined;
    if (data.isHighlighted && data.highlightDays) {
      const highlightExpiry = new Date();
      highlightExpiry.setDate(highlightExpiry.getDate() + data.highlightDays);
      highlightExpiresAt = Timestamp.fromDate(highlightExpiry);
    }

    const eventData: any = {
      producerId: data.producerId,
      producerName: data.producerName,
      title: data.title,
      description: data.description,
      eventType: data.eventType as EventType,
      eventDate,
      eventTime: data.eventTime,
      venueName: data.venueName,
      address: data.address,
      city: data.city,
      state: data.state,
      capacity: data.capacity,
      durationDays: data.durationDays,
      isHighlighted: data.isHighlighted,
      status: 'pending', // Aguardando pagamento
      views: 0,
      attendees: 0,
      interested: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt: Timestamp.fromDate(expiresAt),
    };

    // Adicionar campos opcionais apenas se não forem undefined
    if (data.externalLink) {
      eventData.externalLink = data.externalLink;
    }
    if (data.zipCode) {
      eventData.zipCode = data.zipCode;
    }
    if (data.ticketPrice !== undefined) {
      eventData.ticketPrice = data.ticketPrice;
    }
    if (data.highlightDays) {
      eventData.highlightDays = data.highlightDays;
    }
    if (highlightExpiresAt) {
      eventData.highlightExpiresAt = highlightExpiresAt;
    }

    const eventRef = await addDoc(collection(firestore, EVENTS_COLLECTION), eventData);
    
    return { success: true, eventId: eventRef.id };
  } catch (error: any) {
    console.error('Erro ao criar evento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca um evento por ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const docRef = doc(firestore, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return null;
  }
}

/**
 * Busca todos os eventos de um produtor
 */
export async function getProducerEvents(producerId: string): Promise<Event[]> {
  try {
    const q = query(
      collection(firestore, EVENTS_COLLECTION),
      where('producerId', '==', producerId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error('Erro ao buscar eventos do produtor:', error);
    return [];
  }
}

/**
 * Busca todos os eventos ativos (para exibição pública)
 */
export async function getActiveEvents(): Promise<Event[]> {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(firestore, EVENTS_COLLECTION),
      where('status', '==', 'active'),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'asc'),
      orderBy('eventDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error('Erro ao buscar eventos ativos:', error);
    return [];
  }
}

/**
 * Busca eventos em destaque
 */
export async function getHighlightedEvents(): Promise<Event[]> {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(firestore, EVENTS_COLLECTION),
      where('status', '==', 'active'),
      where('isHighlighted', '==', true),
      where('highlightExpiresAt', '>', now),
      orderBy('highlightExpiresAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error('Erro ao buscar eventos em destaque:', error);
    return [];
  }
}

/**
 * Atualiza um evento
 */
export async function updateEvent(eventId: string, data: Partial<Event>): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(firestore, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar evento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exclui um evento
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(firestore, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir evento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Incrementa visualizações de um evento
 */
export async function incrementEventViews(eventId: string): Promise<void> {
  try {
    const docRef = doc(firestore, EVENTS_COLLECTION, eventId);
    const eventDoc = await getDoc(docRef);
    
    if (eventDoc.exists()) {
      const currentViews = eventDoc.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1,
      });
    }
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
  }
}

/**
 * Incrementa interessados em um evento
 */
export async function incrementEventInterested(eventId: string): Promise<void> {
  try {
    const docRef = doc(firestore, EVENTS_COLLECTION, eventId);
    const eventDoc = await getDoc(docRef);
    
    if (eventDoc.exists()) {
      const currentInterested = eventDoc.data().interested || 0;
      await updateDoc(docRef, {
        interested: currentInterested + 1,
      });
    }
  } catch (error) {
    console.error('Erro ao incrementar interessados:', error);
  }
}

/**
 * Renova um evento (estende duração e destaque)
 */
export async function renewEvent(
  eventId: string,
  producerId: string,
  durationDays: number,
  highlightDays?: number,
  isHighlighted?: boolean
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    // Calcular novas datas de expiração
    const now = new Date();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(now.getDate() + durationDays);
    
    let newHighlightExpiresAt: Timestamp | undefined;
    if (isHighlighted && highlightDays) {
      const highlightExpiry = new Date();
      highlightExpiry.setDate(now.getDate() + highlightDays);
      newHighlightExpiresAt = Timestamp.fromDate(highlightExpiry);
    }

    // Calcular preços (mesma lógica do create-event)
    const durationPrices: { [key: number]: number } = {
      15: 49.90,
      30: 89.90,
      60: 159.90,
      90: 219.90,
    };
    
    const highlightPrices: { [key: number]: number } = {
      15: 29.90,
      30: 49.90,
      60: 79.90,
      90: 99.90,
    };

    const durationPrice = durationPrices[durationDays] || 49.90;
    const highlightPrice = (isHighlighted && highlightDays) ? highlightPrices[highlightDays] : 0;
    const totalAmount = durationPrice + highlightPrice;

    // Criar registro de pagamento de renovação
    const paymentData: any = {
      eventId,
      producerId,
      durationPrice,
      highlightPrice,
      totalAmount,
      durationDays,
      status: 'completed',
      paymentMethod: 'simulated',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      transactionId: `RENEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (highlightDays) {
      paymentData.highlightDays = highlightDays;
    }

    const paymentRef = await addDoc(collection(firestore, PAYMENTS_COLLECTION), paymentData);

    // Atualizar evento com novas datas
    const updateData: any = {
      status: 'active',
      durationDays,
      expiresAt: Timestamp.fromDate(newExpiresAt),
      updatedAt: serverTimestamp(),
    };

    if (isHighlighted !== undefined) {
      updateData.isHighlighted = isHighlighted;
    }
    if (highlightDays) {
      updateData.highlightDays = highlightDays;
    }
    if (newHighlightExpiresAt) {
      updateData.highlightExpiresAt = newHighlightExpiresAt;
    }

    await updateDoc(doc(firestore, EVENTS_COLLECTION, eventId), updateData);

    return { success: true, paymentId: paymentRef.id };
  } catch (error: any) {
    console.error('Erro ao renovar evento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listener em tempo real para eventos do produtor
 */
export function subscribeToProducerEvents(
  producerId: string,
  callback: (events: Event[]) => void
): () => void {
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('producerId', '==', producerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    callback(events);
  });
}

/**
 * Listener em tempo real para eventos ativos
 */
export function subscribeToActiveEvents(callback: (events: Event[]) => void): () => void {
  const now = Timestamp.now();
  const q = query(
    collection(firestore, EVENTS_COLLECTION),
    where('status', '==', 'active'),
    orderBy('eventDate', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    // Filtrar eventos expirados no cliente
    const activeEvents = events.filter(e => e.expiresAt.toMillis() > Date.now());
    callback(activeEvents);
  });
}
