# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Database Commands
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations

## Project Architecture

This is a Next.js 14 application built as an AI B-Roll Maker / Content Creator platform with the following key architectural components:

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Framer Motion
- **Backend**: Next.js Server Actions, Drizzle ORM with PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Payments**: Stripe integration
- **AI/Media**: FFmpeg integration (@ffmpeg/ffmpeg), Runway ML SDK, OpenAI, Groq SDK
- **File Processing**: Canvas, jsPDF, JSZip for exports

### Directory Structure & Conventions

Following the .cursorrules specifications:

#### Components (`/components`)
- Named with kebab-case: `example-component.tsx`
- Organized by feature areas:
  - `content-assets/` - Content library and asset management
  - `courses/` - Course-related components
  - `storyline/` - Video creation and editing components
  - `ui/` - Base UI components (Shadcn/ui)
  - `dashboard/` - Dashboard-specific components

#### Server Actions (`/actions`)
- Named with kebab-case: `example-actions.ts`
- Feature-organized:
  - `credits-actions.ts` - Credit/usage management
  - `profiles-actions.ts` - User profile management
  - `storyline/` - Video processing actions
  - `stripe-actions.ts` - Payment processing

#### Database (`/db`)
- **Schemas** (`/db/schema`): `example-schema.ts`
- **Queries** (`/db/queries`): `example-queries.ts`
- Uses Drizzle ORM with PostgreSQL

#### App Router Structure (`/app`)
- `(auth)/` - Authentication pages (login, signup)
- `(marketing)/` - Marketing/landing pages
- `dashboard/` - Main application dashboard and features
- `api/` - API routes including webhooks

### Key Features & Components

#### Content Assets System
- Asset cards with dynamic icons/gradients based on type
- PDF generation and download functionality
- Copy-to-clipboard for viral hooks
- Image grid with search/filter capabilities
- Data source: `lib/hooks-data.ts`

#### Authentication & Authorization
- Clerk integration with middleware protection
- Password-gated access for signup/login
- Profile auto-creation on first authentication
- Protected routes pattern: `/dashboard(.*)`

#### Payment Integration
- Stripe integration for subscriptions
- Whop marketplace integration
- Credit-based usage system
- Payment status alerts and upgrade flows

#### Video/Media Processing
- FFmpeg integration for client-side processing
- File size limits and optimization
- Canvas-based rendering
- Export capabilities (PDF, ZIP)

### Development Guidelines

#### Authentication Flow
- Users authenticate via Clerk
- Profiles auto-created in `app/layout.tsx:24-43`
- Middleware handles route protection and payment redirects
- Password gate controlled via `STORYBOARD_PASSWORD` env var

#### Database Patterns
- Use Drizzle ORM for all database operations
- Schema files define table structures
- Query files contain reusable database operations
- Server Actions handle business logic

#### Component Patterns
- Use Shadcn/ui as base component library
- Framer Motion for animations
- Client components marked with `'use client'`
- Consistent styling with Tailwind CSS

#### File Processing
- Client-side FFmpeg for video processing
- File size monitoring to prevent 4.5MB Next.js limit
- Canvas-based image manipulation
- PDF/ZIP generation for exports

### Environment Variables
Required environment variables (see `.env.local.example`):
- Database: `DATABASE_URL` (Supabase)
- Auth: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Password Gate: `STORYBOARD_PASSWORD`

### Important Notes
- File uploads have size restrictions due to Next.js limits
- Client-side video processing requires FFmpeg WebAssembly
- Payment flows handle both Stripe and Whop integrations
- Middleware includes 431 error prevention for large URL parameters