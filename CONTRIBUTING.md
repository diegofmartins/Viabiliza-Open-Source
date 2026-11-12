# Contribuindo para o Viabiliza OS

O **Viabiliza OS** é uma plataforma de inteligência artificial voltada para a modernização das contratações públicas e elaboração de Estudos Técnicos Preliminares (ETP) e DFDs com base na **Lei Federal nº 14.133/2021**. Contribuições de servidores públicos, desenvolvedores, especialistas em licitações e entusiastos de *Civic Tech* são extremamente bem-vindas!

---

## Como Contribuir

1. **Abra uma Issue**: Antes de iniciar grandes mudanças, abra uma issue descrevendo o bug que deseja corrigir ou a melhoria/nova funcionalidade que deseja propor.
2. **Faça um Fork do Repositório**: Crie uma cópia do projeto em sua conta GitHub.
3. **Crie uma Branch para sua Feature**:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
4. **Implemente e Teste**:
   - Certifique-se de que o código compila sem erros (`npm run build` ou `npm run lint`).
   - Siga os padrões de código TypeScript e Tailwind CSS.
5. **Envie um Pull Request (PR)**: Descreva claramente no PR o objetivo da alteração e quais testes foram realizados.

---

## Padrões de Código

- **Linguagem**: TypeScript em todo o frontend e backend.
- **Estilização**: Tailwind CSS v4.
- **IA**: Integração com a API do Google Gemini via `@google/genai` (backend seguro em `server.ts`).
- **Banco de Dados**: Firebase Firestore com regras de segurança rigorosas.

Agradecemos por fortalecer a inovação no setor público brasileiro!
