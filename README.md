# Brewde

Brewde is a fast POS system for cafés that simplifies orders, payments, and sales tracking in one clean dashboard, made with full-stack Next.js.

## Tech Stack

- Next.js (Full Stack)
- Supabase (Database + Auth)
- TypeScript
- Tailwind CSS

## Setup

1. Install dependencies
```bash
npm install
Setup environment variables
cp .env.local.example .env.local
Run database migrations in Supabase
supabase/migrations/001_initial.sql
Start development server
npm run dev
Features
Multi-tenant café system
Approval-based onboarding
POS order system
Cart & checkout
Discount system (PWD / Senior)
Sales dashboard
Role-based access (Admin, Owner, Cashier)
Deployment

Recommended:

Vercel (frontend + backend)
Supabase (database)
