# Demonstração pública no GitHub Pages — desenho

**Data:** 2026-11-12
**Status:** aguardando aprovação
**Responsável:** Diego Martins (CMC) · implementação assistida

## 1. Intenção

Permitir que um órgão público conheça o Viabiliza **sem instalar nada**, por meio de uma demonstração segura no GitHub Pages, com login fictício e dados de exemplo. A instalação na infraestrutura do órgão continua sendo o caminho principal (documentação).

## 2. Objetivos

- Entrar com **um clique**, sem cadastro e sem conta Google.
- Explorar as telas reais do produto: dashboard, editor de ETP, administração.
- Editar, salvar, recarregar, exportar DOCX e imprimir.
- Deixar explícito, em todo momento, que é **demonstração com dados fictícios**.
- **Zero gravação em servidor**, zero custo de IA, zero dado de visitante coletado.
- Usar o **mesmo código** da versão instalável, sem duplicar o projeto.

## 3. Não objetivos

- Substituir a instalação real ou servir de sistema em produção.
- Demonstrar a IA ao vivo (a IA será mostrada em vídeo/documentação).
- Autenticação real ou multiusuário no Pages.
- Sincronizar dados entre navegadores ou dispositivos.

## 4. Anti-objetivos (falhas do desenho)

- Qualquer escrita no Firestore durante a demonstração.
- Exibir login Google na versão de demonstração.
- Coletar e-mail, nome ou qualquer dado do visitante.
- Uma demo que pareça um sistema oficial em produção.
- Botões que "quebram" sem explicação.

## 5. Restrições

- GitHub Pages é **estático**: não executa backend nem IA.
- Um único código para demo e instalação → ativação por **flag de build** `VITE_DEMO_MODE=true`, definida **somente** no workflow do Pages.
- Sem novas dependências.
- Precisa continuar funcionando no build de instalação (login Google + Firestore + IA).

## 6. Abordagem escolhida

**A) Modo demonstração no mesmo app, ativado por flag de build.**

Alternativas descartadas:

- **B) Projeto separado só para a demo:** duplicaria manutenção e a demo envelheceria diferente do produto.
- **C) Projeto Firebase de demonstração com conta compartilhada:** custo de IA, dados de terceiros no banco e risco de abuso/LGPD.

## 7. Como funciona

### 7.1 Ativação

- `.github/workflows/deploy.yml`: `VITE_DEMO_MODE: "true"` no passo de build do Pages.
- Novo `src/demo/config.ts`:
  - `IS_DEMO = import.meta.env.VITE_DEMO_MODE === "true"`
  - `DEMO_UID = "demo-user-12345"`
  - chaves de armazenamento local (`demo_session`, `demo_etps`, `demo_users`, `demo_agency`, `demo_config`).
- `src/firebase.ts`: não executar o teste de conexão quando `IS_DEMO`.
- **Inicialização do Firebase em demo:** `initializeApp`/`getFirestore` continuam (não fazem chamada de rede), mas a autenticação usa persistência em memória (`initializeAuth` + `inMemoryPersistence`) para **não restaurar** uma sessão Google antiga do mesmo domínio. Resultado: nenhuma chamada a Firebase/Auth em demo.

### 7.2 Tela de entrada

- **Demo:** um único botão **"Entrar na demonstração"**, com o aviso "Dados fictícios. Nada é enviado a servidores." O botão de login Google **não aparece**.
- **Instalação:** tela atual, sem alteração (login Google).

### 7.3 Sessão

- Ao entrar na demo, gravar `demo_session=1` para permanecer logado ao recarregar.
- "Sair" limpa a sessão e volta à tela de entrada.
- A demo **ignora** qualquer sessão Firebase existente no navegador (não assina `onAuthStateChanged`).

### 7.4 Dados fictícios

- Novo `src/demo/demoStore.ts`: leitura e gravação **apenas em localStorage**.
- Novo `src/demo/seed.ts` com o conteúdo inicial:
  - **2 ETPs fictícios:**
    1. "Aquisição de notebooks para modernização do atendimento" — em andamento, diagnóstico e seções principais preenchidas.
    2. "Contratação de manutenção predial preventiva" — concluído, com objeto, justificativa, riscos e estimativa de exemplo.
  - **3 usuários fictícios:** master da demo, um aprovado e um pendente.
  - **Configuração institucional fictícia:** "Órgão Público Exemplo" (sem logo real).
- Semeadura na primeira entrada; nunca sobrescreve dados já alterados pelo visitante.
- **Isolamento das chaves antigas:** em demo, o app lê **somente** chaves `demo_*`. Chaves deixadas pela versão real no mesmo navegador (`agency_name`, `agency_logo`, `gemini_api_key`) são **ignoradas** — nunca exibidas nem usadas.
- Botão **"Restaurar dados de exemplo"** no menu do usuário: limpa as chaves `demo_*` e recarrega (não apaga chaves de outras versões).
- Extrair `INITIAL_STATE` de `src/App.tsx` para `src/constants/etpInitialState.ts`, para reutilizar no seed sem duplicar campos.

### 7.5 O que funciona e o que é bloqueado

| Área | Na demonstração |
|---|---|
| Entrar / sair | Funciona (login fictício) |
| Dashboard e listagem | Funciona (dados fictícios) |
| Criar, editar, salvar, excluir e restaurar ETP | Funciona (localStorage) |
| Administração: aprovar, mudar papel, excluir usuário | Funciona (localStorage) |
| Configuração institucional (nome/logo) | Funciona (localStorage) |
| Configurações: integrações (webhook / chave Gemini) | **Exibidas desabilitadas com aviso**; nenhuma chave é aceita ou usada |
| Ferramentas de depuração/manutenção | **Ocultas** na demonstração |
| Aceite de termos | Automático |
| Exportar DOCX / imprimir | Funciona |
| Backup e importação (JSON) | Funciona (arquivo local) |
| Geração por IA | **Bloqueada com aviso amigável** |
| Notificações / webhook | **Desligadas** (sem chamada) |
| Qualquer leitura/escrita no Firebase | **Não ocorre** |

### 7.6 IA

- Os botões de IA abrem um aviso: "A geração por IA não está disponível na demonstração. Instale o Viabiliza para usar." com link para a documentação de instalação.
- Nenhuma chamada de rede é feita.

### 7.7 Notificações

- O build do Pages não define `VITE_GOOGLE_CHAT_WEBHOOK_URL` (comportamento atual: sem URL, a função não envia nada).
- Em demo, as funções de notificação não são chamadas.

### 7.8 Identidade da demonstração

- Faixa fixa no topo: **"DEMONSTRAÇÃO — dados fictícios"**.
- A faixa não aparece na versão instalada.

### 7.9 Documentos exportados

- O DOCX exportado e a versão para impressão levam o cabeçalho **"Documento de demonstração — dados fictícios"**, para evitar que um ETP fictício seja usado como documento real. O restante da formatação é o formato verdadeiro do produto.

### 7.10 Ferramentas internas

- Ferramentas de depuração e manutenção do painel administrativo ficam **ocultas** na demonstração.

## 8. Arquivos afetados

- `.github/workflows/deploy.yml` — flag `VITE_DEMO_MODE`.
- `src/demo/config.ts` — **novo**.
- `src/demo/demoStore.ts` — **novo**.
- `src/demo/seed.ts` — **novo**.
- `src/constants/etpInitialState.ts` — **novo** (extraído de `App.tsx`).
- `src/App.tsx` — ramos de demonstração nas funções de leitura/escrita, tela de entrada, faixa e aviso de IA.
- `src/firebase.ts` — pular teste de conexão em demo.
- `src/services/aiService.ts` — sem chamada em demo (bloqueio no App; serviço permanece intacto).
- `README.md` / `MANUAL.md` — nota sobre a demonstração (pode entrar na fase de documentação).

## 9. Critérios de aceite

1. No Pages, a tela de entrada mostra **somente** o botão de demonstração.
2. Entrar leva ao dashboard com os 2 ETPs fictícios.
3. Editar e salvar → recarregar → a alteração permanece.
4. Criar, excluir e restaurar ETP funcionam localmente.
5. Administração: aprovar, mudar papel e excluir usuário fictício funcionam localmente.
6. Exportar DOCX e imprimir funcionam.
7. IA e notificações mostram aviso/bloqueio; a aba Rede não mostra chamadas a Firebase ou Gemini.
8. "Restaurar dados de exemplo" volta ao estado inicial.
9. Build de instalação (sem a flag) mantém login Google, Firestore e IA normais.
10. DOCX e impressão saem com o cabeçalho de demonstração.
11. Chaves antigas do navegador (`agency_name`, `gemini_api_key`) não aparecem na demo.
12. `npx tsc --noEmit` e `npm run build` verdes.

## 10. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Esquecer um ponto de escrita no Firestore | Auditoria de todas as 24 chamadas de escrita + varredura final + teste manual de cada tela |
| Visitante achar que é sistema oficial | Faixa, textos e aviso na entrada |
| localStorage cheio (imagens coladas) | Limite de 1 MB por ETP já existente; dados de exemplo pequenos |
| Exposição de configuração real | Nenhuma chamada de rede em demo |

## 11. Fora de escopo / próxima fase

- **Documentação** (FAQ, prints comentados, manual revisado, guia de implantação, aviso de privacidade) — desenho próprio.
- **Segurança de produção** (dependências vulneráveis, master via custom claims, testes/CI).

## 12. Decisões deixadas ao construtor

- Estrutura interna e nomes dos módulos de demo.
- Textos exatos dos avisos (desde que claros e em português).
- Conteúdo detalhado dos ETPs fictícios (desde que realista e sem dados reais).
