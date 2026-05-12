# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js, localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No linting or test scripts are configured.

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

This is a **Next.js 14 App Router** project with a **single-page React app** pattern. All UI and logic lives in `app/page.js` — there are no separate component files or routes.

### Database (Supabase)

Three tables:
- **`clientes`** — `id, doc (CPF/CNPJ), nome, senha, ativo` — authentication is done by querying this table directly (no Supabase Auth)
- **`jogos`** — `id, time1, time2, grupo, data_hora, resultado_g1, resultado_g2, encerrado`
- **`palpites`** — `id, cliente_id, jogo_id, g1, g2`

### Authentication & Roles

Login matches `doc` + `senha` against the `clientes` table. The special account with `doc === "admin"` gets admin access. No JWT/session — user object is kept in React state only.

### Screen Flow

State variable `tela` controls which screen is rendered:
- `login` → `boasvindas` (onboarding carousel, first login only) → `jogos` (user bets view)
- Admin: `login` → `admin` (home) / `clientes` / `resultados` / `ranking`

### Scoring Logic

`calcPontos(g1, g2, rg1, rg2)` in `page.js:47`: 3 pts for exact score, 1 pt for correct winner/draw, 0 otherwise.

### Assets

Static images (logos, banner stripes) are served from Supabase Storage at the `SUPA` constant URL (`gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets`). Country flags come from `flagsapi.com`.
