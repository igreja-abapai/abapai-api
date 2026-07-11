# Página Ao Vivo (YouTube)

Documentação da integração de transmissões ao vivo do site público com o YouTube Data API v3.

## Visão geral

A página `/ao-vivo` exibe:

- o player embutido quando há live ativa no canal configurado;
- um placeholder quando não há transmissão no momento;
- a lista de próximas lives agendadas diretamente no YouTube.

Não há cadastro de transmissões no admin. O YouTube é a fonte da verdade.

## Arquitetura

```text
YouTube Data API v3
        ↓
GET /live/current (sync on read quando cache expira)
        ↓
Postgres (tabela youtube_live_cache)
        ↓
Site Angular /ao-vivo (poll na API a cada 60s)
```

Não há cron agendado para YouTube. A sincronização acontece quando alguém acessa `/ao-vivo` (ou quando o cache expira durante o polling na página). Sem visitantes, não há chamadas à API do YouTube.

## Variáveis de ambiente (API)

```env
YOUTUBE_API_KEY=...
YOUTUBE_LIVE_CHANNEL_ID=UCxxxxxxxx
CRON_SECRET=...
```

- `YOUTUBE_API_KEY`: chave do Google Cloud com YouTube Data API v3 habilitada.
- `YOUTUBE_LIVE_CHANNEL_ID`: ID do canal (formato `UC...`).
- `CRON_SECRET`: protege os endpoints em `/internal/cron/*`.

Configure as mesmas variáveis na Vercel (produção).

## Banco de dados

Tabela `youtube_live_cache` (uma linha por canal):

| Campo | Descrição |
|-------|-----------|
| `channelId` | ID do canal YouTube |
| `isLive` | Se há transmissão ativa |
| `liveVideo` | JSON com vídeo ao vivo (id, título, embedUrl, thumbnail) |
| `upcoming` | JSON com próximas lives agendadas |
| `nextScheduledAt` | Horário da próxima live |
| `syncMode` | `idle`, `watching` ou `live` |
| `syncedAt` | Última sincronização com o YouTube |

Migration: `1783725989015-create-youtube-live-cache.ts`

## Endpoints

### Público

`GET /live/current`

Resposta:

```json
{
  "isLive": false,
  "liveVideo": null,
  "upcoming": [
    {
      "videoId": "abc123",
      "title": "Culto do Poder de Deus",
      "embedUrl": "https://www.youtube.com/embed/abc123?autoplay=1&rel=0&fs=1&modestbranding=1",
      "thumbnailUrl": "https://...",
      "scheduledStartTime": "2026-07-13T19:00:00.000Z",
      "actualStartTime": null
    }
  ],
  "nextScheduledAt": "2026-07-13T19:00:00.000Z",
  "syncedAt": "2026-07-10T23:10:00.000Z"
}
```

Headers: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

### Sync manual (interno, opcional)

`GET /internal/cron/youtube-live-sync`

Requer header `Authorization: Bearer {CRON_SECRET}`. Útil para forçar sync manualmente; **não está agendado** no `vercel.json`.

## Estratégia de sincronização (economia de cota)

O YouTube é consultado apenas quando `GET /live/current` detecta cache expirado:

| Modo | Quando | Cache expira após | Chamada ao YouTube |
|------|--------|-------------------|--------------------|
| `idle` | Longe da próxima live | 6 h | Discovery (`search` live + upcoming) |
| `watching` | 30 min antes até 2 h depois da live | 5 min | Discovery |
| `live` | Transmissão ativa | 60 s | `videos.list` no vídeo conhecido (1 unidade) |

Durante live, usa `videos.list` (1 unidade) em vez de `search` (100 unidades) quando possível. O limite de 100 chamadas/dia do `search.list` só se aplica aos syncs de discovery, não ao polling durante live.

## Módulo da API

```
src/modules/youtube-live/
├── entities/youtube-live-cache.entity.ts
├── enums/youtube-live-sync-mode.enum.ts
├── interfaces/youtube-live.interfaces.ts
├── youtube-api.client.ts
├── youtube-live.service.ts
├── youtube-live.controller.ts
├── youtube-live-cron.controller.ts
└── youtube-live.module.ts
```

## Site (Angular)

| Arquivo | Função |
|---------|--------|
| `src/app/pages/live/live-page.component.*` | Página `/ao-vivo` |
| `src/app/services/live.service.ts` | Consome `GET /live/current` |
| `src/app/resolvers/live.resolver.ts` | SSR com TransferState |
| `src/app/app.routes.ts` | Rota `/ao-vivo` |
| `src/app/components/navbar/navbar.component.html` | Link **Ao vivo** |

## Deploy

1. Rodar migration: `npm run migration:run`
2. Configurar env vars na Vercel
3. Fazer deploy da API e do site
4. Agendar lives no YouTube (eventos de transmissão ao vivo)

## Teste local

Ative o polling temporário no `.env` da API (apenas para dev local):

```env
YOUTUBE_LIVE_DEV_POLLING=true
YOUTUBE_LIVE_DEV_POLLING_INTERVAL_MS=120000
```

Com `npm run dev`, a API sincroniza com o YouTube na inicialização e a cada 2 minutos (padrão). **Desative antes do deploy** (`false` ou remova a variável).

Alternativa manual (sem polling):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:4333/internal/cron/youtube-live-sync

curl http://localhost:4333/live/current
```

## Observações

- Lives precisam ser **agendadas no YouTube** para aparecer em "Próximas transmissões".
- Lives iniciadas sem agendamento prévio ainda são detectadas via `eventType=live`.
- Ao encerrar a live no YouTube, o site pode levar até ~1–2 min para atualizar (cache + polling). A detecção usa `liveBroadcastContent` da API do YouTube, não apenas a busca por `eventType=live`.
- A API key nunca deve ir para o frontend.
