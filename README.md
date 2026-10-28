# Monumental Energy Corp. (TSX-V: MNRG) - Backend & CMS API

Unified backend service and interactive CMS portal for **Monumental Energy Corp.**, built with Node.js, Express, MongoDB Atlas, and Tailwind CSS.

---

## 🏛️ System Architecture

Follows a layered repository architecture:
```text
HTTP Routes (src/routes/v1/)
       │
       ▼
Middlewares (src/middlewares/ — auth, errors, role guards)
       │
       ▼
Controllers (src/controllers/ — HTTP status, req/res handling)
       │
       ▼
Services (src/services/ — business logic, data formatting)
       │
       ▼
Repositories (src/repository/ — MongoDB queries & persistence)
       │
       ▼
Database Models (src/models/ — Mongoose schemas)
```

---

## 🚀 Features

* **Interactive CMS Portal (`/admin` or `/`):**
  * Real-time KPI Dashboard (Inquiries, Subscribers, Projects, Filings).
  * **Investor Inquiries Management:** Review contact leads, update statuses (`New`, `Contacted`, `In Progress`, `Resolved`, `Closed`), and add internal notes.
  * **News Alerts Subscribers:** Review subscriber list, toggle status, and export to CSV.
  * **Energy Projects Manager:** Full CRUD for assets (Taranaki Basin, Salar de Turi, etc.).
  * **TSX-V Press Releases & News:** Publish and manage corporate and regulatory filings.
  * **One-Click Sample Data Seeder:** Populate demo assets and leads instantly.
* **Backend REST API:**
  * Inquiries & Contact Forms (`/api/contact`, `/api/v1/enquiries`)
  * Newsletter Subscriptions (`/api/newsletter`, `/api/subscribe`, `/api/v1/subscribers`)
  * Energy Projects & Highlights (`/api/v1/projects`)
  * Press Releases & Filings (`/api/v1/news`)
  * System Health (`/api/health`)
  * Admin Authentication & Profile (`/api/v1/auth`)

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (ES Modules `"type": "module"`)
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose) with resilient connection fallback
* **Security & Auth:** JWT (`jsonwebtoken`), `bcryptjs`, CORS
* **UI & Styling:** Tailwind CSS CDN, Lucide Icons, Space Grotesk & Inter typography

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your connection string:
```bash
cp .env.example .env
```

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/monumental?retryWrites=true&w=majority
JWT_SECRET=monumental_energy_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3. Start Development Server
```bash
npm run dev
```

* **CMS Portal:** [http://localhost:5001/](http://localhost:5001/)
* **API Base:** [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
* **Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

