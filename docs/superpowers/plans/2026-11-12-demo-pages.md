# Demonstração pública no GitHub Pages — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar no GitHub Pages uma demonstração do Viabiliza com login fictício de um clique, dados de exemplo e armazenamento apenas no navegador, sem nenhuma chamada a Firebase ou Gemini.

**Architecture:** O mesmo código da versão instalável ganha um modo demonstração ativado pela flag de build `VITE_DEMO_MODE=true` (definida só no workflow do Pages). Nesse modo, `App.tsx` troca leituras/escritas do Firestore por um armazenamento local (`src/demo/demoStore.ts`) com dados iniciais de `src/demo/seed.ts`; IA e notificações são bloqueadas com aviso; a autenticação Firebase usa persistência em memória para não restaurar sessão antiga.

**Tech Stack:** React 19 + TypeScript + Vite 6, Firebase (Auth/Firestore), docx, `node:test` + `tsx` para testes (sem dependências novas).

**Spec:** `docs/superpowers/specs/2026-11-12-demo-pages-design.md`

## Global Constraints

- Nenhuma dependência nova: testes usam `node --import tsx --test` (tsx já é devDependency).
- A flag `VITE_DEMO_MODE=true` aparece **somente** em `.github/workflows/deploy.yml`.
- Todo texto de interface em português; nenhum e-mail, nome ou logo de órgão real nos dados fictícios (usar domínio `@exemplo.gov.br`).
- Build de instalação (sem a flag) mantém login Google, Firestore e IA exatamente como hoje.
- Em demonstração, nenhuma chamada de rede a Firebase/Gemini.
- Commits pequenos e frequentes, mensagens em português no padrão `feat:`, `test:`, `chore:`.
- Branch de trabalho: `feat/demo-pages`, criada a partir de `main`.

## Review Focus

Falhas que o desenho implica e que os testes precisam fixar (cada uma tem teste na tarefa indicada):

1. Visitante com sessão Google antiga no mesmo domínio → a demo não pode chamar `identitytoolkit` (Tarefa 6 + verificação de rede na Tarefa 11).
2. `localStorage` com JSON corrompido → a demo não pode quebrar; deve re-semear (Tarefa 4).
3. Chaves reais deixadas no navegador (`agency_name`, `agency_logo`, `gemini_api_key`) → nunca exibidas nem usadas (Tarefa 5).
4. Datas dos dados fictícios → o dashboard chama `updatedAt.toDate()`; o store precisa devolver esse método (Tarefa 4).
5. Salvar após recarregar a página → segundo salvamento deve atualizar o ETP, não duplicar (Tarefa 4).
6. `localStorage` cheio → o salvamento deve mostrar erro e sair de "Salvando...", não travar (Tarefas 4 e 8).

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/demo/config.ts` (novo) | Flag `IS_DEMO`, UID, chaves `demo_*`, textos fixos |
| `src/demo/types.ts` (novo) | Tipos do armazenamento local (ETP, usuário, órgão, storage) |
| `src/demo/seed.ts` (novo) | Dados fictícios iniciais (2 ETPs, 3 usuários, órgão) |
| `src/demo/demoStore.ts` (novo) | Leitura/gravação somente em `localStorage` |
| `src/constants/etpInitialState.ts` (novo) | `INITIAL_STATE` e `INITIAL_DFD_STATE` extraídos de `App.tsx` |
| `src/App.tsx` | Ramos de demonstração, tela de entrada, faixa, avisos |
| `src/firebase.ts` | Persistência em memória e sem teste de conexão em demo |
| `tests/demo/config.test.ts` (novo) | Testes da configuração |
| `tests/demo/store.test.ts` (novo) | Testes do armazenamento local |
| `package.json` | Script `test` |
| `.github/workflows/deploy.yml` | Flag `VITE_DEMO_MODE` e execução dos testes |

---

### Task 1: Infraestrutura de testes e configuração da demo

**Files:**
- Create: `src/demo/config.ts`
- Create: `tests/demo/config.test.ts`
- Modify: `package.json` (scripts), `src/vite-env.d.ts`
- Modify: `.github/workflows/deploy.yml` (passo de testes)

**Interfaces:**
- Produces: `IS_DEMO: boolean`, `DEMO_UID: string`, `DEMO_STORAGE_KEYS` (`session|etps|users|agency|config`), `DEMO_USER`, `DEMO_NOTICE`, `DEMO_DOC_HEADER`, `DEMO_AI_MESSAGE`, `DEMO_AGENCY_NAME`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/demo/config.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IS_DEMO, DEMO_UID, DEMO_STORAGE_KEYS, DEMO_DOC_HEADER, DEMO_AI_MESSAGE,
} from '../../src/demo/config.ts';

test('fora do build de demonstração, IS_DEMO é false', () => {
  assert.equal(IS_DEMO, false);
});

test('chaves locais ficam isoladas do app real', () => {
  assert.deepEqual(Object.values(DEMO_STORAGE_KEYS), [
    'demo_session', 'demo_etps', 'demo_users', 'demo_agency', 'demo_config',
  ]);
});

test('identidade e textos fixos da demonstração', () => {
  assert.equal(DEMO_UID, 'demo-user-12345');
  assert.equal(DEMO_DOC_HEADER, 'Documento de demonstração — dados fictícios');
  assert.match(DEMO_AI_MESSAGE, /não está disponível na demonstração/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --import tsx --test tests/demo/config.test.ts`
Expected: FAIL — `Cannot find module '../../src/demo/config.ts'`.

- [ ] **Step 3: Implementar `src/demo/config.ts`**

```ts
const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

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
```

Em `src/vite-env.d.ts`, adicionar `VITE_DEMO_MODE?: string;` na interface `ImportMetaEnv` existente.

Em `package.json`, adicionar `"test": "node --import tsx --test tests/demo/*.test.ts"`.

Em `.github/workflows/deploy.yml`, antes do passo `Build`, adicionar:

```yaml
      - name: Test
        run: npm test
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: 3 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/demo/config.ts tests/demo/config.test.ts package.json src/vite-env.d.ts .github/workflows/deploy.yml
git commit -m "feat: configuracao e testes do modo demonstracao"
```

---

### Task 2: Extrair o estado inicial do ETP

**Files:**
- Create: `src/constants/etpInitialState.ts`
- Modify: `src/App.tsx` (remover `const INITIAL_STATE` e `const INITIAL_DFD_STATE`, importar)

**Interfaces:**
- Produces: `INITIAL_STATE: ETPData`, `INITIAL_DFD_STATE: DFDData`.
- Consumes: tipos `ETPData`, `DFDData` de `src/types.ts`.

- [ ] **Step 1: Mover o bloco**

Recortar de `src/App.tsx` (a partir de `const INITIAL_STATE: ETPData = {` até o fechamento de `INITIAL_DFD_STATE`, atualmente linhas 638–699) para `src/constants/etpInitialState.ts`, exportando as duas constantes e importando os tipos:

```ts
import type { ETPData, DFDData } from '../types';

export const INITIAL_STATE: ETPData = { /* conteúdo movido sem alterações */ };
export const INITIAL_DFD_STATE: DFDData = { /* conteúdo movido sem alterações */ };
```

Em `src/App.tsx`, substituir as definições por:

```ts
import { INITIAL_STATE, INITIAL_DFD_STATE } from './constants/etpInitialState';
```

- [ ] **Step 2: Verificar**

Run: `grep -n "const INITIAL_STATE" src/App.tsx`
Expected: nenhum resultado.

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run build`
Expected: build concluído.

- [ ] **Step 3: Commit**

```bash
git add src/constants/etpInitialState.ts src/App.tsx
git commit -m "refactor: extrair estado inicial do ETP para modulo proprio"
```

---

### Task 3: Tipos e dados fictícios

**Files:**
- Create: `src/demo/types.ts`
- Create: `src/demo/seed.ts`
- Create: `tests/demo/seed.test.ts`

**Interfaces:**
- Consumes: `INITIAL_STATE` (Task 2), `DEMO_UID`, `DEMO_AGENCY_NAME` (Task 1).
- Produces: `DemoStorage`, `DemoTimestamp`, `DemoEtp`, `DemoEtpRecord`, `DemoUser`, `DemoAgency`, `DemoSettings`, `SaveEtpInput`; `buildDemoEtps(): DemoEtpRecord[]`, `DEMO_USERS: DemoUser[]`, `DEMO_AGENCY: DemoAgency`, `DEMO_SETTINGS: DemoSettings`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/demo/seed.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoEtps, DEMO_USERS, DEMO_AGENCY } from '../../src/demo/seed.ts';

test('dois ETPs fictícios, um em andamento e um concluído', () => {
  const etps = buildDemoEtps();
  assert.equal(etps.length, 2);
  assert.deepEqual(etps.map(e => e.status).sort(), ['completed', 'in_progress']);
  assert.ok(etps.every(e => e.data.etp_name.length > 20));
  assert.ok(etps.every(e => e.data.diag_problema_necessidade.length > 60));
  assert.ok(etps.every(e => e.data.objeto_sucinto.length > 20));
  assert.ok(etps.every(e => e.userEmail.endsWith('@exemplo.gov.br')));
});

test('três usuários fictícios, sem e-mail de órgão real', () => {
  assert.equal(DEMO_USERS.length, 3);
  assert.ok(DEMO_USERS.every(u => u.email.endsWith('@exemplo.gov.br')));
  assert.equal(DEMO_USERS.filter(u => u.status === 'pending').length, 1);
  assert.equal(DEMO_USERS.filter(u => u.role === 'master').length, 1);
});

test('órgão fictício não usa nome real', () => {
  assert.equal(DEMO_AGENCY.name, 'Órgão Público Exemplo');
  assert.equal(DEMO_AGENCY.logoUrl, '');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — módulo `src/demo/seed.ts` não encontrado.

- [ ] **Step 3: Implementar `src/demo/types.ts` e `src/demo/seed.ts`**

`types.ts` — assinaturas exatas:

```ts
import type { ETPData } from '../types';

export interface DemoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface DemoTimestamp { toDate(): Date; seconds: number; nanoseconds: number; }
export interface DemoEtp {
  id: string; userId: string; userEmail: string; title: string;
  data: ETPData; status: 'in_progress' | 'completed' | 'deleted';
  createdAt: DemoTimestamp; updatedAt: DemoTimestamp; deletedAt?: DemoTimestamp | null;
}
export type DemoEtpRecord = Omit<DemoEtp, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  createdAt: string; updatedAt: string; deletedAt?: string | null;
};
export interface DemoUser {
  uid: string; email: string; displayName: string;
  role: 'user' | 'master'; status: 'pending' | 'approved' | 'disabled';
  hasAcceptedTerms: boolean;
}
export interface DemoAgency { name: string; logoUrl: string; }
export interface DemoSettings { chatWebhookUrl?: string; geminiApiKey?: string; }
export interface SaveEtpInput {
  id?: string | null; userId: string; userEmail: string; title: string;
  data: ETPData; status?: 'in_progress' | 'completed';
}
```

`seed.ts` — dois ETPs construídos com `{ ...INITIAL_STATE, ...overrides }`:

1. `demo-etp-notebooks`, título `Aquisição de notebooks para modernização do atendimento`, `status: 'in_progress'`, `updatedAt: '2026-11-10T09:15:00.000Z'`, `createdAt: '2026-11-03T13:00:00.000Z'`. Preencher com texto realista (2–4 frases cada): `diag_problema_necessidade`, `diag_alternativas_solucao`, `diag_objeto_vigencia`, `diag_quantidades_valor`, `objeto_sucinto`, `especificacoes_tecnicas`, `justificativa_necessidade`, `estimativa_quantidades_texto`, `estimativa_valor_texto`, `resultados_pretendidos`, `alinhamento_planejamento`, `unidade_requisitante: 'Secretaria de Administração (exemplo)'`, `processo_spae: 'SPAE 0000/2026 (exemplo)'`, `data_documento: '2026-11-10'`.
2. `demo-etp-manutencao`, título `Contratação de manutenção predial preventiva`, `status: 'completed'`, `updatedAt: '2026-10-28T16:40:00.000Z'`, `createdAt: '2026-10-01T11:30:00.000Z'`. Preencher os mesmos campos com outro conteúdo realista; incluir `include_riscos_interna: true`, `include_riscos_externa: true` e `analise_riscos_resumo`.

Ambos: `userEmail: 'servidor@exemplo.gov.br'`, `userId: 'demo-user-servidor'`, `title` igual a `data.etp_name`, `status` do registro igual a `data.status`.

`DEMO_USERS`: master `visitante@exemplo.gov.br` (`uid: DEMO_UID`, nome `Visitante da Demonstração`, `approved`), servidor `servidor@exemplo.gov.br` (`demo-user-servidor`, `approved`), pendente `novo.servidor@exemplo.gov.br` (`demo-user-pendente`, `pending`). Todos com `hasAcceptedTerms: true` exceto o pendente (`false`).

`DEMO_AGENCY = { name: DEMO_AGENCY_NAME, logoUrl: '' }`; `DEMO_SETTINGS = {}`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: 6 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/demo/types.ts src/demo/seed.ts tests/demo/seed.test.ts
git commit -m "feat: dados ficticios da demonstracao"
```

---

### Task 4: Armazenamento local — sessão e ETPs

**Files:**
- Create: `src/demo/demoStore.ts`
- Create: `tests/demo/store.test.ts`

**Interfaces:**
- Consumes: `DemoStorage`, `DemoEtpRecord`, `SaveEtpInput` (Task 3); `buildDemoEtps`, `DEMO_USERS`, `DEMO_AGENCY`, `DEMO_SETTINGS` (Task 3); `DEMO_STORAGE_KEYS` (Task 1).
- Produces: `createDemoStore(storage: DemoStorage): DemoStore` e `getDemoStore(): DemoStore` com os métodos `isLoggedIn`, `login`, `logout`, `listEtps`, `listTrash`, `getEtp`, `saveEtp`, `updateEtp`, `softDeleteEtp`, `restoreEtp`, `permanentlyDeleteEtp`, `setEtpStatus`, `clearTrashExpired`, `listUsers`, `saveUser`, `updateUser`, `deleteUser`, `getAgency`, `saveAgency`, `getSettings`, `saveSettings`, `importBackup`, `reset`.

- [ ] **Step 1: Escrever os testes que falham**

`tests/demo/store.test.ts` (além dos testes abaixo, declarar `class FakeStorage` com `Map` e implementar `getItem/setItem/removeItem`):

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoStore } from '../../src/demo/demoStore.ts';
import { buildDemoEtps } from '../../src/demo/seed.ts';
// FakeStorage: implementa DemoStorage sobre um Map<string, string>

test('primeira leitura semeia 2 ETPs e 3 usuários', () => {
  const s = createDemoStore(new FakeStorage());
  assert.equal(s.listEtps().length, 2);
  assert.equal(s.listUsers().length, 3);
});

test('salvar cria ETP novo e devolve id; listagem ordena por atualização', () => {
  const s = createDemoStore(new FakeStorage());
  const id = s.saveEtp({ userId: 'u1', userEmail: 'a@exemplo.gov.br', title: 'Teste', data: { etp_name: 'Teste' } as any });
  assert.match(id, /^demo-etp-/);
  const list = s.listEtps();
  assert.equal(list.length, 3);
  assert.equal(list[0].id, id);
});

test('segundo salvamento atualiza o mesmo ETP e preserva createdAt', () => {
  const s = createDemoStore(new FakeStorage());
  const id = s.saveEtp({ userId: 'u1', userEmail: 'a@exemplo.gov.br', title: 'V1', data: { etp_name: 'V1' } as any });
  const antes = s.getEtp(id)!.createdAt.toDate().toISOString();
  s.saveEtp({ id, userId: 'u1', userEmail: 'a@exemplo.gov.br', title: 'V2', data: { etp_name: 'V2' } as any });
  assert.equal(s.listEtps().length, 3);
  assert.equal(s.getEtp(id)!.data.etp_name, 'V2');
  assert.equal(s.getEtp(id)!.createdAt.toDate().toISOString(), antes);
});

test('excluir move para a lixeira e restaurar devolve', () => {
  const s = createDemoStore(new FakeStorage());
  const id = s.listEtps()[0].id;
  s.softDeleteEtp(id);
  assert.equal(s.listEtps().some(e => e.id === id), false);
  assert.equal(s.listTrash().some(e => e.id === id), true);
  s.restoreEtp(id);
  assert.equal(s.listEtps().some(e => e.id === id), true);
});

test('status altera registro e conteúdo do ETP', () => {
  const s = createDemoStore(new FakeStorage());
  const id = s.listEtps()[0].id;
  s.setEtpStatus(id, 'completed');
  assert.equal(s.getEtp(id)!.status, 'completed');
  assert.equal(s.getEtp(id)!.data.status, 'completed');
});

test('datas expõem toDate()', () => {
  const s = createDemoStore(new FakeStorage());
  assert.ok(s.listEtps()[0].updatedAt.toDate() instanceof Date);
});

test('JSON corrompido não quebra: re-semeia', () => {
  const storage = new FakeStorage();
  storage.setItem('demo_etps', '{lixo');
  const s = createDemoStore(storage);
  assert.equal(s.listEtps().length, 2);
});

test('armazenamento cheio vira erro claro, sem travar', () => {
  const storage = new FakeStorage();
  const s = createDemoStore(storage);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(
    () => s.saveEtp({ userId: 'u1', userEmail: 'a@exemplo.gov.br', title: 'X', data: {} as any }),
    /Armazenamento do navegador cheio/
  );
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — módulo `src/demo/demoStore.ts` não encontrado.

- [ ] **Step 3: Implementar `src/demo/demoStore.ts` (parte 1: sessão e ETPs)**

Regras que os testes fixam:

- `ensureSeeded()`: se a chave `etps` não existir, gravar `buildDemoEtps()`; se `users` não existir, `DEMO_USERS`; se `agency` não existir, `DEMO_AGENCY`.
- `readJson<T>(key, fallback)`: `try/catch` no `JSON.parse`; em erro, remover a chave e devolver o fallback.
- Hidratação: converter strings ISO em `{ toDate: () => new Date(iso), seconds, nanoseconds }`; `toISO` aceita string, `Date` ou objeto com `toDate`.
- `listEtps()`: `status !== 'deleted'`, ordenado por `updatedAt` decrescente.
- `listTrash()`: `status === 'deleted'` e `deletedAt` há menos de 72 horas.
- `saveEtp(input)`: id existente → atualiza e preserva `createdAt`; sem id → `'demo-etp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)`. `title` vazio → `'ETP sem título'`; `status` padrão `'in_progress'`; sempre atualiza `updatedAt`.
- `setEtpStatus(id, status)`: grava `status` e `data.status`.
- `softDeleteEtp`: `status='deleted'`, `deletedAt` e `updatedAt` = agora. `restoreEtp`: `status='in_progress'`, `deletedAt=null`.
- Qualquer falha de `storage.setItem` em `saveEtp` é relançada como `new Error('Armazenamento do navegador cheio. Restaure os dados de exemplo.')`.
- `getDemoStore()`: instância única e preguiçosa sobre `window.localStorage` (não acessar `window` no topo do módulo — os testes importam o módulo no Node).

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos os testes de `store.test.ts` passando.

- [ ] **Step 5: Commit**

```bash
git add src/demo/demoStore.ts tests/demo/store.test.ts
git commit -m "feat: armazenamento local da demonstracao para ETPs"
```

---

### Task 5: Armazenamento local — usuários, órgão, configurações e reset

**Files:**
- Modify: `src/demo/demoStore.ts`
- Modify: `tests/demo/store.test.ts`

**Interfaces:**
- Produces: `listUsers()`, `saveUser(user)`, `updateUser(uid, patch)`, `deleteUser(uid)`, `getAgency()`, `saveAgency(agency)`, `getSettings()`, `saveSettings(settings)`, `importBackup({ users?, drafts? }): { users: number; etps: number }`, `reset(): void`, `clearTrashExpired(): void`.

- [ ] **Step 1: Escrever os testes que falham**

Acrescentar a `tests/demo/store.test.ts`:

```ts
test('sessão: login grava demo_session, logout remove', () => {
  const s = createDemoStore(new FakeStorage());
  assert.equal(s.isLoggedIn(), false);
  s.login();
  assert.equal(s.isLoggedIn(), true);
  s.logout();
  assert.equal(s.isLoggedIn(), false);
});

test('chaves antigas do app real são ignoradas', () => {
  const storage = new FakeStorage();
  storage.setItem('agency_name', 'Câmara Municipal de Curitiba');
  storage.setItem('gemini_api_key', 'AIzaSyCHAVE-REAL');
  const s = createDemoStore(storage);
  assert.equal(s.getAgency().name, 'Órgão Público Exemplo');
  assert.equal(s.getSettings().geminiApiKey, undefined);
});

test('salvar configurações nunca persiste chave Gemini', () => {
  const s = createDemoStore(new FakeStorage());
  s.saveSettings({ chatWebhookUrl: 'https://exemplo', geminiApiKey: 'AIzaSyQUALQUER' });
  assert.equal(s.getSettings().geminiApiKey, undefined);
});

test('administração: aprovar, mudar papel e excluir usuário', () => {
  const s = createDemoStore(new FakeStorage());
  s.updateUser('demo-user-pendente', { status: 'approved' });
  assert.equal(s.listUsers().find(u => u.uid === 'demo-user-pendente')!.status, 'approved');
  s.updateUser('demo-user-pendente', { role: 'master' });
  assert.equal(s.listUsers().find(u => u.uid === 'demo-user-pendente')!.role, 'master');
  s.deleteUser('demo-user-pendente');
  assert.equal(s.listUsers().some(u => u.uid === 'demo-user-pendente'), false);
});

test('reset volta aos dados de exemplo e mantém a sessão', () => {
  const s = createDemoStore(new FakeStorage());
  s.login();
  s.softDeleteEtp(s.listEtps()[0].id);
  s.reset();
  assert.equal(s.listEtps().length, 2);
  assert.equal(s.listUsers().length, 3);
  assert.equal(s.isLoggedIn(), true);
});

test('importar backup substitui usuários e ETPs', () => {
  const s = createDemoStore(new FakeStorage());
  const r = s.importBackup({
    users: [{ uid: 'u9', email: 'u9@exemplo.gov.br', displayName: 'U9', role: 'user', status: 'approved', hasAcceptedTerms: true }],
    drafts: [{ id: 'etp-9', userId: 'u9', userEmail: 'u9@exemplo.gov.br', title: 'Importado', data: { etp_name: 'Importado' }, status: 'in_progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  });
  assert.deepEqual(r, { users: 1, etps: 1 });
  assert.equal(s.listUsers().length, 1);
  assert.equal(s.listEtps().length, 1);
  assert.equal(s.listEtps()[0].title, 'Importado');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — métodos não implementados.

- [ ] **Step 3: Implementar os métodos restantes**

Regras:

- `saveUser`: upsert por `uid`; `updateUser`: merge raso; `deleteUser`: remove por `uid`.
- `getAgency()` lê **somente** `demo_agency`; `saveAgency` grava `{ name, logoUrl }` nessa chave (nunca `agency_name`/`agency_logo`).
- `getSettings()` lê `demo_config`; `saveSettings` grava apenas `chatWebhookUrl` (descarta `geminiApiKey`).
- `importBackup`: normaliza usuários (`uid || id`) e ETPs (mantém `id`); substitui as listas; devolve contagens.
- `reset()`: remove `etps`, `users`, `agency`, `config` (mantém `session`), depois `ensureSeeded()`.
- `clearTrashExpired()`: remove definitivamente os itens de `listTrash()` vencidos.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos os testes passando (config + seed + store).

- [ ] **Step 5: Commit**

```bash
git add src/demo/demoStore.ts tests/demo/store.test.ts
git commit -m "feat: administracao e configuracoes no armazenamento da demonstracao"
```

---

### Task 6: Firebase seguro no modo demonstração

**Files:**
- Modify: `src/firebase.ts:2,8,53`

**Interfaces:**
- Consumes: `IS_DEMO` (Task 1).
- Produces: `auth` com persistência em memória em demo; nenhuma chamada de rede na inicialização.

- [ ] **Step 1: Implementar**

Trocar o import de auth para incluir `initializeAuth, inMemoryPersistence` e a criação:

```ts
export const auth = IS_DEMO
  ? initializeAuth(app, { persistence: inMemoryPersistence })
  : getAuth(app);
```

Envolver o teste de conexão: `if (!IS_DEMO) testConnection();`

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `VITE_DEMO_MODE=true BASE_PATH=/Viabiliza-Open-Source/ npx vite build`
Expected: build concluído.

Run: `grep -c "inMemoryPersistence" dist/assets/*.js`
Expected: pelo menos 1.

- [ ] **Step 3: Commit**

```bash
git add src/firebase.ts
git commit -m "feat: inicializar firebase sem sessao persistente na demonstracao"
```

---

### Task 7: Entrada, sessão e faixa da demonstração

**Files:**
- Modify: `src/App.tsx` (imports; efeito de auth ~l.933; `handleDemoLogin` ~l.1335; `handleLogout` ~l.1351; tela de login ~l.2546; retorno principal ~l.3989)

**Interfaces:**
- Consumes: `IS_DEMO`, `DEMO_USER`, `DEMO_NOTICE` (Task 1); `getDemoStore` (Tasks 4–5).

- [ ] **Step 1: Bootstrap da sessão**

No início do efeito de auth (`useEffect` que chama `onAuthStateChanged`), antes do fallback timer:

```ts
if (IS_DEMO) {
  const store = getDemoStore();
  if (store.isLoggedIn()) {
    setUser(DEMO_USER as any);
    setUserRole('master');
    setUserStatus('approved');
    setHasAcceptedTerms(true);
  }
  setIsAuthReady(true);
  return;
}
```

- [ ] **Step 2: Entrar e sair**

`handleDemoLogin`: remover o bloqueio por `process.env.NODE_ENV`; chamar `getDemoStore().login()`; usar `DEMO_USER` no lugar do usuário/e-mail fixos; manter `master/approved/hasAcceptedTerms`.

`handleLogout`: em demo, `getDemoStore().logout()` e pular `signOut(auth)` (usar `if (!IS_DEMO) await signOut(auth);`).

- [ ] **Step 3: Tela de entrada**

No cartão de login: esconder o botão Google com `{!IS_DEMO && (...)}` e o bloco de demo existente com `{IS_DEMO && (...)}`; o botão passa a ter o texto `Entrar na demonstração` e, abaixo dele, o parágrafo `Dados fictícios. Nada é enviado a servidores.` Trocar a descrição do topo em demo para `Conheça o Viabiliza com dados de exemplo. Nada é gravado em servidores.`

- [ ] **Step 4: Faixa fixa**

Logo após `<div className="min-h-screen bg-slate-50">` (retorno principal, ~l.3990), inserir:

```tsx
{IS_DEMO && (
  <div className="bg-amber-400 text-amber-950 text-center text-[10px] font-black uppercase tracking-widest py-1.5 px-3 no-print">
    {DEMO_NOTICE} — nada é enviado a servidores
  </div>
)}
```

Adicionar também o botão `Restaurar dados de exemplo` no menu do usuário (ao lado de `Sair`), visível só em demo, que executa `getDemoStore().reset()` e `window.location.reload()`.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `VITE_DEMO_MODE=true BASE_PATH=/Viabiliza-Open-Source/ npx vite build`
Expected: build concluído.

Run: `grep -c "Entrar na demonstração" dist/assets/*.js`
Expected: pelo menos 1.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: entrada e faixa da demonstracao"
```

---

### Task 8: ETPs no armazenamento local (ler, salvar, excluir, restaurar)

**Files:**
- Modify: `src/App.tsx` (efeitos de lista/lixeira ~l.1155–1235; `saveDraft` ~l.1394; `deleteDraft` ~l.1515; `restoreDraft` ~l.1546; `permanentDeleteDraft` ~l.1558; `toggleETPStatus` ~l.1570; `handleAcceptTerms` ~l.1791)

**Interfaces:**
- Consumes: `getDemoStore()` (Tasks 4–5), `IS_DEMO`.

- [ ] **Step 1: Criar o atualizador único**

Antes dos efeitos de dados, dentro de `App`:

```ts
const refreshDemoData = () => {
  const store = getDemoStore();
  setDrafts(store.listEtps());
  setAllUsers(store.listUsers());
  setTrashDrafts(store.listTrash());
  setAgencyConfig(store.getAgency());
  setSystemSettings(store.getSettings());
};
```

- [ ] **Step 2: Trocar os leitores**

Em cada efeito de lista (`drafts`, `trash`, `users`) e no de configuração do sistema, adicionar no topo do corpo:

```ts
if (IS_DEMO) { refreshDemoData(); return; }
```

Substituir os ramos `user.uid === 'demo-user-12345'` existentes por `IS_DEMO` para não dependerem de UID.

- [ ] **Step 3: Trocar o salvamento**

Substituir o ramo demo de `saveDraft` (~l.1394–1410) por:

```ts
if (IS_DEMO) {
  const id = getDemoStore().saveEtp({
    id: currentDraftId,
    userId: user.uid,
    userEmail: user.email || '',
    title: formData.etp_name || 'ETP sem título',
    data: formData,
    status: formData.status === 'completed' ? 'completed' : 'in_progress',
  });
  setCurrentDraftId(id);
  lastSavedDataRef.current = currentDataStr;
  refreshDemoData();
  setApiError(null);
  return;
}
```

Manter o ramo dentro do `try` existente: erro de armazenamento cheio cai no `catch` e o `finally` desliga `isSaving`.

- [ ] **Step 4: Trocar exclusão, restauração, status e aceite**

Adicionar no topo de cada função, antes do Firestore:

```ts
// deleteDraft
if (IS_DEMO) {
  getDemoStore().softDeleteEtp(id);
  refreshDemoData();
  if (currentDraftId === id) { setFormData(INITIAL_STATE); setCurrentDraftId(null); setView('dashboard'); }
  setDeleteConfirmId(null);
  return;
}

// restoreDraft
if (IS_DEMO) { getDemoStore().restoreEtp(id); refreshDemoData(); return; }

// permanentDeleteDraft
if (IS_DEMO) { getDemoStore().permanentlyDeleteEtp(id); refreshDemoData(); return; }

// toggleETPStatus (newStatus já calculado no topo da função)
if (IS_DEMO) { getDemoStore().setEtpStatus(draftId, newStatus); refreshDemoData(); return; }

// handleAcceptTerms
if (IS_DEMO) { setHasAcceptedTerms(true); setShowWelcomePopup(false); return; }
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `grep -n "demo-user-12345" src/App.tsx`
Expected: nenhum resultado (todos substituídos por `IS_DEMO`/`DEMO_UID`).

Run: `npm test`
Expected: todos passando.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: ETPs da demonstracao salvos no navegador"
```

---

### Task 9: Administração, órgão, configurações e backup na demo

**Files:**
- Modify: `src/App.tsx` (`saveAgencyConfig` ~l.742; efeito de órgão ~l.732; `updateSystemSettings` ~l.1254; `reassignDraft` ~l.1627; `updateUserStatus/Role/Delete` ~l.1657–1687; `exportBackup` ~l.1808; `confirmImportBackup` ~l.1874; UI de configurações ~l.3740; diagnóstico ~l.3643)

**Interfaces:**
- Consumes: `getDemoStore()` (Tasks 4–5), `IS_DEMO`.

- [ ] **Step 1: Ramos de demonstração**

- Efeito que lê `settings/agency`: `if (IS_DEMO) return;` (a configuração vem do `refreshDemoData`).
- `saveAgencyConfig`: em demo, `getDemoStore().saveAgency({ name, logoUrl })`, atualizar estado e mensagem, sem `setDoc`.
- `updateSystemSettings`: em demo, `getDemoStore().saveSettings(newSettings)` (o store descarta a chave Gemini) e mensagem `Configurações da demonstração atualizadas.`
- `reassignDraft`: em demo, procurar o usuário por e-mail em `listUsers()`, chamar `updateEtp(draftId, { userId, userEmail })` e `refreshDemoData()`; e-mail inexistente → mesma mensagem atual.
- `updateUserStatus`, `updateUserRole`, `deleteUser`: em demo, chamar `updateUser`/`deleteUser` e `refreshDemoData()`.
- `exportBackup`: em demo, montar o JSON com `listEtps()` + `listTrash()` + `listUsers()` e baixar (mesmo `saveAs`), sem `getDocs`.
- `confirmImportBackup`: em demo, `getDemoStore().importBackup(backupToImport)`, mensagem com as contagens e `refreshDemoData()`.

- [ ] **Step 2: Esconder diagnóstico e desabilitar integrações**

- Envolver o bloco `{/* Ferramentas de Diagnóstico de Acesso */}` (~l.3643) em `{!IS_DEMO && ( ... )}`.
- Nos campos de webhook e chave Gemini: `disabled={IS_DEMO}`, o botão `Salvar Configurações` também com `disabled={IS_DEMO}` e, no topo da seção, em demo:

```tsx
<p className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
  Integrações desabilitadas na demonstração. Instale o Viabiliza para configurar.
</p>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `grep -n "if (IS_DEMO)" src/App.tsx | wc -l`
Expected: pelo menos 15 ramos.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: administracao e configuracoes da demonstracao no navegador"
```

---

### Task 10: Bloquear IA e notificações; marcar DOCX e impressão

**Files:**
- Modify: `src/App.tsx` (`handleAiAssist` ~l.1957; `handleGlobalGenerate` ~l.2024; objeto `notify` ~l.1277; efeito da chave local ~l.768; `handleExportDoc` ~l.2069; `handlePrint` ~l.2393)

**Interfaces:**
- Consumes: `IS_DEMO`, `DEMO_AI_MESSAGE`, `DEMO_DOC_HEADER` (Task 1).

- [ ] **Step 1: IA**

Adicionar `DEMO_AI_MESSAGE` e `DEMO_DOC_HEADER` ao import de `./demo/config` (o mesmo arquivo já importa `IS_DEMO`, `DEMO_USER` e `DEMO_NOTICE` desde a Tarefa 7). No topo de `handleAiAssist` e de `handleGlobalGenerate`:

```ts
if (IS_DEMO) { setApiError(DEMO_AI_MESSAGE); return; }
```

No efeito que lê `gemini_api_key` do `localStorage`, adicionar `if (IS_DEMO) return;`.

- [ ] **Step 2: Notificações**

No objeto `notify`, cada método começa com `if (IS_DEMO) return;` (nenhum `getDoc`, nenhum webhook).

- [ ] **Step 3: DOCX**

Em `handleExportDoc`, antes do primeiro `new Paragraph` do título, inserir:

```ts
...(IS_DEMO ? [new Paragraph({
  children: [new TextRun({ text: DEMO_DOC_HEADER, bold: true, color: "B00020" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
})] : []),
```

- [ ] **Step 4: Impressão**

Em `handlePrint`, dentro do HTML, logo após `<div class="doc-container">`:

```html
<div style="border:2px solid #b00020;color:#b00020;padding:8px;text-align:center;font-weight:bold;margin-bottom:20px;text-transform:uppercase;font-size:10pt;">${DEMO_DOC_HEADER}</div>
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `VITE_DEMO_MODE=true BASE_PATH=/Viabiliza-Open-Source/ npx vite build`
Expected: build concluído.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: bloquear IA e marcar documentos da demonstracao"
```

---

### Task 11: Publicação e aceite

**Files:**
- Modify: `.github/workflows/deploy.yml` (passo `Build`)
- Modify: `README.md` (nota curta sobre a demonstração)

**Interfaces:**
- Consumes: tudo acima.

- [ ] **Step 1: Ligar a flag no build do Pages**

No passo `Build`, adicionar em `env:`:

```yaml
          VITE_DEMO_MODE: "true"
```

- [ ] **Step 2: Nota no README**

Na seção de instalação, adicionar um parágrafo: a versão publicada em `https://diegofmartins.github.io/Viabiliza-Open-Source/` é uma **demonstração com dados fictícios**, salva apenas no navegador, sem IA; para uso real, instale conforme este guia.

- [ ] **Step 3: Verificar localmente**

Run: `npm test`
Expected: todos os testes passando.

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run build`
Expected: build concluído.

Run: `VITE_DEMO_MODE=true BASE_PATH=/Viabiliza-Open-Source/ npx vite build`
Expected: build concluído.

- [ ] **Step 4: Publicar**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "chore: publicar demonstracao no GitHub Pages"
git push -u origin feat/demo-pages
gh pr create --base main --head feat/demo-pages --title "feat: demonstracao publica no GitHub Pages" --body "Implementa o desenho docs/superpowers/specs/2026-11-12-demo-pages-design.md"
```

Após o merge, acompanhar o workflow `Deploy to GitHub Pages` até concluir.

- [ ] **Step 5: Conferir os 12 critérios no site publicado**

Abrir `https://diegofmartins.github.io/Viabiliza-Open-Source/` com cache limpo e marcar:

1. Tela de entrada só com `Entrar na demonstração` (sem Google).
2. Entrar leva ao dashboard com 2 ETPs fictícios.
3. Editar um ETP, salvar, recarregar → alteração permanece.
4. Criar, excluir e restaurar ETP funcionam.
5. Administração: aprovar, mudar papel e excluir usuário funcionam.
6. Exportar DOCX e imprimir funcionam.
7. Botão de IA mostra o aviso; aba Rede **não** mostra chamadas a `firebaseio`, `googleapis.com/identitytoolkit` ou `generativelanguage`.
8. `Restaurar dados de exemplo` volta aos 2 ETPs e 3 usuários.
9. Build local sem a flag (`npm run build` seguido de `npx vite preview`) mantém a tela `Entrar com Google` e o bundle contém `addDoc`/Firestore.
10. O arquivo DOCX baixado e a janela de impressão exibem `Documento de demonstração — dados fictícios`.
11. Chaves antigas: gravar `agency_name`/`gemini_api_key` no navegador antes de abrir; a demo mostra `Órgão Público Exemplo` e não exibe a chave.
12. `npm test`, `npx tsc --noEmit` e `npm run build` verdes.

- [ ] **Step 6: Commit final (se houver ajuste da verificação)**

```bash
git add -A
git commit -m "fix: ajustes finais da demonstracao"
```

---

## Notas de implementação

- A faixa da demonstração fica no topo do conteúdo e rola com a página (os cabeçalhos continuam fixos); isso evita conflito de `z-index` com os quatro cabeçalhos existentes.
- `reset()` mantém a sessão para o visitante não ser deslogado ao restaurar os dados.
- O store nunca lê `agency_name`, `agency_logo` ou `gemini_api_key` — o isolamento é por prefixo `demo_`.
- Se o Firestore for acessado por engano em demo, os ramos `if (IS_DEMO)` impedem a chamada; a conferência final da aba Rede é a prova.
