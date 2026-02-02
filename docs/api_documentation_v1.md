# BrandyBot API Documentation (Phase 4)

> **Base URL:** `/api`
> **Authentication:** Requires `Authorization: Bearer <firebase-id-token>` header for all endpoints.

---

## 🎨 1. Logo Generation (`/api/logos`)

| Method | Endpoint | Description | Request Body | Success Response |
|:---:|:---|:---|:---|:---|
| **POST** | `/generate` | Generate a new logo | `{ brandName, prompt, style, industry, colors }` | `{ success: true, data: { logoUrl, ... } }` |
| **GET** | `/history` | Get user's logo history | N/A | `{ success: true, count, data: [ ... ] }` |
| **GET** | `/:id` | Get specific logo details | N/A | `{ success: true, data: { ... } }` |
| **POST** | `/:id/rate` | Rate a generated logo | `{ rating: 1-5 }` | `{ success: true, data: { ... } }` |

---

## 🏢 2. Brand Guidelines (`/api/brands`)

| Method | Endpoint | Description | Request Body | Success Response |
|:---:|:---|:---|:---|:---|
| **POST** | `/` | Create a new brand | `{ brandName, tagline, description, industry, logo, guidelines }` | `{ success: true, data: { brand } }` |
| **GET** | `/` | Get all user brands | `?status=active` (Optional) | `{ success: true, count, data: [ ... ] }` |
| **GET** | `/:id` | Get brand details | N/A | `{ success: true, data: { ... } }` |
| **PUT** | `/:id` | Update brand details | `{ brandName, ...any_field }` | `{ success: true, data: { ... } }` |
| **DELETE** | `/:id` | Delete a brand | N/A | `{ success: true, data: {} }` |
| **POST** | `/:id/share` | Generate public link | N/A | `{ success: true, data: { shareLink } }` |
| **GET** | `/public/:shareLink` | Get shared brand | N/A | `{ success: true, data: { ... } }` |

---

## 👕 3. Mockup Generation (`/api/mockups`)

| Method | Endpoint | Description | Request Body | Success Response |
|:---:|:---|:---|:---|:---|
| **POST** | `/generate` | Generate a mockup | `{ logoUrl, type }` | `{ success: true, data: { mockupUrl } }` |
| **GET** | `/templates` | Get available templates | N/A | `{ success: true, data: [ ... ] }` |

---

## 🤖 4. Chatbot (`/api/chat`)

| Method | Endpoint | Description | Request Body | Success Response |
|:---:|:---|:---|:---|:---|
| **POST** | `/message` | Send message to AI | `{ message, context }` | `{ success: true, data: { message: "AI reply" } }` |

---

## 👤 5. User Profile (`/api/users`) & Auth

| Method | Endpoint | Description | Request Body | Success Response |
|:---:|:---|:---|:---|:---|
| **POST** | `/auth/sync` | Sync Firebase User | `{ displayName, photoURL }` | `{ success: true, data: { user } }` |
| **GET** | `/auth/me` | Get Current User | N/A | `{ success: true, data: { user } }` |
| **GET** | `/users/profile` | Get Profile Details | N/A | `{ success: true, data: { user } }` |
| **PUT** | `/users/profile` | Update Profile | `{ displayName, preferences }` | `{ success: true, data: { user } }` |
| **DELETE**| `/users/account` | Delete Account | N/A | `{ success: true, message }` |
