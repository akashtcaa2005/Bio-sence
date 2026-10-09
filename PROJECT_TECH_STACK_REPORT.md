# Project Tech Stack Report

| Project | Language | AI/ML | Backend | Database | Frontend | APIs | LLM | Deployment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bio Sense | TypeScript, JavaScript | Not a traditional ML project; remote AI gateway calls only | Supabase Edge Functions, Express | Supabase PostgreSQL | React, Vite, Tailwind CSS | Supabase Auth, Nominatim, Resend, Twilio, Google OAuth | Lovable AI Gateway with Gemini models | Vite frontend, Supabase functions, local Node SOS server |

## Bio Sense

**Purpose:**
A personal health monitoring and emergency response app for tracking patient metrics, medication schedules, contact management, and emergency notifications.

**My likely role:**
The repository indicates a full-stack product engineering role focused on frontend development, database handling, auth flows, API integration, and notification orchestration. No direct evidence was found for a specialized ML engineering or data-science role.

**Actual stack:**
TypeScript, JavaScript, React 18, Vite, Tailwind CSS, Supabase, Supabase Edge Functions, Express, Twilio, Resend, Nominatim, Google OAuth, Lovable AI gateway.

**Architecture:**
The frontend is a Vite React app that loads user data from Supabase and triggers notifications through either Supabase Edge Functions or a local Express SOS server. Supabase stores profiles, medication data, user settings, and emergency contacts, and the backend functions call external APIs for OTP, alerting, and AI features.

**ML/AI:**
The repository does not contain a conventional training or inference stack. AI usage is limited to remote calls to the Lovable AI gateway with Gemini models for health assistant replies and diet image generation.

**Database:**
Supabase PostgreSQL schema with tables for profiles, user settings, medications, emergency contacts, alerts, and OTP records. Row Level Security is configured for user-owned data.

**API/LLM:**
Supabase Edge Functions handle OTP, health alerts, AI assistant, and diet image generation. Local Express routes also send SOS emails and SMS. The AI gateway is used for text and image generation, not a local RAG or vector pipeline.

**Interview focus:**
Supabase architecture, authentication design, notification flow, API orchestration, and care-focused product integration.
