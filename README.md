# NexIDE

<div align="center">

[![CI](https://github.com/ayushhh-here/NexIDE/actions/workflows/ci.yml/badge.svg)](https://github.com/ayushhh-here/NexIDE/actions/workflows/ci.yml)

<br/>

> **A browser based AI-powered IDE - write, run, and deploy code**
> **with zero local setup.**

<br/>


</div>

---

## What is NexIDE?

NexIDE is a fully browser-based development environment : no installs, no Docker containers on your machine, no configuration required. You open a browser tab and start coding immediately.

It runs real Node.js applications directly inside the browser using the WebContainers API — the same technology that powers StackBlitz. The code editor is Monaco Editor, the exact same engine that runs VS Code. AI assistance is powered by locally running LLMs via Ollama, meaning there are zero API costs and your code just never leaves your machine.

I built this to understand how browser-based IDEs like CodeSandbox and StackBlitz work under the hood, studying the architecture of existing open-source WebContainers projects and then building my own implementation on top of that understanding — wiring up the auth layer, Prisma schema, dashboard, AI chat/completion endpoints, and the Monaco↔WebContainer file sync myself.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser Tab                           │
│                                                              │
│   ┌─────────────────┐      ┌──────────────────────────────┐  │
│   │  Monaco Editor  │─────▶│  WebContainers API           │  │
│   │  (VS Code       │      │  Node.js running via         │  │
│   │   engine)       │      │  browser service worker      │  │
│   └─────────────────┘      └──────────────────────────────┘  │
│           │                              │                    │
│   ┌─────────────────┐      ┌──────────────────────────────┐  │
│   │  xterm.js       │      │  Virtual File System         │  │
│   │  Terminal       │      │  + File Explorer UI          │  │
│   └─────────────────┘      └──────────────────────────────┘  │
│                                                              │
│   ┌─────────────────┐                                        │
│   │  Ollama AI      │  ← local LLM, zero API cost           │
│   │  Chat Sidebar   │                                        │
│   └─────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
                      │  auth + project persistence only
                      ▼
          ┌───────────────────────────┐
          │  Next.js API Routes       │
          │  NextAuth.js (OAuth)      │
          │  Prisma ORM + Database    │
          └───────────────────────────┘
```

**The key insight:** WebContainers intercepts all network requests made by Node.js running in the browser using a service worker and simulates a complete POSIX file system in memory. The backend only handles authentication and project state persistence - all code execution is entirely client-side.

---

## Features

| Feature | Description |
|---|---|
|  OAuth Authentication | Google and GitHub sign-in via NextAuth.js with full session management |
|  Monaco Editor | VS Code-grade editor - syntax highlighting, IntelliSense, multi-file support |
|  WebContainers Runtime | Runs real Node.js applications entirely inside the browser — no server execution |
|  AI Assistant | Local LLM via Ollama — code chat sidebar with persisted history, inline suggestions, zero API cost |
|  Embedded Terminal | Full xterm.js terminal running in the browser, connected to the WebContainers process |
|  File Explorer | Create, rename, delete files and folders - synced live to Monaco and WebContainers |
|  6 Starter Templates | React, Next.js, Vue, Express, Hono, and Angular |
|  Dark / Light Mode | Full theme switching via TailwindCSS and ShadCN UI components |

---

## Tech Stack

| Layer | Technology | Why This Choice |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server and client components, API routes, and auth all in one framework |
| Language | TypeScript | End-to-end type safety - catches file system and API shape errors at compile time |
| Styling | TailwindCSS + ShadCN UI | Utility-first CSS with an accessible, composable component library |
| Code Editor | Monaco Editor | The same engine as VS Code - battle-tested, feature-complete, extensible |
| Browser Runtime | WebContainers API | Runs a real Node.js environment in a service worker - no backend execution needed |
| AI Integration | Ollama (local LLMs) | Free, private, offline-capable AI - no cloud API key required |
| Authentication | NextAuth.js | Handles OAuth token exchange, session cookies, and route protection |
| Database | Prisma ORM | Type-safe schema-first ORM - auto-generated types from the database schema |
| Terminal | xterm.js | Full VT100-compatible terminal emulator built for the browser |

---

## Project Structure

```
NexIDE/
│
├── app/                        # Next.js App Router
│   ├── (auth)/auth/sign-in/    # Sign-in page
│   ├── (root)/                 # Landing page
│   ├── dashboard/              # Project dashboard (list, create, star, delete)
│   ├── playground/[id]/        # The actual IDE workspace for one project
│   └── api/                    # Server-side API routes (auth, chat, code-completion, template)
│
├── components/ui/              # ShadCN UI primitives (buttons, dialogs, sidebar, etc.)
│
├── modules/                    # Feature modules, grouped by domain
│   ├── auth/                   # Auth actions, hooks, sign-in/user components
│   ├── dashboard/               # Dashboard actions + components (project table, star toggle...)
│   ├── playground/              # Monaco editor, file explorer, file-CRUD dialogs, AI-suggestion hook
│   │   └── lib/code-context.ts  # Pure cursor/language/framework analysis - unit tested
│   ├── webcontainers/            # WebContainers boot hook, terminal (xterm.js), preview iframe
│   └── ai-chat/                  # AI chat sidebar panel (talks to /api/chat)
│
├── hooks/                      # Shared custom React hooks
├── lib/                        # Utility functions, Prisma client, template path map
├── prisma/                     # Database schema (MongoDB via Prisma)
├── public/                     # Static assets
├── nexide-starters/             # Starter templates for each supported framework
├── .github/workflows/ci.yml    # Lint + unit tests + build on every push/PR
│
├── auth.config.ts              # NextAuth provider configuration (GitHub, Google)
├── auth.ts                     # NextAuth callbacks, session/JWT handling
├── middleware.ts               # Route protection — redirects unauthenticated users
├── next.config.ts              # Next.js config — headers for WebContainers COOP/COEP
├── vitest.config.ts            # Unit test runner config
├── .env.example                # Environment variable template — copy to .env.local
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Ollama installed locally - [ollama.ai](https://ollama.ai)

### 1. Clone the repository

```bash
git clone https://github.com/ayushhh-here/NexIDE.git
cd NexIDE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all required values (these must match `.env.example` exactly):

```env
# Database connection string - this project uses MongoDB via Prisma
# (we recommend MongoDB Atlas — free tier at mongodb.com/atlas)
DATABASE_URL="your_mongodb_connection_string"

# NextAuth (Auth.js v5) secret — generate with: openssl rand -base64 32
AUTH_SECRET="your_auth_secret"

# GitHub OAuth — create at github.com/settings/developers
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"

# Google OAuth — create at console.cloud.google.com
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"

# AI features (chat + code completion) call this Ollama instance from the
# server. Defaults to http://localhost:11434 for local dev, which works
# because Ollama runs on the same machine as `npm run dev`. If you deploy
# this app anywhere else, point OLLAMA_URL at an Ollama instance that's
# actually reachable from that server - "localhost" there means the
# deployment host, not your machine or a visitor's browser.
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="codellama:latest"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Pull an Ollama model for AI features

```bash
# Recommended — good balance of speed and capability
ollama pull llama3

# Start Ollama — runs on localhost:11434 by default
ollama serve
```

---

## Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google or GitHub, pick a starter template, and start coding immediately. The editor, terminal, and file explorer are live in the browser — no additional setup.

The AI sidebar connects to your local Ollama instance. Type a prompt, paste code, or ask it to explain or refactor a function.

---

## Known Limitations

- **AI features are local-first by design.** `/api/chat` and `/api/code-completion` call whatever `OLLAMA_URL` points at from the *server*, not the browser. That's fine for `npm run dev` on your own machine, but if you deploy NexIDE to a host like Vercel, `localhost` refers to that server, not your laptop or a visitor's browser — the AI sidebar will fail silently (it falls back to `"// AI suggestion unavailable"`) unless `OLLAMA_URL` is pointed at an Ollama instance actually reachable from the deployment. For a live demo link, either self-host Ollama somewhere reachable, swap in a hosted LLM API, or just note in the demo that AI features require the local dev setup.
- Editor/WebContainer typing still has a handful of `any` escapes in a few components (mainly around AI-suggestion decorations and terminal process handles) — functional, but not fully strict TypeScript yet.
- No real-time collaboration yet — one user per playground session (see Roadmap).

---

## Running Tests

```bash
npm test
```

Unit tests cover the pure code-analysis helpers in `modules/playground/lib/code-context.ts` (language/framework detection, cursor-context analysis used to build AI prompts). A GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, tests, and a full build on every push and PR.

---

## What I Learned Building This

**WebContainers and service workers**
WebContainers registers a service worker that intercepts all `fetch` calls made from within the iframe. It simulates a complete POSIX file system in memory and maps Node.js module resolution to that virtual FS. 

**Next.js App Router architecture**
This project forced me to properly understand the server/client component boundary. The auth layer runs entirely server-side. The IDE workspace is a client component tree. Getting state to flow correctly between them required understanding how Next.js handles hydration and how `"use client"` propagates through a component tree.

**COOP and COEP headers for SharedArrayBuffer**
WebContainers requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers to access SharedArrayBuffer for the service worker. Configuring these in `next.config.ts` without breaking OAuth redirects was a genuinely tricky problem.

**Monaco Editor's internal model API**
Using Monaco as a controlled React component requires working with its internal `ITextModel` and `IStandaloneCodeEditor` APIs directly — not just the React wrapper props. Syncing model state to the WebContainers virtual file system in real time required understanding how Monaco fires change events and how to batch updates correctly.

---

## Roadmap

- [x] CI pipeline with GitHub Actions (lint, test, build)
- [x] Unit tests for core code-analysis logic
- [ ] Live collaboration via WebRTC and CRDT-based conflict resolution
- [ ] One-click deploy to Railway or Render from inside the IDE
- [ ] Real email notifications via Resend
- [ ] Python runtime support via Pyodide
- [ ] Additional templates — Bun, Deno, SvelteKit, Astro
- [ ] Hosted-LLM fallback so AI features work on a live deployed demo, not just local dev

---

## 📄 License

MIT — use it, fork it, break it, learn from it.

---

<div align="center">

Built by [ayushhh-here](https://github.com/ayushhh-here) · 3rd year B.Tech · NIT Agartala

*cheers !!!*

</div>
