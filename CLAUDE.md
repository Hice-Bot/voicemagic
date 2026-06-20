# VoiceMagic

A text-to-speech SaaS application at [voicemagic.dev](https://voicemagic.dev).

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **DB ORM**: Prisma 7 (PostgreSQL via Neon)
- **API layer**: tRPC 11 + TanStack Query
- **Auth**: Clerk (Next.js SDK v6)
- **Billing**: Clerk Billing
- **Storage**: AWS S3-compatible (Cloudflare R2)
- **TTS engine**: Chatterbox (`chatterbox_tts.py` sidecar, called via `src/lib/chatterbox-client.ts`)
- **Error tracking**: Sentry

## Project Layout

```
/home/voicemagic/app/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Authenticated app shell
│   │   │   ├── text-to-speech/
│   │   │   ├── voices/
│   │   │   ├── voice-cloning/
│   │   │   ├── account/
│   │   │   └── settings/
│   │   ├── admin/            # Admin panel
│   │   ├── api/              # Route handlers
│   │   │   ├── audio/        # Audio streaming
│   │   │   ├── mcp/          # MCP server endpoint
│   │   │   ├── support-chat/ # Support bot
│   │   │   ├── trpc/         # tRPC HTTP handler
│   │   │   ├── v1/           # Public REST API
│   │   │   └── voices/       # Voice asset routes
│   │   ├── docs/             # API docs
│   │   ├── landing.css / page.tsx  # Marketing page
│   │   └── sign-in / sign-up / org-selection
│   ├── features/             # Domain feature modules
│   │   ├── text-to-speech/
│   │   ├── voices/
│   │   ├── billing/
│   │   ├── admin/
│   │   ├── settings/
│   │   ├── account/
│   │   └── dashboard/
│   ├── trpc/
│   │   ├── routers/          # _app.ts, voices.ts, generations.ts, billing.ts, admin.ts, api-keys.ts
│   │   └── client.tsx / server.tsx / init.ts
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── env.ts            # t3-env validated env vars
│   │   ├── chatterbox-client.ts  # TTS sidecar client
│   │   ├── r2.ts             # R2 storage
│   │   ├── api-keys.ts       # API key hashing/validation
│   │   └── api-auth.ts       # API route auth helpers
│   ├── components/           # Shared UI components (shadcn/ui based)
│   ├── hooks/                # Shared React hooks
│   └── types/
├── prisma/
│   └── schema.prisma         # Models: Voice, VoiceFavorite, Generation, ApiKey, SupportConfig, PlanConfig
├── scripts/                  # One-off seed/migration scripts
├── chatterbox_tts.py         # TTS Python sidecar
├── Dockerfile
└── docker-compose.yml
```

## Key Models

| Model | Purpose |
|---|---|
| `Voice` | System or custom voice definitions, stored audio in R2 |
| `Generation` | TTS generation records with params and R2 audio ref |
| `ApiKey` | Hashed API keys scoped to orgs |
| `VoiceFavorite` | Per-user voice bookmarks |
| `SupportConfig` | Configurable support chat widget |
| `PlanConfig` | Pricing plan definitions |

## Deployment

The app runs in Docker on KVM4 (76.13.106.218) as user `voicemagic`, exposed on port 3100.

**Deploy commands** (run from `/home/voicemagic/app` on KVM4):

```bash
sudo /usr/local/bin/voicemagicctl deploy    # rebuild + restart
sudo /usr/local/bin/voicemagicctl restart   # restart without rebuild
sudo /usr/local/bin/voicemagicctl status    # container status
sudo /usr/local/bin/voicemagicctl logs      # recent logs
```

Do NOT use raw `docker compose` commands — use `voicemagicctl`.

**From KVM1** (edit here, deploy there):

```bash
rsync -az --exclude='node_modules' --exclude='.next' --exclude='.data' \
  /path/to/local/src/ root@76.13.106.218:/home/voicemagic/app/src/

ssh root@76.13.106.218 'cd /home/voicemagic/app && sudo /usr/local/bin/voicemagicctl deploy'
```

## Environment

- `.env` at `/home/voicemagic/app/.env` is the runtime source of truth
- Container has no bind mounts — source is baked into the image at build time
- After changing `.env` or any code, run `deploy` (not `restart`)

## Health Check

```bash
curl -I --max-time 10 http://127.0.0.1:3100
```

## Important Notes

- `voicemagic` user is intentionally restricted — do not add to `docker` group
- Do not move `/home/voicemagic/app` without updating `/usr/local/bin/voicemagicctl`
- The old `/home/mcuser/voicemagic` path no longer exists
- MCP server is exposed at `/api/mcp` for agent integrations
