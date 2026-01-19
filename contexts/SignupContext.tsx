/**
 * 🌾 BOTA LOVE APP - Signup Context
 * 
 * Contexto para gerenciar o estado do fluxo de cadastro entre as telas:
 * - Nome
 * - Email
 * - Verificação de email
 * - Senha
 * - Confirmação de senha
 * - Termos de uso
 * 
 * @author Bota Love Team
 */

import React, { createContext, ReactNode, useContext, useState } from 'react';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export type UserType = 'agro' | 'simpatizante' | 'produtor';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  verificationCode?: string;
  userType?: UserType;
  isAgroUser?: boolean;
}

export interface SignupContextType {
  // Dados do signup
  signupData: SignupData;
  
  // Setters individuais
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setEmailVerified: (verified: boolean) => void;
  setVerificationCode: (code: string) => void;
  setUserType: (type: UserType) => void;
  setIsAgroUser: (isAgro: boolean) => void;
  
  // Utilitários
  resetSignup: () => void;
  isComplete: () => boolean;
}

// =============================================================================
// 📦 ESTADO INICIAL
// =============================================================================

const initialSignupData: SignupData = {
  name: '',
  email: '',
  password: '',
  emailVerified: false,
  verificationCode: undefined,
  userType: undefined,
  isAgroUser: undefined,
};

// =============================================================================
// 🔧 CONTEXTO
// =============================================================================

const SignupContext = createContext<SignupContextType | undefined>(undefined);

// =============================================================================
// 🎯 PROVIDER
// =============================================================================

export function SignupProvider({ children }: { children: ReactNode }) {
  const [signupData, setSignupData] = useState<SignupData>(initialSignupData);

  const setName = (name: string) => {
    setSignupData(prev => ({ ...prev, name }));
  };

  const setEmail = (email: string) => {
    setSignupData(prev => ({ ...prev, email }));
  };

  const setPassword = (password: string) => {
    setSignupData(prev => ({ ...prev, password }));
  };

  const setEmailVerified = (emailVerified: boolean) => {
    setSignupData(prev => ({ ...prev, emailVerified }));
  };

  const setVerificationCode = (verificationCode: string) => {
    setSignupData(prev => ({ ...prev, verificationCode }));
  };

  const setUserType = (userType: UserType) => {
    setSignupData(prev => ({ ...prev, userType }));
  };

  const setIsAgroUser = (isAgroUser: boolean) => {
    setSignupData(prev => ({ ...prev, isAgroUser }));
  };

  const resetSignup = () => {
    setSignupData(initialSignupData);
  };

  const isComplete = () => {
    return !!(
      signupData.name &&
      signupData.email &&
      signupData.password &&
      signupData.emailVerified
    );
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        setName,
        setEmail,
        setPassword,
        setEmailVerified,
        setVerificationCode,
        setUserType,
        setIsAgroUser,
        resetSignup,
        isComplete,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

// =============================================================================
// 🪝 HOOK
// =============================================================================

export function useSignup() {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignup deve ser usado dentro de um SignupProvider');
  }
  return context;
}
