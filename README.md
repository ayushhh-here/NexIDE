# ⚡ NexIDE

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-CC0000?style=for-the-badge&logoColor=white)

<br/>

> **A browser-based AI-powered IDE — write, run, and deploy code**
> **instantly with zero local setup.**

<br/>



</div>

---

## 🧠 What is NexIDE?

NexIDE is a fully browser-based development environment — no installs, no Docker containers on your machine, no configuration required. You open a browser tab and start coding immediately.

It runs real Node.js applications directly inside the browser using the WebContainers API — the same technology that powers StackBlitz. The code editor is Monaco Editor, the exact same engine that runs VS Code. AI assistance is powered by locally running LLMs via Ollama, meaning there are zero API costs and your code never leaves your machine.

This is my first major fullstack project. I built it to deeply understand how tools like CodeSandbox and StackBlitz actually work under the hood — because using them as a black box was not enough. I wanted to know exactly how you run a Node.js process inside a browser tab.

---

## 🏗️ Architecture

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

**The key insight:** WebContainers intercepts all network requests made by Node.js running in the browser using a service worker and simulates a complete POSIX file system in memory. The backend only handles authentication and project state persistence — all code execution is entirely client-side.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 OAuth Authentication | Google and GitHub sign-in via NextAuth.js with full session management |
| 🔴 Monaco Editor | VS Code-grade editor — syntax highlighting, IntelliSense, multi-file support |
| 🔴 WebContainers Runtime | Runs real Node.js applications entirely inside the browser — no server execution |
| 🔴 AI Assistant | Local LLM via Ollama — code chat sidebar, inline suggestions, zero API cost |
| 🔴 Embedded Terminal | Full xterm.js terminal running in the browser, connected to the WebContainers process |
| 🔴 File Explorer | Create, rename, delete files and folders — synced live to Monaco and WebContainers |
| 🔴 8+ Starter Templates | React, Next.js, Vue, Express, Hono, Angular, Vanilla JS, and Node.js |
| 🔴 Dark / Light Mode | Full theme switching via TailwindCSS and ShadCN UI components |

---

## 🛠️ Tech Stack

| Layer | Technology | Why This Choice |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server and client components, API routes, and auth all in one framework |
| Language | TypeScript | End-to-end type safety — catches file system and API shape errors at compile time |
| Styling | TailwindCSS + ShadCN UI | Utility-first CSS with an accessible, composable component library |
| Code Editor | Monaco Editor | The same engine as VS Code — battle-tested, feature-complete, extensible |
| Browser Runtime | WebContainers API | Runs a real Node.js environment in a service worker — no backend execution needed |
| AI Integration | Ollama (local LLMs) | Free, private, offline-capable AI — no cloud API key required |
| Authentication | NextAuth.js | Handles OAuth token exchange, session cookies, and route protection |
| Database | Prisma ORM | Type-safe schema-first ORM — auto-generated types from the database schema |
| Terminal | xterm.js | Full VT100-compatible terminal emulator built for the browser |

---

## 📁 Project Structure

```
NexIDE/
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Sign in and sign up pages
│   ├── (dashboard)/            # Main IDE workspace layout
│   └── api/                    # Server-side API route handlers
│
├── components/                 # Reusable React components
│   ├── editor/                 # Monaco Editor wrapper and configuration
│   ├── terminal/               # xterm.js terminal component
│   ├── file-explorer/          # File tree UI with full CRUD
│   └── ai-sidebar/             # Ollama chat interface component
│
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions and shared configuration
├── modules/                    # Feature modules — WebContainers bootstrap, etc.
├── prisma/                     # Database schema and migration files
├── public/                     # Static assets
├── vibecode-starters/          # Starter templates for each supported framework
│
├── auth.config.ts              # NextAuth provider and callback configuration
├── auth.ts                     # Session utilities and auth helpers
├── middleware.ts               # Route protection — redirects unauthenticated users
├── next.config.ts              # Next.js config — headers for WebContainers COOP/COEP
├── .env.example                # Environment variable template — copy to .env.local
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Ollama installed locally — [ollama.ai](https://ollama.ai)

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

Open `.env.local` and fill in all required values:

```env
# Database connection string
DATABASE_URL="your_database_url"

# NextAuth secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — create at console.cloud.google.com
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth — create at github.com/settings/developers
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
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

## ▶️ Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google or GitHub, pick a starter template, and start coding immediately. The editor, terminal, and file explorer are live in the browser — no additional setup.

The AI sidebar connects to your local Ollama instance. Type a prompt, paste code, or ask it to explain or refactor a function.

---

## 📚 What I Learned Building This

**WebContainers and service workers**
WebContainers registers a service worker that intercepts all `fetch` calls made from within the iframe. It simulates a complete POSIX file system in memory and maps Node.js module resolution to that virtual FS. Understanding this changed how I think about what browsers are actually capable of.

**Next.js App Router architecture**
This project forced me to properly understand the server/client component boundary. The auth layer runs entirely server-side. The IDE workspace is a client component tree. Getting state to flow correctly between them required understanding how Next.js handles hydration and how `"use client"` propagates through a component tree.

**COOP and COEP headers for SharedArrayBuffer**
WebContainers requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers to access SharedArrayBuffer for the service worker. Configuring these in `next.config.ts` without breaking OAuth redirects was a genuinely tricky problem.

**Monaco Editor's internal model API**
Using Monaco as a controlled React component requires working with its internal `ITextModel` and `IStandaloneCodeEditor` APIs directly — not just the React wrapper props. Syncing model state to the WebContainers virtual file system in real time required understanding how Monaco fires change events and how to batch updates correctly.

---

## 🗺️ Roadmap

- [ ] Live collaboration via WebRTC and CRDT-based conflict resolution
- [ ] One-click deploy to Railway or Render from inside the IDE
- [ ] Real email notifications via Resend
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Python runtime support via Pyodide
- [ ] Additional templates — Bun, Deno, SvelteKit, Astro

---

## 📄 License

MIT — use it, fork it, break it, learn from it.

---

<div align="center">

Built by [ayushhh-here](https://github.com/ayushhh-here) · 3rd year B.Tech · NIT Agartala

*cheers !!!*

</div>
