# Frontend — Maarif Analytics

React dashboard interface for Maarif Analytics.

Built on top of [shadcn-admin](https://github.com/satnaing/shadcn-admin), adapted to the visual identity and business workflows of Maarif Culture.

## Prerequisites

- Node.js 20+
- pnpm

## Getting Started

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Vite starts on **http://127.0.0.1:5174** and proxies `/api` to `http://127.0.0.1:8080`.

To point to a different API:

```bash
MAARIF_API_TARGET='http://127.0.0.1:9090' pnpm dev
```

## Checks

```bash
pnpm format:check   # formatting
pnpm lint           # linting
pnpm typecheck      # TypeScript type check
pnpm test           # unit tests
pnpm build          # production build
```

## Stack

| Tool            | Purpose                   |
| --------------- | ------------------------- |
| React 19        | UI                        |
| TypeScript      | Type safety               |
| Vite            | Build tool and dev server |
| TanStack Router | Routing                   |
| TanStack Query  | Data fetching             |
| Tailwind CSS    | Styling                   |
| shadcn/ui       | Components                |
| Vitest          | Unit tests                |
| Playwright      | Browser tests             |

## Notes

- Les composants OTP et onglets du modèle ne sont pas utilisés et ont été retirés pour permettre une compilation avec les seules dépendances déclarées.
- Amounts are displayed in MAD.
- Business dates use the `Africa/Casablanca` timezone.
- Authentication relies on the backend's JWT cookie and CSRF protection.

Based on [shadcn-admin](https://github.com/satnaing/shadcn-admin) — MIT license.
