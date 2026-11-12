/**
 * Módulo de armazenamento local para o modo demonstração.
 * As operações gravam em localStorage com chave prefixada por "demo_".
 * Acesso a window.localStorage é feito de forma preguiçosa.
 * Datas são armazenadas como strings ISO — JSON.stringify omite funções automaticamente.
 * O método listEtps adiciona toDate() na leitura; o armazenamento mantém ISO strings.
 */
import { DEMO_STORAGE_KEYS } from './config';
import {
  buildDemoEtps,
  DEMO_USERS,
  DEMO_AGENCY,
  DEMO_SETTINGS,
} from './seed';
import type {
  DemoStorage,
  DemoEtpRecord,
  DemoUser,
  DemoAgency,
  DemoSettings,
} from './types';

// Chaves internas (sempre com prefixo demo_)
const DEMO_KEYS = {
  session: DEMO_STORAGE_KEYS.session,
  etps: DEMO_STORAGE_KEYS.etps,
  users: DEMO_STORAGE_KEYS.users,
  agency: DEMO_STORAGE_KEYS.agency,
  config: DEMO_STORAGE_KEYS.config,
} as any;

// Storage (inyetado por setStorageForDemo ou getDemoStore)
let storage: DemoStorage;

// --- Timestamp: strings ISO ---

function tsToISO(ts: any): string {
  if (typeof ts === 'string') return ts;
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof ts.toDate === 'function') return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return '1970-01-01T00:00:00.000Z';
}

// Converter {toDate: ...} de volta para ISO string (para serialização JSON)
function unwrapTS(v: any): string {
  if (v && typeof v === 'object' && 'toDate' in v && typeof v.toDate === 'function') return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return '1970-01-01T00:00:00.000Z';
}

// --- Classe DemoStore ---

export class DemoStore {
  // Construtor recebe o storage injetado
  constructor(private storage: DemoStorage) {}

  // Gravador de JSON (omite funções automaticamente)
  private writeJson(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  private readJson<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === DEMO_KEYS.etps && Array.isArray(parsed)) return parsed.map((data: any) => this.desserializarEtp(data)) as any as T;
    return parsed as T;
  }

  // Sementeira
  private ensureSeeded(): void {
    if (!this.storage.getItem(DEMO_KEYS.etps)) {
      const etpsRaw = buildDemoEtps();
      const etpsLimpos = etpsRaw.map((e: any) => ({
        id: e.id,
        userId: e.userId,
        userEmail: e.userEmail,
        title: e.title,
        data: e.data,
        status: e.status,
        createdAt: tsToISO(e.createdAt),
        updatedAt: tsToISO(e.updatedAt),
        deletedAt: e.deletedAt ? tsToISO(e.deletedAt) : null,
      }));
      this.writeJson(DEMO_KEYS.etps, JSON.stringify(etpsLimpos));
    }
    if (!this.storage.getItem(DEMO_KEYS.users)) this.writeJson(DEMO_KEYS.users, JSON.stringify(DEMO_USERS));
    if (!this.storage.getItem(DEMO_KEYS.agency)) this.writeJson(DEMO_KEYS.agency, JSON.stringify(DEMO_AGENCY));
    if (!this.storage.getItem(DEMO_KEYS.config)) this.writeJson(DEMO_KEYS.config, JSON.stringify(DEMO_SETTINGS));
  }

  // Deserialização JSON → ETP (reconstrói toDate a partir do ISO)
  private desserializarEtp(data: any): DemoEtpRecord {
    const rec: DemoEtpRecord = {
      id: data.id,
      userId: data.userId,
      userEmail: data.userEmail,
      title: data.title,
      data: data.data,
      status: data.status,
      createdAt: data.createdAt ? { toDate: () => new Date(data.createdAt) } as any : {},
      updatedAt: data.updatedAt ? { toDate: () => new Date(data.updatedAt) } as any : {},
      deletedAt: data.deletedAt ? { toDate: () => new Date(data.deletedAt) } as any : null,
    };
    if (rec.data && rec.status && rec.status !== 'deleted') rec.data.status = rec.status;
    return rec;
  }

  // Sessão
  isLoggedIn(): boolean { const r = this.storage.getItem(DEMO_KEYS.session); return r === '1'; }
  login(): void { this.writeJson(DEMO_KEYS.session, '1'); }
  logout(): void { this.writeJson(DEMO_KEYS.session, ''); }

  // ETPs
  listEtps(): any[] {
    this.ensureSeeded();
    const etps: any[] = this.readJson(DEMO_KEYS.etps, []);
    return etps
      .filter((e: any) => e.status !== 'deleted')
      .sort((a: any, b: any) => (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0))
      .map((e: any) => ({
        ...e,
        updatedAt: e.updatedAt ? { toDate: () => new Date(e.updatedAt) } : {},
        createdAt: e.createdAt ? { toDate: () => new Date(e.createdAt) } : {},
      }));
  }
  getEtp(id: string) { return this.listEtps().find((e: any) => e.id === id); }
  saveEtp(input: any): string {
    let id = input.id || 'demo-etp-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const now = new Date();
    const rec: any = {
      id, userId: input.userId, userEmail: input.userEmail,
      title: input.title || 'ETP sem título',
      data: input.data, status: input.status || 'in_progress',
      createdAt: tsToISO(input.createdAt),
      updatedAt: tsToISO({ toDate: () => new Date(now.getTime()), toISO: () => now.toISOString() }),
      deletedAt: null,
    };
    const etps = this.listEtps();
    const idx = etps.findIndex((e: any) => e.id === id);
    // Normalizar {toDate: ...} de volta para ISO string antes de salvar
    const normalize = (v: any) => v && typeof v.toDate === 'function' ? v.toDate().toISOString() : (v || tsToISO(undefined));
    if (idx >= 0) {
      etps[idx] = { ...etps[idx], data: { ...etps[idx].data, ...input.data }, status: input.status || etps[idx].status,
        updatedAt: normalize(etps[idx].updatedAt),
        createdAt: normalize(etps[idx].createdAt) };
    } else {
      etps.push({ ...rec, updatedAt: normalize(rec.updatedAt) });
    }
    etps.sort((a: any, b: any) => (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0));
    this.writeJson(DEMO_KEYS.etps, JSON.stringify(etps));
    return id;
  }
  setEtpStatus(id: string, status: string): void {
    const etps = this.listEtps();
    const idx = etps.findIndex((e: any) => e.id === id);
    if (idx >= 0) {
      etps[idx].status = status;
      const di = etps.findIndex((e: any) => e.id === id);
      if (di >= 0 && etps[di].data) etps[di].data.status = status;
      this.writeJson(DEMO_KEYS.etps, JSON.stringify(etps));
    }
  }

  listTrash(): any[] {
    const etps: any[] = this.readJson(DEMO_KEYS.etps, []);
    return etps.filter((e: any) => e.status === 'deleted')
      .map((e: any) => ({
        ...e,
        updatedAt: e.updatedAt ? { toDate: () => new Date(e.updatedAt) } : {},
      }));
  }
  restoreEtp(id: string): void {
    const etps = this.listEtps();
    const idx = etps.findIndex((e: any) => e.id === id);
    if (idx >= 0) {
      etps[idx].status = 'in_progress';
      etps[idx].deletedAt = null;
      this.writeJson(DEMO_KEYS.etps, JSON.stringify(etps));
    }
  }
  softDeleteEtp(id: string): void {
    const etps = this.listEtps();
    const idx = etps.findIndex((e: any) => e.id === id);
    if (idx >= 0) {
      etps[idx].status = 'deleted';
      etps[idx].deletedAt = tsToISO(new Date());
      this.writeJson(DEMO_KEYS.etps, JSON.stringify(etps));
    }
  }
  permanentlyDeleteEtp(id: string): void {
    const etps = this.listEtps();
    const idx = etps.findIndex((e: any) => e.id === id);
    if (idx >= 0) { etps.splice(idx, 1); this.writeJson(DEMO_KEYS.etps, JSON.stringify(etps)); }
  }

  listUsers(): any[] { return this.readJson(DEMO_KEYS.users, []); }
  getUser(uid: string): any { return this.listUsers().find((u: any) => u.uid === uid); }
  saveUser(user: any): void { const u = this.listUsers(); const idx = u.findIndex((x: any) => x.uid === user.uid); if (idx >= 0) u[idx] = { ...u[idx], ...user }; else u.push(user); this.writeJson(DEMO_KEYS.users, JSON.stringify(u)); }
  updateUser(uid: string, patch: any): void { const u = this.listUsers(); const idx = u.findIndex((x: any) => x.uid === uid); if (idx >= 0) { u[idx] = { ...u[idx], ...patch }; this.writeJson(DEMO_KEYS.users, JSON.stringify(u)); } }
  deleteUser(uid: string): void { const u = this.listUsers().filter((x: any) => x.uid !== uid); this.writeJson(DEMO_KEYS.users, JSON.stringify(u)); }

  getAgency(): any { return this.readJson(DEMO_KEYS.agency, DEMO_AGENCY); }
  saveAgency(agency: any): void { this.writeJson(DEMO_KEYS.agency, JSON.stringify(agency)); }

  getSettings(): any { return this.readJson(DEMO_KEYS.config, DEMO_SETTINGS); }
  saveSettings(settings: any): void { const { geminiApiKey, ...rest } = settings; this.writeJson(DEMO_KEYS.config, JSON.stringify(rest)); }

  reset(): void {
    this.writeJson(DEMO_KEYS.session, this.storage.getItem(DEMO_KEYS.session) || '');
    this.writeJson(DEMO_KEYS.etps, '');
    this.writeJson(DEMO_KEYS.users, '');
    this.writeJson(DEMO_KEYS.agency, '');
    this.writeJson(DEMO_KEYS.config, '');
    this.ensureSeeded();
  }

  clearTrashExpired(): void {
    const etps = this.listEtps();
    const now = Date.now();
    const valid = etps.filter((e: any) => e.status !== 'deleted' || !(e.deletedAt && new Date(e.deletedAt).getTime() < now - 72*60*60*1000));
    this.writeJson(DEMO_KEYS.etps, JSON.stringify(valid));
  }
}

// Exportes globais
export function setStorageForDemo(s: DemoStorage) { storage = s; }
export function createDemoStore(s: DemoStorage) { storage = s; return new DemoStore(s); }
export function getDemoStore() { if (!storage) { const ls: DemoStorage = { getItem: (k:string)=>typeof window!=='undefined'?localStorage.getItem(k):null, setItem: (k:string,v:string)=>typeof window!=='undefined'?localStorage.setItem(k,v):null, removeItem: (k:string)=>typeof window!=='undefined'?localStorage.removeItem(k):null }; setStorageForDemo(ls); } return createDemoStore(storage); }