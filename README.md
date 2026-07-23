# Competitor Radar

Plataforma de inteligencia competitiva para Instagram e YouTube. Monitora os
perfis dos seus concorrentes, coleta os posts/videos mais recentes e gera
insights estrategicos automaticamente com IA, comparando o que eles estao
fazendo com o seu proprio negocio.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **node:sqlite** (driver nativo do Node.js 22+) como banco de dados local -
  escolhido no lugar do Prisma porque o binario nativo do Prisma
  (`binaries.prisma.sh`) estava bloqueado pelo firewall/allowlist do ambiente
  de build. Sem ORM, sem dependencia externa de banco: um unico arquivo
  `.sqlite` no disco.
- **Server Actions** para todas as mutacoes (adicionar concorrente, gerar
  insights do dia, aprovar/reprovar insight).
- **Adapters com fallback automático** para coleta de dados: se a chave de
  API nao estiver configurada, o sistema usa dados mock realistas (mesmo
  formato de um post/video real), permitindo usar o produto imediatamente e
  trocar para dados reais no futuro sem mudar nenhuma tela.

## Como rodar localmente

```bash
npm install
npm run seed   # cria as tabelas e popula 2 concorrentes de exemplo
npm run dev    # http://localhost:3000
```

Para build de producao:

```bash
npm run build
npm run start
```

## Configuracao (opcional)

Copie `.env.example` para `.env` e preencha conforme disponibilidade:

| Variavel | Para que serve | Sem ela |
|---|---|---|
| `MY_BUSINESS_NAME` | Nome do seu negocio, usado no prompt de IA | Usa o nome do workspace |
| `MY_BUSINESS_CONTEXT` | Contexto do seu negocio (o que voce vende, publico, etc) | Texto generico |
| `APIFY_TOKEN` | Coleta real do Instagram via Apify (`apify/instagram-scraper`) | Usa posts mock |
| `YOUTUBE_API_KEY` | Coleta real do YouTube via YouTube Data API v3 | Usa videos mock |
| `GEMINI_API_KEY` | Geração de insights com Gemini 2.5 Flash | Usa motor de regras local (sem custo, sem IA externa) |

Nenhuma chave é obrigatória: o produto funciona 100% com dados mock desde o
primeiro `npm install`.

## Arquitetura

```
src/
  app/
    page.tsx                 Dashboard (stats + botao "gerar insights de hoje")
    competidores/page.tsx     Cadastro e lista de concorrentes
    insights/page.tsx         Lista de todos os insights gerados
    insights/[id]/page.tsx    Detalhe do insight (aprovar/reprovar)
    actions/index.ts          Server actions (mutacoes)
  lib/
    db.ts                     Setup do node:sqlite + criacao de tabelas
    repo.ts                   Camada de acesso a dados (SQL puro)
    workspace.ts              Helper do workspace padrao
    adapters/
      instagram.ts            Apify (real) ou mock
      youtube.ts               YouTube Data API (real) ou mock
    ai/
      generateInsight.ts       Gemini (real) ou motor de regras local
scripts/
  seed.mjs                    Popula dados de exemplo
```

## Roadmap - Fase 2 (multi-tenant / white-label)

A base atual foi desenhada para um unico workspace (uso interno). Para vender
como SaaS white-label para clientes, o proximo passo e:

1. Adicionar autenticacao (NextAuth ou Clerk) e um `workspace_id` por cliente
   em todas as queries (o schema ja tem a coluna, so falta o isolamento por
   sessao).
2. Tela de configuracao de marca por workspace (logo, cor, nome exibido).
3. Plano de cobranca (Stripe) por numero de concorrentes monitorados.
4. Fila de jobs (ex: cron diario) para rodar a coleta automaticamente em vez
   de botao manual.

## Custo estimado

- **Hospedagem (Vercel, plano gratuito):** R$ 0/mes para este volume de uso.
- **Apify (Instagram):** a partir de ~US$ 49/mes no plano pago, ou uso do
  free tier limitado.
- **YouTube Data API:** gratuito ate a cota diária padrao (10.000 unidades/dia).
- **Gemini 2.5 Flash:** cobranca por token, tipicamente poucos centavos de
  dolar por insight gerado.
- **Motor de regras local (sem IA externa):** custo zero, insights mais
  simples porem funcionais.
