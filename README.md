<div align="center">

<!-- Replace with your logo/banner: docs/assets/banner.png -->
<!-- <img src="docs/assets/banner.png" alt="BioSence banner" width="100%"/> -->

# 🩺 BioSence

### GenAI-Powered Predictive Health Intelligence

**Turning wearable health data into personalized, evidence-grounded insights.**

<br/>

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)
![Type](https://img.shields.io/badge/type-final--year%20B.Tech%20project-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Not a medical device](https://img.shields.io/badge/medical%20device-NO-red?style=flat-square)

**AI/ML · Generative AI · RAG · Predictive Analytics · Wearable Health Monitoring**

[Overview](#-overview) •
[Features](#-key-features) •
[Architecture](#-system-architecture) •
[Tech Stack](#-technology-stack) •
[Getting Started](#-getting-started) •
[Structure](#-project-structure) •
[Evaluation](#-model-evaluation) •
[Security](#-security-and-privacy) •
[Roadmap](#-roadmap)

</div>

---

> [!WARNING]
> **BioSence is an educational and engineering project, not a medical diagnostic device.** Its outputs are informational only and are **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Why BioSence?](#-why-biosence)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Model Evaluation](#-model-evaluation)
- [Security and Privacy](#-security-and-privacy)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Overview

**BioSence** is an AI-powered health intelligence platform that analyzes wearable health data, identifies unusual patterns, forecasts health-related trends where the data supports it, and answers questions through a **Generative AI assistant grounded in approved health documents**.

It combines **Machine Learning**, **time-series analytics**, **Retrieval-Augmented Generation (RAG)**, and an interactive **web dashboard** to make personal health data easier to understand and act on, supporting continuous monitoring through personalized insights, anomaly alerts, and trusted health-information retrieval.

<div align="center">

```
Better Data  →  Smarter Insights  →  Healthier Tomorrow
```

</div>

---

## 💡 Why BioSence?

| The problem | The BioSence approach |
| --- | --- |
| Wearable apps show raw numbers with little context | **Personalized baselines** so "normal" is defined per user, not by a population average |
| Generic thresholds cause false alarms | **Statistical + ML anomaly detection** tuned and measured by precision, recall, and false-alarm rate |
| LLM health answers can hallucinate | **RAG with citations** over approved documents, with safe fallback when evidence is lacking |
| Health data is highly sensitive | **Auth, RBAC, and Row Level Security** designed in from the start |
| Demos that only "look good" | **Measurable evaluation** for every AI component |

---

## 🎯 Project Objectives

- [x] Define a clear, measurable scope for health monitoring and insight generation
- [ ] Monitor physiological data from compatible wearable devices or datasets
- [ ] Establish personalized baselines from historical measurements
- [ ] Detect unusual patterns using statistical and machine-learning techniques
- [ ] Forecast future trends when suitable longitudinal data is available
- [ ] Provide evidence-grounded explanations using Generative AI and RAG
- [ ] Present trends and alerts through an interactive dashboard
- [ ] Support authorized caregiver and administrator monitoring
- [ ] Protect personal health information with authentication and access controls

> Update the checkboxes as features are implemented and verified.

---

## ✨ Key Features

### 👤 Personal Health Dashboard

- Personal profile and health-data management
- Health readings with historical trend visualizations
- Personalized baseline monitoring
- Anomaly alerts and health-information assistance
- User-specific access to personal records only

### 🛡️ Administrative Dashboard

- Registered-user management
- Authorized health-data and trend monitoring
- Alert review and status management
- Role-based permissions and audit logging

> 🚧 *Planned / in progress until implementation is verified in the repository.*

### ⌚ Wearable Health Integration

| Metric | Description |
| --- | --- |
| ❤️ Heart rate | Resting and active heart-rate readings |
| 🩸 SpO₂ | Blood oxygen saturation |
| 📉 HRV | Heart-rate variability |
| 😴 Sleep | Duration and patterns |
| 🏃 Activity | Physical activity and movement |

> Actual data availability depends on the connected device, official API, user permissions, and platform limitations.

### 🧠 AI-Powered Anomaly Detection

- Personalized baseline calculation per user
- Statistical detection using methods such as **Modified Z-Score** (median/MAD-based, robust to outliers)
- Extensible to ML approaches (e.g., Isolation Forest)
- Evaluated with **precision, recall, F1-score, and false-alarm rate**

### 📈 Predictive Analytics

- Historical time-series analysis
- Trend forecasting where the data supports it
- Evaluated with **MAE** and **RMSE**
- **Time-aware validation** to prevent data leakage

### 💬 GenAI Health Assistant

- Retrieval-Augmented Generation over approved health-information documents
- Context-grounded answers with **source citations**
- Evidence-aware responses
- **Safe refusal / fallback** when supporting evidence is insufficient

---

# BioSence System Architecture

> **Status:** Intended architecture. Components are marked as implemented, partial, or planned as development progresses.
> BioSence is a monitoring and decision-support prototype, **not** a diagnostic medical device.


```mermaid
flowchart TB
    %% ---------- CLIENT ZONE (untrusted) ----------
    subgraph CLIENT["Client Zone - untrusted"]
        direction LR
        U["Patient / User"] --> UD["Patient Dashboard<br/>profile, readings, trends,<br/>alerts, forecasts, assistant"]
        A["Authorized Admin"] --> AD["Admin Panel<br/>users, alert queue, ingestion status,<br/>AI health, audit viewer"]
    end

    %% ---------- ACCESS LAYER ----------
    subgraph ACCESS["Access Layer"]
        direction TB
        AUTH["Supabase Auth<br/>sessions + JWT"]
        GW["API Gateway / FastAPI<br/>validation, rate limiting"]
        RBAC["Server-side RBAC<br/>role read from DB, never from client"]
        AUTH --> GW --> RBAC
    end

    UD -->|"user JWT"| AUTH
    AD -->|"admin JWT + MFA"| AUTH

    RBAC -->|"/api/user/*  own records only"| UAPI
    RBAC -->|"/api/admin/*  role + purpose check"| AAPI

    %% ---------- APPLICATION SERVICES ----------
    subgraph APP["Application Services - trusted backend"]
        direction TB
        UAPI["User API<br/>profile, readings, alerts,<br/>forecasts, assistant"]
        AAPI["Admin API<br/>user and role management,<br/>alert triage, ingestion status"]
    end

    %% ---------- INGESTION ----------
    subgraph INGEST["Data Ingestion"]
        direction TB
        SRC1["Manual entry"]
        SRC2["Wearable adapter<br/>Fitbit / Health Connect / other"]
        SRC3["Simulated dataset adapter<br/>LABELLED SYNTHETIC"]
        VAL["Validation<br/>units, ranges, timestamps to UTC"]
        DEDUP["Idempotent dedupe<br/>user + device + metric + timestamp"]
        QUAR["Quarantine<br/>invalid or implausible readings"]
        SRC1 --> VAL
        SRC2 --> VAL
        SRC3 --> VAL
        VAL -->|valid| DEDUP
        VAL -->|invalid| QUAR
    end

    UAPI --> SRC1
    UAPI --> SRC2
    SRC3 -.->|"dev / demo only"| VAL

    %% ---------- DATA ZONE ----------
    subgraph DATA["Data Zone - Supabase PostgreSQL with RLS"]
        direction TB
        DB[("health_readings, profiles,<br/>user_roles, devices,<br/>consent_records")]
        INSIGHT[("personal_baselines,<br/>anomaly_events, forecasts,<br/>model_evaluations")]
        ALERTDB[("alerts, alert_events")]
        AUDIT[("audit_logs<br/>append-only")]
    end

    DEDUP --> DB
    UAPI -->|"RLS: auth.uid = owner"| DB
    AAPI -->|"scoped, purpose-limited reads"| DB

    %% ---------- AI / ML ----------
    subgraph ML["AI / ML Intelligence"]
        direction TB
        BASE["Baseline builder<br/>per user, robust statistics"]
        ANOM["Anomaly detection<br/>Modified Z-Score first, ML if justified"]
        FORE["Forecasting<br/>vs naive baseline, time-split eval"]
        EVAL["Evaluation and drift monitor<br/>precision, recall, F1, MAE, RMSE"]
        BASE --> ANOM
        BASE --> FORE
        ANOM --> EVAL
        FORE --> EVAL
    end

    DB --> BASE
    ANOM --> INSIGHT
    FORE --> INSIGHT
    EVAL --> INSIGHT

    %% ---------- ALERTS ----------
    subgraph ALERTS["Alert Lifecycle"]
        direction LR
        AL1["Rule engine<br/>configured and tested rules"] --> AL2["Alert created"]
        AL2 --> AL3["Notify user"]
        AL2 --> AL4["Admin queue"]
        AL4 --> AL5["Acknowledged"] --> AL6["Resolved"]
    end

    ANOM --> AL1
    AL2 --> ALERTDB
    AL3 --> UAPI
    AL4 --> AAPI
    AL5 --> AUDIT
    AL6 --> AUDIT

    %% ---------- GENAI / RAG ----------
    subgraph RAGZ["GenAI / RAG - grounded, citation-checked"]
        direction TB
        DOC["Approved health documents"] --> CHUNK["Extract, clean, chunk<br/>with source metadata"]
        CHUNK --> EMB["Embeddings"] --> VS[("Vector store<br/>FAISS or pgvector")]
        Q["User question<br/>PII minimised"] --> RET["Retrieve + filter evidence"]
        VS --> RET
        RET --> GUARD["Prompt-injection guard<br/>retrieved text = data, not instructions"]
        GUARD --> LLM["Google Gemini"]
        LLM --> CITE["Citation validator<br/>every source must be a real retrieved chunk"]
        CITE -->|"evidence ok"| ANS["Answer + sources"]
        CITE -->|"insufficient or contradictory"| ABS["Safe abstention"]
    end

    UAPI --> Q
    ANS --> UAPI
    ABS --> UAPI
    INSIGHT -.->|"consented, minimal context only"| Q

    %% ---------- AUDIT + OPS ----------
    AAPI -->|"every sensitive access logged"| AUDIT
    RBAC -->|"role changes and denials"| AUDIT

    subgraph OPS["Operations"]
        direction LR
        MON["Health checks, logs<br/>no health data in logs"]
        CICD["CI/CD, tests, dependency scans"]
    end

    APP --> MON
    ML --> MON
    RAGZ --> MON
```

## Design Decisions

| Area | Decision |
|---|---|
| **User vs admin** | Separate entry points and API namespaces (`/api/user/*`, `/api/admin/*`); one server-side RBAC check that reads the role from the database |
| **Admin safety** | Scoped, purpose-limited reads; MFA required; every sensitive access written to the append-only audit log |
| **Patient isolation** | Row Level Security (`auth.uid() = owner`) enforced in the database, so isolation holds even if an API route has a bug |
| **Ingestion** | Validation, idempotent dedupe key, and quarantine for invalid readings |
| **Simulated data** | Separate adapter, always labelled synthetic, never presented as live wearable data |
| **RAG** | Prompt-injection guard, citation validator, and safe abstention when evidence is insufficient |
| **Alerts** | Rule → alert → user notification + admin queue → acknowledged → resolved, with each step audited |
| **Evaluation** | Metrics and drift monitoring stored with model version metadata |


# 🧬 BioSence Explained Architecture

> **Status:** Intended architecture. Update the status table at the bottom as features are built and tested.
> ⚠️ BioSence is a monitoring and decision-support prototype, **not** a diagnostic medical device.

### 🎨 Legend

| Color | Meaning |
|---|---|
| 🟦 Blue | Users and client apps |
| 🟪 Purple | Security and access control |
| 🟩 Green | Data storage |
| 🟧 Orange | AI / ML |
| 🟥 Red | Alerts, quarantine, audit |
| 🟨 Yellow | GenAI / RAG |

---

## 1️⃣ Big Picture

```mermaid
flowchart LR
    P["👤 PATIENT<br/>Dashboard"]:::user
    A["🛡️ ADMIN<br/>Panel"]:::user
    SEC["🔐 AUTH + RBAC + RLS"]:::sec
    DATA[("🗄️ DATABASE<br/>Supabase PostgreSQL")]:::data
    ML["🧠 AI / ML<br/>Anomaly + Forecast"]:::ml
    RAG["💬 GenAI ASSISTANT<br/>RAG + Gemini"]:::rag
    AL["🚨 ALERTS"]:::alert

    P --> SEC
    A --> SEC
    SEC --> DATA
    DATA --> ML
    DATA --> RAG
    ML --> AL
    AL --> P
    AL --> A
    RAG --> P

    classDef user fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff,stroke-width:3px,font-size:18px
    classDef sec fill:#7e22ce,stroke:#581c87,color:#ffffff,stroke-width:3px,font-size:18px
    classDef data fill:#15803d,stroke:#14532d,color:#ffffff,stroke-width:3px,font-size:18px
    classDef ml fill:#ea580c,stroke:#9a3412,color:#ffffff,stroke-width:3px,font-size:18px
    classDef rag fill:#ca8a04,stroke:#713f12,color:#ffffff,stroke-width:3px,font-size:18px
    classDef alert fill:#dc2626,stroke:#7f1d1d,color:#ffffff,stroke-width:3px,font-size:18px
```

---

## 2️⃣ Patient vs Admin Access

```mermaid
flowchart TB
    P["👤 PATIENT"]:::user
    A["🛡️ ADMIN"]:::user

    AUTH["🔑 Supabase Auth<br/>JWT session"]:::sec
    RBAC["🔐 Server-side RBAC<br/>role read from DB<br/>never from the client"]:::sec

    UAPI["📱 User API<br/>/api/user/*<br/>OWN records only"]:::user
    AAPI["🛠️ Admin API<br/>/api/admin/*<br/>role + purpose check + MFA"]:::user

    RLS["🧱 Row Level Security<br/>auth.uid = owner"]:::sec
    DB[("🗄️ Database")]:::data
    AUDIT[("📜 Audit Log<br/>append-only")]:::alert

    P --> AUTH
    A --> AUTH
    AUTH --> RBAC
    RBAC --> UAPI
    RBAC --> AAPI
    UAPI --> RLS --> DB
    AAPI -->|"scoped reads"| DB
    AAPI -->|"every access logged"| AUDIT
    RBAC -->|"role changes + denials"| AUDIT

    classDef user fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff,stroke-width:3px,font-size:16px
    classDef sec fill:#7e22ce,stroke:#581c87,color:#ffffff,stroke-width:3px,font-size:16px
    classDef data fill:#15803d,stroke:#14532d,color:#ffffff,stroke-width:3px,font-size:16px
    classDef alert fill:#dc2626,stroke:#7f1d1d,color:#ffffff,stroke-width:3px,font-size:16px
```

| | 👤 Patient | 🛡️ Admin |
|---|---|---|
| **Sees** | Own data only | Only what the role and purpose allow |
| **Enforced by** | RLS in the database | RBAC + purpose check + MFA |
| **Logged** | Normal activity | **Every** sensitive access |

---

## 3️⃣ Data Ingestion

```mermaid
flowchart LR
    S1["✍️ Manual entry"]:::user
    S2["⌚ Wearable adapter<br/>Fitbit / Health Connect"]:::user
    S3["🧪 Simulated data<br/>LABELLED SYNTHETIC"]:::alert

    VAL{"✅ Validate<br/>units, ranges,<br/>timestamps to UTC"}:::ml
    DEDUP["🔁 Dedupe<br/>user + device +<br/>metric + timestamp"]:::ml
    DB[("🗄️ health_readings")]:::data
    Q[("🚫 Quarantine<br/>invalid readings")]:::alert

    S1 --> VAL
    S2 --> VAL
    S3 -.->|"demo only"| VAL
    VAL -->|valid| DEDUP --> DB
    VAL -->|invalid| Q

    classDef user fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff,stroke-width:3px,font-size:16px
    classDef data fill:#15803d,stroke:#14532d,color:#ffffff,stroke-width:3px,font-size:16px
    classDef ml fill:#ea580c,stroke:#9a3412,color:#ffffff,stroke-width:3px,font-size:16px
    classDef alert fill:#dc2626,stroke:#7f1d1d,color:#ffffff,stroke-width:3px,font-size:16px
```

---

## 4️⃣ AI / ML and Alert Lifecycle

```mermaid
flowchart LR
    DB[("🗄️ Readings")]:::data
    BASE["📏 Personal Baseline<br/>per user, robust stats"]:::ml
    ANOM["🔍 Anomaly Detection<br/>Modified Z-Score first"]:::ml
    FORE["📈 Forecasting<br/>vs naive baseline"]:::ml
    EVAL["📊 Evaluation<br/>Precision, Recall, F1,<br/>MAE, RMSE"]:::ml

    RULE["⚙️ Alert Rules<br/>configured + tested"]:::alert
    ALERT["🚨 Alert Created"]:::alert
    USER["👤 Notify User"]:::user
    QUEUE["🛡️ Admin Queue"]:::user
    ACK["👀 Acknowledged"]:::alert
    RES["✅ Resolved"]:::alert
    AUDIT[("📜 Audit Log")]:::alert

    DB --> BASE --> ANOM --> RULE --> ALERT
    BASE --> FORE
    ANOM --> EVAL
    FORE --> EVAL
    ALERT --> USER
    ALERT --> QUEUE --> ACK --> RES
    ACK --> AUDIT
    RES --> AUDIT

    classDef user fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff,stroke-width:3px,font-size:16px
    classDef data fill:#15803d,stroke:#14532d,color:#ffffff,stroke-width:3px,font-size:16px
    classDef ml fill:#ea580c,stroke:#9a3412,color:#ffffff,stroke-width:3px,font-size:16px
    classDef alert fill:#dc2626,stroke:#7f1d1d,color:#ffffff,stroke-width:3px,font-size:16px
```

---

## 5️⃣ GenAI Assistant (RAG)

```mermaid
flowchart TB
    DOC["📚 Approved<br/>Health Documents"]:::rag
    CHUNK["✂️ Extract + Chunk<br/>with source metadata"]:::rag
    VS[("🧮 Vector Store<br/>FAISS / pgvector")]:::data

    Q["❓ User Question<br/>personal data minimised"]:::user
    RET["🔎 Retrieve Evidence"]:::rag
    GUARD["🛡️ Prompt-Injection Guard<br/>documents = data, not instructions"]:::sec
    LLM["🤖 Google Gemini"]:::rag
    CITE{"📎 Citation Validator<br/>real retrieved sources only"}:::sec
    ANS["✅ Answer + Sources"]:::data
    ABS["🙅 Safe Abstention<br/>not enough evidence"]:::alert

    DOC --> CHUNK --> VS
    Q --> RET
    VS --> RET --> GUARD --> LLM --> CITE
    CITE -->|"evidence OK"| ANS
    CITE -->|"insufficient / contradictory"| ABS

    classDef user fill:#1d4ed8,stroke:#1e3a8a,color:#ffffff,stroke-width:3px,font-size:16px
    classDef sec fill:#7e22ce,stroke:#581c87,color:#ffffff,stroke-width:3px,font-size:16px
    classDef data fill:#15803d,stroke:#14532d,color:#ffffff,stroke-width:3px,font-size:16px
    classDef rag fill:#ca8a04,stroke:#713f12,color:#ffffff,stroke-width:3px,font-size:16px
    classDef alert fill:#dc2626,stroke:#7f1d1d,color:#ffffff,stroke-width:3px,font-size:16px
```

> The assistant never diagnoses. It separates measured readings, algorithm flags, and general health information.

---

## ✅ Component Status

| Component | Status |
|---|---|
| 👤 Patient dashboard | ⬜ Planned |
| 🛡️ Admin panel | ⬜ Planned |
| 🔐 Auth + RLS | ⬜ Planned |
| 🔁 Ingestion + validation | ⬜ Planned |
| 🔍 Anomaly detection | ⬜ Planned |
| 📈 Forecasting | ⬜ Planned |
| 💬 RAG assistant | ⬜ Planned |
| ⌚ Wearable integration | ⬜ Planned |

**Status key:** ⬜ Planned · 🟨 Partial · 🟩 Implemented and tested · 🟥 Blocked

## Design Decisions

| Area | Decision |
|---|---|
| **User vs admin** | Separate entry points and API namespaces (`/api/user/*`, `/api/admin/*`); one server-side RBAC check that reads the role from the database |
| **Admin safety** | Scoped, purpose-limited reads; MFA required; every sensitive access written to the append-only audit log |
| **Patient isolation** | Row Level Security (`auth.uid() = owner`) enforced in the database, so isolation holds even if an API route has a bug |
| **Ingestion** | Validation, idempotent dedupe key, and quarantine for invalid readings |
| **Simulated data** | Separate adapter, always labelled synthetic, never presented as live wearable data |
| **RAG** | Prompt-injection guard, citation validator, and safe abstention when evidence is insufficient |
| **Alerts** | Rule → alert → user notification + admin queue → acknowledged → resolved, with each step audited |
| **Evaluation** | Metrics and drift monitoring stored with model version metadata |


*Update the status column as each component is implemented and tested.*

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Languages** | Python, TypeScript, SQL |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | FastAPI (where required) |
| **Database** | PostgreSQL, Supabase |
| **Authentication** | Supabase Auth |
| **AI / ML** | NumPy, Pandas, Scikit-learn |
| **Generative AI** | Google Gemini |
| **LLM Orchestration** | LangChain |
| **Vector Search** | FAISS + embeddings |
| **Deployment** | Docker, cloud hosting |
| **Version Control** | Git, GitHub |

> The actual stack may differ depending on the existing codebase. Technologies not yet implemented should be treated as planned integrations.

---

## 🔄 How It Works

```mermaid
flowchart LR
    A[1. Collect] --> B[2. Preprocess]
    B --> C[3. Personalize]
    C --> D[4. Detect]
    D --> E[5. Forecast]
    E --> F[6. Retrieve]
    F --> G[7. Generate]
    G --> H[8. Visualize]
    H --> I[9. Administer]
```

| # | Stage | What happens |
| --- | --- | --- |
| 1 | **Data collection** | Readings from a supported wearable API, manual entry, or a clearly identified dataset |
| 2 | **Preprocessing** | Validate measurements, handle missing values, normalize timestamps, check data quality |
| 3 | **Personalization** | Build an appropriate baseline from historical data |
| 4 | **Anomaly detection** | Flag unusual patterns using validated statistical or ML methods |
| 5 | **Predictive analytics** | Forecast trends when enough history exists |
| 6 | **Knowledge retrieval** | Pull relevant passages from approved health documents |
| 7 | **GenAI response** | Generate explanations grounded in retrieved evidence |
| 8 | **Visualization** | Show readings, trends, alerts, and sources in the dashboard |
| 9 | **Secure administration** | Authorized admins monitor users and alerts per assigned permissions |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.11+**
- Node.js **18+** and npm
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/)
- Docker and Docker Compose (optional, recommended)
- `make` (optional, for shortcuts)

### 1. Clone the repository

```bash
git clone https://github.com/akashtcaa2005/Bio-sense.git
cd Bio-sense
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in your values (never commit `.env`):

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # backend only, never expose to the client

# Generative AI
GEMINI_API_KEY=your_gemini_api_key

# App
APP_ENV=development
```

### 3. Quick start with helper scripts

```bash
bash scripts/setup.sh        # install backend + frontend dependencies
bash scripts/migrate.sh      # apply database migrations
bash scripts/start-dev.sh    # start backend and frontend in dev mode
```

### 4. Or run each part manually

**Backend**

```bash
cd app/backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload        # API on http://localhost:8000
```

**Frontend**

```bash
cd app/frontend
npm install
npm run dev                          # App on http://localhost:5173
```

### 5. Run with Docker

```bash
docker compose up --build
```

### 6. Run the tests

```bash
# Backend unit + integration tests
cd app/backend && pytest src/tests

# End-to-end and smoke tests (from the repo root)
# see tests/e2e and tests/smoke
```

---

## 🗂️ Project Structure

```text
Bio-sense/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example                 # Template for environment variables
├── package.json                 # Root JS/TS tooling
├── pyproject.toml               # Python project configuration
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── Makefile                     # Automation shortcuts
│
├── app/
│   ├── backend/
│   │   ├── requirements.txt
│   │   └── src/
│   │       ├── main.py          # Application entry point
│   │       ├── api/
│   │       │   ├── routes/      # Endpoint definitions
│   │       │   ├── middleware/  # Auth, logging, rate limiting
│   │       │   └── controllers/ # Request handling logic
│   │       ├── core/
│   │       │   ├── config/      # Settings and environment loading
│   │       │   ├── security/    # Auth, RBAC, access checks
│   │       │   └── utils/
│   │       ├── models/          # Data models
│   │       ├── schemas/         # Request/response validation
│   │       ├── services/        # Business logic: anomaly detection,
│   │       │                    # forecasting, RAG, alerts
│   │       ├── db/
│   │       │   ├── migrations/
│   │       │   └── seeders/
│   │       └── tests/
│   │           ├── unit/
│   │           └── integration/
│   │
│   ├── frontend/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── public/
│   │   └── src/
│   │       ├── app/             # App shell and routing
│   │       ├── components/      # Reusable UI components
│   │       ├── features/        # Dashboard, alerts, assistant, admin
│   │       ├── hooks/
│   │       ├── services/        # API clients
│   │       ├── store/           # State management
│   │       ├── styles/
│   │       └── utils/
│   │
│   └── shared/
│       ├── types/               # Shared TypeScript types
│       ├── constants/
│       └── helpers/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
│
├── scripts/
│   ├── setup.sh
│   ├── start-dev.sh
│   └── migrate.sh
│
├── tests/
│   ├── e2e/                     # End-to-end user flows
│   ├── smoke/                   # Quick post-deploy checks
│   └── fixtures/                # Sample data for tests
│
└── .github/
    ├── workflows/
    │   ├── ci.yml               # Lint + test on every push/PR
    │   └── deploy.yml           # Deployment pipeline
    └── ISSUE_TEMPLATE/
```

---

## 📚 Documentation

| Document | Description |
| --- | --- |
| [Architecture](docs/architecture.md) | System design, data flow, and component responsibilities |
| [API Reference](docs/api.md) | Endpoints, request/response schemas, and auth |
| [Deployment](docs/deployment.md) | Docker, environment setup, and hosting guide |

---

## 📊 Model Evaluation

BioSence relies on **measurable evaluation**, not just visual demos.

| Component | Metrics |
| --- | --- |
| 🚨 Anomaly detection | Precision, recall, F1-score, false-alarm rate |
| 📈 Predictive analytics | MAE, RMSE, temporal validation |
| 🔎 RAG retrieval | Recall@K, Precision@K, MRR |
| 💬 GenAI responses | Groundedness, citation correctness, relevance |
| ⚙️ Application | Test coverage, latency, reliability, access-control tests |

### Results

> Fill these in once experiments are complete. Report the dataset used and the validation method.

| Component | Metric | Result |
| --- | --- | --- |
| Anomaly detection | F1-score | _TBD_ |
| Forecasting | MAE / RMSE | _TBD_ |
| RAG retrieval | Recall@5 | _TBD_ |
| GenAI | Groundedness | _TBD_ |

---

## 🔐 Security and Privacy

Design principles:

- 🔑 Authentication and role-based authorization
- 🧱 Database-level **Row Level Security (RLS)**
- 👤 User ownership checks on personal health records
- 🚪 Restricted administrative access
- 🗝️ API credentials handled via environment variables
- 🧼 Minimal collection and exposure of sensitive information
- 📜 Auditable access to sensitive records
- 🤖 Careful handling of health data sent to external AI services

> [!NOTE]
> These are **design goals**. Their implementation and effectiveness must be verified through security testing (e.g., access-control and authorization tests).

Found a vulnerability? Please report it privately through the contact details below rather than opening a public issue.

---

## 🗺️ Roadmap

-  Wearable data ingestion pipeline
-  Personalized baseline engine
-  Modified Z-Score anomaly detection
-  ML-based anomaly detection extension
-  Time-series forecasting module
-  RAG pipeline with approved document corpus and citations
-  Interactive user dashboard
-  Admin dashboard with audit logging
-  RLS policies and access-control test suite
-  Evaluation report with published metrics
-  Dockerized deployment
-  CI/CD pipeline (GitHub Actions) with automated tests

---

## 🤝 Contributing

Contributions, feedback, and technical suggestions are welcome.

1. Open an issue to discuss significant changes first
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Commit your changes: `git commit -m "feat: add your feature"`
5. Make sure tests pass locally; the CI workflow (`.github/workflows/ci.yml`) runs on every pull request
6. Push and open a pull request

---

## 📄 License

Distributed under the terms of the [LICENSE](LICENSE) file in this repository.

---

## 👨‍💻 Author

**Akash T.**
Final-year B.Tech, Artificial Intelligence & Data Science

[![GitHub](https://img.shields.io/badge/GitHub-akashtcaa2005-181717?style=for-the-badge&logo=github)](https://github.com/akashtcaa2005)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Akash%20T.-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/akash-t-845439314/)

---

<div align="center">

**🩺 BioSence**

*Better Data → Smarter Insights → Healthier Tomorrow*

⭐ If you find this project interesting, consider giving it a star!

</div>
