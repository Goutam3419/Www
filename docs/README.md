# AI CEO Agent - Production Enterprise Platform (Foundation v1.0)

Welcome to the **AI CEO Agent Platform**, an Enterprise Autonomous AI Coding and Project Management Platform engineered for production scale.

## Overview
AI CEO Agent enables human executives (CEOs) to direct software engineering projects entirely through high-level AI dialogue. The platform provides a multi-tenant, multi-project workspace with isolated context per project, persistent platform storage, project memory, and full auditability.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes (`/app/api/*`)
- **State & Store**: Enterprise Platform Database with Foreign Key integrity, cascade soft delete, and structured logging
- **AI Router Specifications**: OpenRouter (Claude 3.5 Sonnet, Gemini 2.5 Flash, GPT-4o) & Google Gemini SDK
- **Architecture**: Micro-Module Architecture with monorepo directory layout (`apps/`, `packages/`, `services/`, `docs/`, `docker/`)

## Quick Start
```bash
# Install dependencies
npm install

# Start development server on Port 3000
npm run dev

# Build for production
npm run build
```

## System Requirements
- Node.js 20+
- Port 3000 (Cloud Run / Reverse Proxy standard)
