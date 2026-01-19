/**
 * 🔥 BOTA LOVE APP - Storage Service
 * 
 * Gerencia upload e download de arquivos:
 * - Fotos de perfil
 * - Imagens de chat
 * - Imagens de eventos
 * 
 * @author Bota Love Team
 */

import {
    deleteObject,
    getDownloadURL,
    listAll,
    ref,
    uploadBytes,
    uploadBytesResumable,
    UploadTask,
} from 'firebase/storage';
import { storage } from './config';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

// =============================================================================
// 📁 PATHS DE STORAGE
// =============================================================================

const STORAGE_PATHS = {
  profilePhotos: (userId: string) => `users/${userId}/profile`,
  chatImages: (chatId: string) => `chats/${chatId}/images`,
  eventImages: (eventId: string) => `events/${eventId}`,
  temp: (userId: string) => `temp/${userId}`,
} as const;

// =============================================================================
// 📤 UPLOAD DE ARQUIVOS
// =============================================================================

/**
 * Faz upload de foto de perfil
 */
export async function uploadProfilePhoto(
  userId: string,
  uri: string,
  photoIndex: number
): Promise<UploadResult> {
  try {
    const path = `${STORAGE_PATHS.profilePhotos(userId)}/photo_${photoIndex}.jpg`;
    return await uploadImage(uri, path);
  } catch (error: any) {
    console.error('Erro ao fazer upload de foto de perfil:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Faz upload de imagem de chat
 */
export async function uploadChatImage(
  chatId: string,
  uri: string,
  messageId: string
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const path = `${STORAGE_PATHS.chatImages(chatId)}/${messageId}_${timestamp}.jpg`;
    return await uploadImage(uri, path);
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem de chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Faz upload de imagem de evento
 */
export async function uploadEventImage(
  eventId: string,
  uri: string
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const path = `${STORAGE_PATHS.eventImages(eventId)}/cover_${timestamp}.jpg`;
    return await uploadImage(uri, path);
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem de evento:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload genérico de imagem
 */
async function uploadImage(uri: string, path: string): Promise<UploadResult> {
  try {
    // Converter URI para blob
    const blob = await uriToBlob(uri);
    
    // Referência do storage
    const storageRef = ref(storage, path);
    
    // Upload
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
    });
    
    // Obter URL de download
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      url,
      path,
    };
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload com progresso
 */
export function uploadImageWithProgress(
  uri: string,
  path: string,
  onProgress: (progress: UploadProgress) => void
): { task: UploadTask; promise: Promise<UploadResult> } {
  const storageRef = ref(storage, path);
  
  // Converter URI para blob (precisa ser feito antes)
  const promise = new Promise<UploadResult>(async (resolve) => {
    try {
      const blob = await uriToBlob(uri);
      const task = uploadBytesResumable(storageRef, blob, {
        contentType: 'image/jpeg',
      });

      task.on(
        'state_changed',
        (snapshot) => {
          onProgress({
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        },
        (error) => {
          resolve({ success: false, error: error.message });
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ success: true, url, path });
        }
      );
    } catch (error: any) {
      resolve({ success: false, error: error.message });
    }
  });

  // Retornar placeholder task (o real é criado dentro da promise)
  return {
    task: null as any, // Task é gerenciada internamente
    promise,
  };
}

// =============================================================================
// 🗑️ EXCLUSÃO DE ARQUIVOS
// =============================================================================

/**
 * Deleta arquivo por path
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

/**
 * Deleta todas as fotos de perfil do usuário
 */
export async function deleteAllProfilePhotos(userId: string): Promise<void> {
  try {
    const folderRef = ref(storage, STORAGE_PATHS.profilePhotos(userId));
    const result = await listAll(folderRef);
    
    await Promise.all(result.items.map((item) => deleteObject(item)));
  } catch (error) {
    console.error('Erro ao deletar fotos de perfil:', error);
  }
}

// =============================================================================
// 📥 DOWNLOAD DE ARQUIVOS
// =============================================================================

/**
 * Obtém URL de download de um arquivo
 */
export async function getFileUrl(path: string): Promise<string | null> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erro ao obter URL:', error);
    return null;
  }
}

/**
 * Lista arquivos em uma pasta
 */
export async function listFiles(path: string): Promise<string[]> {
  try {
    const folderRef = ref(storage, path);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map((item) => getDownloadURL(item))
    );
    
    return urls;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
}

// =============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Converte URI para Blob
 */
async function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('Erro ao converter URI para Blob'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Gera nome único para arquivo
 */
export function generateFileName(extension: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Valida tipo de arquivo de imagem
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

/**
 * Valida tamanho de arquivo (máximo 5MB por padrão)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { STORAGE_PATHS };
