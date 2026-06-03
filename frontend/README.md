# AdotaPet - Frontend

![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)

Frontend oficial do **AdotaPet** - app web para adoção responsável de animais.
Projeto acadêmico da disciplina **S204 / INATEL**, parte do monorepo `adotapet-monorepo`.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** com tipagem estrita
- **Tailwind CSS 4** para estilização
- **React Hook Form + Zod** para formulários
- **Jest + Testing Library** para testes unitários
- **Cypress** para testes e2e

> Atenção: este projeto usa Next.js 16, onde **`middleware.ts` foi renomeado para `proxy.ts`**. Veja `src/proxy.ts` - é onde mora a proteção de rotas privadas. Não recrie um `middleware.ts`.

## Como rodar localmente

Pré-requisitos: Node 20+ e o backend rodando em `http://localhost:3000`.

```bash
cd frontend
npm install
npm run dev
```

- Dev server: `http://localhost:3000` (ou `3001` se o backend já ocupou o 3000).
- O Next.js reescreve `/api-backend/*` para `http://localhost:3000/*` (ver `next.config.ts`).

## Variáveis de ambiente

| Variável | Onde é usada | Valor padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Lida no browser pelo client da API quando o frontend roda em produção/Docker. | `http://localhost:3000` |

Em dev local não é necessário criar `.env.local` - o rewrite de `/api-backend` em `next.config.ts` cuida do roteamento para o backend.

## Estrutura

```
src/
  app/            # rotas (App Router)
    page.tsx        - home (lista de pets)
    login/          - login
    registro/       - cadastro
    dashboard/      - area autenticada
    perfil/         - perfil do usuario
    minhas-adocoes/ - solicitacoes do adotante
    pet/[id]/       - detalhe de pet
    contato/, faq/, denunciar/, resgate/
  components/     # UI, layout, home, pets
  contexts/       # AuthContext (login/logout, user, token)
  hooks/          # usePets, useFilters
  services/api.ts # cliente HTTP (fetch + Bearer JWT)
  proxy.ts        # protecao de rotas privadas (Next 16)
  types/          # tipos compartilhados
```

## Integração com o backend

- O token JWT é salvo em `localStorage` (`adotapet_token`) e em cookie homônimo (para o `proxy.ts` poder ver no servidor).
- Todas as requisições passam por `services/api.ts`, que injeta `Authorization: Bearer <token>` automaticamente.
- Para testar regras do backend via Swagger antes de integrar uma tela, veja [GUIA_SWAGGER_FRONTEND.md](../backend/GUIA_SWAGGER_FRONTEND.md).

## Scripts

```bash
npm run dev           # dev server (webpack)
npm run build         # build de producao
npm run start         # serve o build
npm run lint          # ESLint
npm run test          # Jest (unitarios)
npm run test:watch    # Jest watch
npm run cypress:open  # Cypress UI
```

## Testes

- Unitários: `__tests__/` + co-localizados.
- E2E: `cypress/e2e/` (config: `cypress.config.ts`). Atenção: hoje o `baseUrl` de Cypress aponta para `http://localhost:3001`; se rodar `next dev` na 3000, ajuste a env `CYPRESS_BASE_URL`.

## Licença

Projeto acadêmico para fins educacionais.
