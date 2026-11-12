# Viabiliza 🏛️🤖

[![Licença MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Lei 14.133/2021](https://img.shields.io/badge/Lei-14.133%2F2021-green)](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2023/lei/l14133.htm)

O **Viabiliza** é uma plataforma de inteligência artificial de código aberto (Open Source) desenvolvida para transformar a elaboração de **Estudos Técnicos Preliminares (ETP)** em órgãos públicos, em conformidade estrita com a **Nova Lei de Licitações e Contratos (Lei Federal nº 14.133/2021)**.

---

## 🚀 Principais Funcionalidades

- **Diagnóstico Inicial Inteligente**: O servidor responde a perguntas fundamentais sobre a demanda (problema, alternativas, objeto, requisitos, quantidades, riscos, impactos).
- **Assistência por Inteligência Artificial (Google Gemini)**:
  - Sugestões campo a campo com foco no problema e não na solução.
  - Assistente de Geração Global para preenchimento completo do ETP.
- **Editor Rico e Tabelas Avançadas**: Suporte a formatação rica, tabelas de estimativa de preços e matriz de riscos com marcação de probabilidade e impacto.
- **Exportação Profissional**:
  - Exportação direta para arquivos do Word (`.docx`) formatados conforme os padrões da administração pública.
  - Versão otimizada para impressão e PDF.
- **Gestão de Acessos e Governança**:
  - Autenticação Google corporativa (ou modo demonstração).
  - Painel de Administração para aprovação de servidores, gerenciamento de perfis (Servidor vs. Master) e auditoria de documentos.
  - Notificações automatizadas (ex: integração com Google Chat Webhook).

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, Tiptap Editor.
- **Backend**: Node.js, Express (arquitetura full-stack integrada).
- **IA**: SDK `@google/genai` (Google Gemini 2.5/2.0 Flash) com rotas proxy seguras no servidor.
- **Banco de Dados & Autenticação**: Firebase Firestore & Firebase Auth.
- **Exportação de Documentos**: `docx` e `file-saver`.

---

## 📋 Guia de Instalação para Órgãos Públicos

Para implantar o Viabiliza em sua própria instituição (Prefeitura, Câmara Municipal, Tribunal, Ministério ou Autarquia), siga os passos abaixo:

### 1. Pré-requisitos
- Node.js (versão 18 ou superior) instalado.
- Uma conta no [Firebase](https://firebase.google.com/) para gerenciar autenticação e banco de dados Firestore.
- Uma chave de API do [Google Gemini (Google AI Studio)](https://aistudio.google.com/).

### 2. Clonar o Repositório
```bash
git clone https://github.com/seu-orgao/viabiliza.git
cd viabiliza
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
VITE_GOOGLE_CHAT_WEBHOOK_URL=sua_url_webhook_opcional
```

### 5. Configurar o Firebase
1. Crie um projeto no console do Firebase.
2. Habilite a **Authentication** (Provedor Google).
3. Habilite o **Cloud Firestore**.
4. Copie suas credenciais para o arquivo `firebase-applet-config.json` na raiz do projeto.
5. Aplique as regras de segurança do Firestore (`firestore.rules`).

### 6. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará rodando em `http://localhost:3000`.

---

## 🐳 Execução via Docker (Auto-Hospedagem)

Para hospedar o Viabiliza em servidores próprios do órgão via Docker:

```bash
docker build -t viabiliza .
docker run -p 3000:3000 -e GEMINI_API_KEY=sua_chave_aqui viabiliza
```

---

## 🏛️ Personalização Institucional para Outros Órgãos

O Viabiliza foi construído com arquitetura modular. Para adaptá-lo para sua instituição:
1. **Nome e Logotipo**: Altere o título em `index.html`, `metadata.json` e o nome da instituição nas configurações do painel ou nos prompts do sistema.
2. **Domínios de E-mail Permitidos**: No painel de administração ou regras do Firebase Auth, você pode restringir o acesso apenas aos servidores com o domínio de e-mail institucional do seu órgão (ex: `@suacidade.pr.gov.br`).

---

## 📄 Licença

Distribuído sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
*Desenvolvido para fortalecer a transparência, a eficiência e a modernização nas contratações públicas.*
