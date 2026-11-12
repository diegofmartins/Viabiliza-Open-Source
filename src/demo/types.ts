import type { ETPData } from '../types';

// --- Armazenamento local (apenas localStorage) ---

export interface DemoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// --- Datas fictícias (compatíveis com Date) ---

export interface DemoTimestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
  toISO: () => string;
}

// --- Registro de ETP no armazenamento local ---

export interface DemoEtp {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  data: ETPData;
  status: 'in_progress' | 'completed' | 'deleted';
  createdAt: DemoTimestamp;
  updatedAt: DemoTimestamp;
  deletedAt?: DemoTimestamp | null;
}

export type DemoEtpRecord = Omit<DemoEtp, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// --- Usuários fictícios ---

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'master';
  status: 'pending' | 'approved' | 'disabled';
  hasAcceptedTerms: boolean;
}

// --- Órgão fictício ---

export interface DemoAgency {
  name: string;
  logoUrl: string;
}

// --- Configurações fictícias ---

export interface DemoSettings {
  chatWebhookUrl?: string;
  geminiApiKey?: string;
}

// --- Inputs ---

export interface SaveEtpInput {
  id?: string | null;
  userId: string;
  userEmail: string;
  title: string;
  data: ETPData;
  status?: 'in_progress' | 'completed';
}