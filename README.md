# tickets-apexnet

Course Representatives' Party Night ticketing platform and organizer dashboard.

## Features
- 🎟️ Guest checkout & instant official ticket generation
- 🔢 Multi-ticket quantity selection ($1..10$) with server-authoritative pricing
- 💳 Korapay checkout redirect & automated payment verification fallback
- 🔒 Secure admin dashboard with server-only password gate & HMAC session
- ⚡ Fast, responsive dark UI built with Next.js App Router & Tailwind CSS

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (with resilient local storage fallback)
- **Payments:** Korapay
- **Testing:** Vitest

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and set required keys:
```bash
cp .env.example .env.local
```

### 3. Run development server
```bash
npm run dev
```

### 4. Run tests
```bash
npm test
```
