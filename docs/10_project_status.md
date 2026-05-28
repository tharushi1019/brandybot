# 🤖 BrandyBot — Project Status Report

> **Scan Date:** 2026-05-28 | **Full codebase scan across frontend, backend, ai-service**

---

## ✅ What We Built

### Frontend (`/frontend` — React + Vite + Tailwind CSS)

| Area | Status |
|------|--------|
| **Home Page** | ✅ Landing page with hero, features, demo chatbot |
| **Auth Pages** | ✅ Login + Signup via Firebase Auth |
| **Dashboard** | ✅ Stats overview (logos, credits, brands) |
| **Logo Agent** | ✅ Full conversational AI chat UI with sidebar, session history, lightbox |
| **Logo Generator** | ✅ Direct logo generation form |
| **Logo History** | ✅ Gallery of past generated logos |
| **Brand Guidelines** | ✅ AI-generated brand guidelines viewer |
| **Mockup Generator** | ✅ 2D canvas mockup + 3D Three.js viewer |
| **Profile & Settings** | ✅ User profile management |
| **Purchase Page** | ✅ Credit purchase UI |
| **Context System** | ✅ AuthContext, ThemeContext, LogoContext |
| **Protected Routes** | ✅ Firebase-token-based route protection |
| **Dark/Light Theme** | ✅ Full theme toggling |

### Backend (`/backend` — Node.js + Express + PostgreSQL via Supabase)

| Area | Status |
|------|--------|
| **Server Setup** | ✅ Express + Helmet + CORS + Morgan |
| **Auth Middleware** | ✅ Firebase ID token verification + auto user upsert |
| **Rate Limiting** | ✅ General (500/15min) + Generation (20/15min) limiters |
| **Logo Routes** | ✅ CRUD + ImgBB upload |
| **Logo Agent** | ✅ Conversational multi-turn agent with session management |
| **Brand Routes** | ✅ CRUD + AI guidelines generation |
| **Mockup Routes** | ✅ Gemini-based mockup generation + DB caching |
| **Chat Routes** | ✅ Session-based chat history |
| **Credits System** | ✅ Credit deduction + balance check |
| **User Routes** | ✅ Profile management |
| **Env Validation** | ✅ Required var checks per environment |
| **Error Handling** | ✅ Centralized AppError + catchAsync |
| **Startup Diagnostics** | ✅ Replicate + LLM service checks on boot |

### AI Service (`/ai-service` — Python + FastAPI)

| Area | Status |
|------|--------|
| **Logo Generation** | ✅ Pollinations.ai integration |
| **Mockup Engine** | ✅ Pillow compositing (Business Card, T-Shirt, Mug, Website Hero, Social Banner) |
| **Background Removal** | ✅ rembg integration (optional) |
| **FastAPI Router** | ✅ `/generate/logo`, `/generate/mockup`, `/generate/chat` (stub) |

### Primary AI Stack (via Node backend)

| Service | Status |
|---------|--------|
| **Replicate (Flux LoRA)** | ✅ Custom trained `tharushi1019/brandibot-model` |
| **Gemini Fallback** | ✅ Logo + mockup generation fallback |
| **OpenAI** | ✅ LLM fallback |
| **Groq** | ✅ LLM fallback |
| **OpenRouter** | ✅ LLM fallback |

---

## 🐛 Bugs & Mistakes Found

### 🔴 Critical Bugs

#### BUG-01: Secret Keys Committed to `.env` in Git
- **File:** `backend/.env`, `frontend/.env`
- **Issue:** Real API keys (Replicate, Firebase private key, OpenAI, ImgBB, GEMINI, etc.) are hardcoded in `.env` files. The `.gitignore` may not be catching these.
- **Risk:** Credential exposure, account compromise
- **Fix:** Immediately rotate all keys; ensure `.gitignore` excludes both `/frontend/.env` and `/backend/.env`

#### BUG-02: `useTexture` Hook Called Conditionally in MockupModels.jsx
- **File:** `frontend/src/components/MockupModels.jsx` — Lines 12, 53, 100
- **Issue:** `const logoTexture = logoUrl ? useTexture(logoUrl) : null;` — React hooks **cannot be called conditionally**. This violates the Rules of Hooks and will cause crashes.
- **Fix:** Always call `useTexture(logoUrl || '')` and handle null/empty URL inside the component body or use a texture guard.

#### BUG-03: T-Shirt `paste_logo` Call in Python with Wrong Tuple Format
- **File:** `ai-service/mockup_engine.py` — Line 159-160
- **Issue:** `chest_box = (280, 280, 240, 240)` is assigned but never used. `paste_logo(shirt, logo, (280, 280, 240, 240))` is called with `(x, y, w, h)` but the function signature uses `(bx, by, bw, bh)` where `bw`/`bh` of 240 means the logo box starts at x=280, y=280 but has **width=240, height=240**. This is valid, but `chest_box` variable on line 159 is dead code (unused assignment).
- **Fix:** Remove dead code `chest_box = (280, 280, 240, 240)` on line 159.

#### BUG-04: `itemsCenter` Invalid CSS Property in LogoAgent.jsx  
- **File:** `frontend/src/pages/LogoAgent.jsx` — Lines 115, 135  
- **Issue:** `itemsCenter:'center'` is used in inline style — this is not a valid CSS property. Should be `alignItems: 'center'`.
- **Fix:** Change `itemsCenter:'center'` → `alignItems: 'center'` in both arrow button styles.

#### BUG-05: Guest Logo Generation — Missing Actual Image Generation
- **File:** `backend/controllers/logoAgentController.js` — Lines 295–319
- **Issue:** `sendGuestMessage` creates a `logo_history` row with `status='processing'` and marks the guest session as used, but **never actually generates the logo**. The function returns early without calling `generateLogoVariants()`.
- **Fix:** Add the actual logo generation call (or remove the misleading `logo_history` insert).

#### BUG-06: Mockup Controller — `logoId` Variable Declared Twice  
- **File:** `backend/controllers/mockupController.js` — Lines 51 and 86
- **Issue:** `let logoId = req.body.logoId;` is declared inside the `if (logoUrl)` block at line 51, and then declared again with `let logoId = req.body.logoId;` at line 86 (outside the block). This causes a redeclaration in the outer scope which shadows the inner-scope logic. The second DB lookup (line 88) re-runs a query already done at lines 52–55.
- **Fix:** Extract `logoId` resolution into a single reusable helper function called once.

---

### 🟡 Medium Bugs

#### BUG-07: LogoAgent.jsx Uses Raw `axios` Instead of Configured `api` Instance
- **File:** `frontend/src/pages/LogoAgent.jsx` — Line 6, Lines 344–362
- **Issue:** Imports raw `axios` and constructs the base URL manually with `const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`. Meanwhile the shared `api.js` already handles auth token injection automatically.
- **Fix:** Replace all `axios.get/post/delete` calls with the shared `api` instance from `services/api.js` to avoid duplicated auth header logic.

#### BUG-08: MockUpGenerator — Auth Token from localStorage (Deprecated Pattern)
- **File:** `frontend/src/pages/MockUpGenerator.jsx` — Line 222
- **Issue:** `headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }` — The project uses Firebase Auth tokens which are fetched dynamically (they expire). Fetching from localStorage is unreliable and may use a stale token.
- **Fix:** Use the shared `api` instance which calls `user.getIdToken()` dynamically on every request.

#### BUG-09: `formData` Used Without Import in `utilController.js`
- **File:** `backend/controllers/utilController.js` — Line 4
- **Issue:** `const FormData = require('form-data');` is imported but `form-data` package is **not in `backend/package.json`** dependencies. This will cause a runtime crash when `removeBackground` is called.
- **Fix:** Add `"form-data": "^4.0.0"` to `backend/package.json` dependencies.

#### BUG-10: Hardcoded Localhost URLs in Helmet CSP
- **File:** `backend/middleware/security.js` — Lines 48–49
- **Issue:** `connectSrc` and `imgSrc` hardcode `http://localhost:5000`. In production (Vercel), these should point to the actual backend URL.
- **Fix:** Make CSP `connectSrc` dynamically read from `FRONTEND_URL` and `BACKEND_URL` env vars.

#### BUG-11: `PerspectiveCamera` Conflict in ThreeDViewer.jsx
- **File:** `frontend/src/components/ThreeDViewer.jsx` — Lines 35, 51
- **Issue:** `<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>` sets a default camera, AND `<PerspectiveCamera makeDefault position={[0, 0, 8]} />` inside Canvas tries to set another default camera. These conflict — the Drei `PerspectiveCamera` with `makeDefault` overrides the Canvas camera but has a different position.
- **Fix:** Remove the `camera` prop from `<Canvas>` since `<PerspectiveCamera makeDefault>` handles it.

#### BUG-12: Auto-title truncates at 60 chars but message is saved first
- **File:** `backend/controllers/logoAgentController.js` — Lines 44–48
- **Issue:** The auto-title logic counts messages AFTER inserting the user's message. On the FIRST message, count = 1, so the title is set. However, if the user sends multiple messages quickly, there's a race condition since count is not atomic.
- **Fix:** Use `RETURNING *` and check row count, or use a DB trigger for title setting.

---

### 🟢 Minor Issues

| ID | File | Issue |
|----|------|-------|
| MINOR-01 | `backend/.env.example` | Missing `REPLICATE_API_TOKEN`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `POLLINATIONS_API_KEY` entries |
| MINOR-02 | `ai-service/api.py` | `AI_SERVICE_URL` env var duplicated — defined in both `api.py` and `mockup_engine.py`'s `STATIC_DIR` |
| MINOR-03 | `frontend/src/App.jsx` | Route `/logo_generator` is never declared (LogoGenerator.jsx page exists but has no route) |
| MINOR-04 | `backend/controllers/logoAgentController.js` | TODO comment on line 302: "adjust schema to allow null user_id for logo_history if needed" — never actioned |
| MINOR-05 | `frontend/src/components/MockupModels.jsx` | Font URL in BusinessCard `Text` component points to an old Roboto Slab CDN path that may 404 |
| MINOR-06 | `backend/server.js` | `morgan('dev')` should use `morgan('combined')` or be disabled in production |
| MINOR-07 | `backend/services/aiService.js` | `const axios = require('axios')` is imported twice (line 1 top-level, line 266 inside function) |

---

## ❌ What We Are Missing

### High Priority Missing Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Production `.env` Setup** | No `frontend/.env.production` or `backend/.env.production` files. Frontend hardcodes localhost for API URL. CORS only allows localhost origins. |
| 2 | **Netlify Config** | No `netlify.toml` or `_redirects` file — React Router SPA will break on refresh (404 on non-root paths) |
| 3 | **Vercel Config** | No `vercel.json` for backend — deployment will use default settings, which may fail for Express |
| 4 | **2D Mockup — Gemini Dependency** | The `generateMockupAI()` function in `aiService.js` 100% depends on Gemini for AI-powered mockups. No alternative when Gemini credits run out |
| 5 | **3D Mockup Improvements** | 3D viewer has only 3 models (Mug, Business Card, T-Shirt). Missing: Instagram Frame, Notebook, Billboard, Bottle, Hoodie |
| 6 | **Logo Generator Page Route** | `LogoGenerator.jsx` exists but has no route in `App.jsx` |
| 7 | **Guest Logo Generation** | `sendGuestMessage` creates DB rows but never actually generates logos |
| 8 | **Error Boundaries** | No React error boundary wrapping the 3D canvas or any page |
| 9 | **Loading States** | No global loading indicator or skeleton loaders on most pages |
| 10 | **form-data package** | `utilController.js` imports `form-data` but package is not in `backend/package.json` |

### Medium Priority Missing

| # | Feature | Description |
|---|---------|-------------|
| 11 | **Email Verification Flow** | Firebase users can sign in without verifying email |
| 12 | **Password Reset Page** | No forgot-password UI exists |
| 13 | **Responsive Mobile UI** | Dashboard layout not fully mobile-optimized |
| 14 | **AI Service Health Check** | Backend has no endpoint to test if Python ai-service is reachable |
| 15 | **Notification System** | No toast/notification for async operations like logo generation completing |
| 16 | **Logo Download as SVG** | Only PNG download supported |
| 17 | **Tests Coverage** | Test files exist (`test_ai.js`, `test_replicate.js`) but Jest test suite is minimal |
| 18 | **Pagination** | Logo history and chat sessions have no pagination |
| 19 | **Brand Export** | Cannot export full brand kit as a ZIP (only individual mockups) |

---

## 📋 What We Need To Do Next

### 🚀 Priority 1: Production Deployment (Netlify + Vercel)

- [ ] Create `frontend/.env.production` with Netlify backend URL
- [ ] Create `backend/.env.production` with Vercel frontend URL  
- [ ] Add `netlify.toml` with SPA redirect rules and build config
- [ ] Add `vercel.json` for Express backend routing
- [ ] Update CORS `allowedOrigins` to include production Netlify URL
- [ ] Update Helmet CSP `connectSrc` dynamically from env
- [ ] Remove hardcoded localhost from `security.js`

### 🎨 Priority 2: Fix 2D Mockup (No Gemini)

- [ ] Replace `generateMockupAI()` Gemini dependency with **Pillow-based Python engine** (already built in `ai-service/mockup_engine.py` — wire it up!)
- [ ] Connect backend's `mockupController.js` to call the Python FastAPI service instead of Gemini
- [ ] Add HuggingFace or Pollinations.ai as alternative image generation for mockup scenes
- [ ] Improve canvas-based 2D mockups in `MockUpGenerator.jsx` (better templates)

### 🧊 Priority 3: Improve 3D Mockups

- [ ] Add new 3D models: Hoodie, Notebook/Journal, Billboard, Water Bottle, Phone Case, Tote Bag
- [ ] Fix the conditional hook call bug in `MockupModels.jsx`
- [ ] Fix the camera conflict in `ThreeDViewer.jsx`
- [ ] Add texture quality improvements (anisotropy filtering)
- [ ] Add screenshot/download of 3D scene
- [ ] Add 360° rotation animation toggle

### 🔧 Priority 4: Bug Fixes

- [ ] Fix `form-data` missing package (add to `backend/package.json`)
- [ ] Fix conditional `useTexture` hook calls in `MockupModels.jsx`
- [ ] Fix `itemsCenter` → `alignItems` in `LogoAgent.jsx`
- [ ] Fix `PerspectiveCamera` conflict in `ThreeDViewer.jsx`
- [ ] Remove dead code in `mockup_engine.py` line 159
- [ ] Fix guest logo generation to actually generate logos
- [ ] Refactor `mockupController.js` `logoId` double-declaration
- [ ] Replace raw `axios` with shared `api` instance in `LogoAgent.jsx`
- [ ] Replace `localStorage.getItem("token")` with dynamic token in `MockUpGenerator.jsx`
- [ ] Add missing route for `LogoGenerator.jsx` in `App.jsx`

### 🔒 Priority 5: Security & Quality

- [ ] Rotate all compromised API keys from `.env`
- [ ] Add `.env` to root `.gitignore`
- [ ] Add `morgan('combined')` for production logging or disable
- [ ] Add React Error Boundaries around 3D canvas
- [ ] Add email verification enforcement
- [ ] Add forgot-password page

