/**
 * 🔥 BOTA LOVE APP - Firebase Configuration
 * 
 * Configuração centralizada do Firebase SDK
 * Inclui Auth, Firestore, Storage e Cloud Messaging
 * 
 * @author Bota Love Team
 */

import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// =============================================================================
// 🔐 CONFIGURAÇÃO DO FIREBASE (Substituir com suas credenciais)
// =============================================================================

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'your-measurement-id',
};

// =============================================================================
// 🏗️ INICIALIZAÇÃO DO FIREBASE
// =============================================================================

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

// Verificar se o Firebase já foi inicializado
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'southamerica-east1'); // Região Brasil
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'southamerica-east1');
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { app, auth, firestore, functions, storage };

// Export config for debugging (remove in production)
export const getFirebaseConfig = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
});

// =============================================================================
// 🛠️ UTILITÁRIOS
// =============================================================================

/**
 * Verifica se o Firebase está configurado corretamente
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'your-project-id'
  );
}

/**
 * Obtém a região configurada para as Cloud Functions
 */
export function getFunctionsRegion(): string {
  return 'southamerica-east1';
}
