const env = (import.meta as any).env || {} as Record<string, string | undefined>;

export const IS_DEMO: boolean = env.VITE_DEMO_MODE === 'true';
export const DEMO_UID = 'demo-user-12345';
export const DEMO_STORAGE_KEYS = {
  session: 'demo_session',
  etps: 'demo_etps',
  users: 'demo_users',
  agency: 'demo_agency',
  config: 'demo_config',
} as const;
export const DEMO_USER = {
  uid: DEMO_UID,
  email: 'visitante@exemplo.gov.br',
  displayName: 'Visitante da Demonstração',
  photoURL: '',
};
export const DEMO_AGENCY_NAME = 'Órgão Público Exemplo';
export const DEMO_NOTICE = 'DEMONSTRAÇÃO — dados fictícios';
export const DEMO_DOC_HEADER = 'Documento de demonstração — dados fictícios';
export const DEMO_AI_MESSAGE =
  'A geração por IA não está disponível na demonstração. Instale o Viabiliza para usar.';