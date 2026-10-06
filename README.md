# 🤖 BrandyBot — AI-Powered Brand Identity & Design Studio

> Transform any business idea into a complete, production-ready brand identity in minutes with conversational AI, real-time typography styling, 3D product mockups, and dynamic PDF brand guidelines.

---

## 🌟 Overview

**BrandyBot** is a full-stack, AI-powered branding suite designed for founders, designers, and creators. Instead of juggling fragmented design tools, BrandyBot unifies the entire branding lifecycle into a guided, seamless workspace:

1. **Brand Discovery** — Chat with an intelligent AI partner that unpacks your brand voice, industry, and target audience.
2. **AI Logo Generation** — Generate high-fidelity logo concepts and multi-variant vectors using custom-tuned Flux and Stable Diffusion models.
3. **Logo Typography Studio** — Pair symbols with custom typography lockups in stacked or inline layouts with real-time transparent preview and automatic background removal.
4. **AI Brand Guidelines** — Instantly create comprehensive brand identity rulebooks (color palettes, typography rules, voice, tone, Do's & Don'ts) and export as multi-page PDF.
5. **2D & 3D Mockup Studio** — Preview logos on apparel, merchandise, stationery, and outdoor billboards with real-time canvas controls and interactive Three.js 3D viewers.
6. **My Logos Asset Hub** — Manage, inspect, and download all generated variants and lockups backed by persistent cloud storage.

---

## 🚀 Key Features

### 🤖 Conversational Logo Agent
- **Guided Chat Workflow:** Describe your business vision naturally; the agent extracts tone, audience, and industry context.
- **Smart Prompt Engineering:** Automatically synthesizes detailed image generation prompts to deliver sharp, modern logos.
- **Multi-Variant Generation:** Generates multiple distinct visual concepts per prompt for side-by-side comparison.
- **Resilient AI Pipeline:** Built with automated fallback across Groq, Google Gemini, OpenRouter, and OpenAI.

### ✏️ Logo Typography Studio
- **Client-Side Background Removal:** Chroma-key and crop logo whitespace directly in-browser on an HTML5 Canvas.
- **Layout Formats:** Choose between **Stacked (Vertical)** and **Inline (Horizontal)** lockup formats.
- **Dynamic Google Fonts:** Switch typography styles on the fly (Clean & Minimal Inter, Modern Montserrat, Elegant Playfair Display, Tech & Bold Outfit, etc.).
- **Precise Controls:** Fine-tune brand name font size, tagline font size, colors, and gap spacing.
- **High-Res Export & Save:** Download transparent PNGs and save lockups directly to your permanent logo gallery and chat session.

### 📋 Comprehensive AI Brand Guidelines
- **Automated Style Guides:** Generate color palettes (primary, secondary, accent with HEX codes), typography hierarchy, brand mission, and target persona.
- **Brand Voice & Governance:** Clarifies tone of voice, sample taglines, and practical "Do's & Don'ts" for logo usage.
- **Multi-Page PDF Export:** Download clean, publication-quality Brand Guideline PDF documents powered by `jsPDF`.

### 👕 2D & 3D Product Mockup Studio
- **Multi-Product Catalog:** Real-world mockups for T-Shirts, Hoodies, Coffee Mugs, Tote Bags, Caps, Phone Cases, Business Cards, and Billboards.
- **Interactive Canvas Controls:** Drag, scale, rotate, adjust opacity, and choose blend modes directly on the product.
- **Interactive 3D Viewers:** Inspect branded merchandise in real-time 3D rendered with Three.js and `@react-three/fiber`.
- **Batch Export:** Download individual mockups or export entire branding packs as a ZIP archive.

### 🪙 Credits & Account Management
- **Firebase Authentication:** Secure email/password and Google OAuth sign-in.
- **Guest Sessions:** Seamless guest trial with automated context handoff upon registration.
- **Credit Economy:** Credit balance tracking for AI generation requests.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI[Tailwind CSS & Framer Motion UI]
        Canvas[HTML5 Canvas Typography Engine]
        ThreeJS[Three.js / React Three Fiber 3D Mockups]
    end

    subgraph API ["Backend API (Node.js + Express 5)"]
        Server[Express Server & Route Guards]
        AuthMW[Firebase Admin Auth Middleware]
        LogoCtrl[Logo & Lockup Controllers]
        AgentCtrl[Conversational Logo Agent Controller]
        CreditCtrl[Credit & Usage Controller]
    end

    subgraph External ["Cloud Services & AI Providers"]
        DB[(Supabase PostgreSQL)]
        Firebase[Firebase Authentication]
        ImgBB[ImgBB Image Hosting]
        LLM[Groq / Gemini / OpenRouter / OpenAI]
        ImageAI[Replicate Flux LoRA / SD]
        PyService[Optional Python FastAPI Engine]
    end

    UI --> Server
    Server --> AuthMW --> Firebase
    Server --> DB
    LogoCtrl --> ImgBB
    LogoCtrl --> ImageAI
    AgentCtrl --> LLM
    Canvas -. base64 png .-> LogoCtrl
    Server -. optional compositing .-> PyService
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion, React Router v7 |
| **Graphics & 3D** | Three.js, `@react-three/fiber`, `@react-three/drei`, HTML5 Canvas API |
| **Document Generation** | `jsPDF`, `html2canvas`, `jszip`, `file-saver` |
| **Backend** | Node.js, Express 5, `postgres` (Supabase driver), Helmet, CORS, Morgan |
| **Authentication** | Firebase Authentication & Firebase Admin SDK |
| **Database** | PostgreSQL (hosted on Supabase) |
| **AI Text / LLM** | Groq (`gpt-oss-120b` / Llama), Google Gemini (`2.5-flash`), OpenRouter, OpenAI |
| **AI Image Models** | Replicate (Custom-trained Flux LoRA), Stable Diffusion |
| **Image Hosting** | ImgBB API |
| **Optional Microservice** | Python 3.10+, FastAPI, Pillow (PIL), Uvicorn |

---

## 📁 Project Directory Layout

```text
brandybot/
├── backend/
│   ├── config/             # Database connection and Firebase Admin setup
│   ├── controllers/        # Route controllers (logo, agent, chat, brand, credits)
│   ├── middleware/         # Auth verification, rate limiting, error handling
│   ├── routes/             # Express API route declarations
│   ├── services/           # LLM multi-provider fallback and AI integrations
│   ├── server.js           # Express API server entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets and showcase media
│   ├── src/
│   │   ├── components/     # Modals (Typography Studio, Mockups, Guidelines, Lightbox)
│   │   ├── context/        # Auth, Theme, and Logo React contexts
│   │   ├── layouts/        # Dashboard and public page layouts
│   │   ├── pages/          # Home, LogoAgent, LogoHistory, BrandGuidelines, Mockups
│   │   ├── services/       # Axios API client and service endpoints
│   │   ├── App.jsx         # Routes configuration
│   │   └── main.jsx        # React root entry
│   └── package.json
│
├── ai-service/             # Optional Python FastAPI service for PIL compositing
│   ├── lockup_engine.py    # Pillow-based typography lockup engine
│   ├── main.py             # FastAPI endpoints
│   └── requirements.txt
│
└── docs/                   # System reports, architecture notes, and API specs
```

---

## ⚡ Installation & Local Setup

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later
- A **PostgreSQL** database (e.g. [Supabase](https://supabase.com))
- A **Firebase** project for Authentication
- At least one LLM API key (**Groq** or **Gemini**) and **Replicate** API token for logo generation

---

### 1. Configure and Run Backend

```bash
cd backend
npm install
```

Create `backend/.env` (refer to `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Providers (at least one LLM + Replicate)
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=your_gemini_key
REPLICATE_API_TOKEN=r8_your_replicate_token
IMGBB_API_KEY=your_imgbb_key
```

Start the backend server:

```bash
npm run dev   # Starts with nodemon on port 5000
# or
npm start     # Starts standard node server
```

Verify backend health at `http://localhost:5000/health`.

---

### 2. Configure and Run Frontend

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

### 3. (Optional) Run Python AI Microservice

```bash
cd ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

The service runs on `http://localhost:8000`.

---

## 🧪 Testing and Build Verification

```bash
# Frontend production build check
cd frontend
npm run build

# Backend testing
cd backend
npm test
```

---

## 🛡️ Security & Best Practices

- **Zero Secret Leaks:** API keys, Firebase service account keys, and database connection strings are never committed to version control.
- **Client Sanitization:** Uploaded canvas previews and strings are sanitized and validated against SQL injection via parameterized queries.
- **Rate Limiting:** Express API endpoints use strict rate limiters to protect AI services and server resources.

---

## 👩‍💻 Author & Credits

Developed with ❤️ by **Tharushi Nimnadi** for modern entrepreneurs and creators.
