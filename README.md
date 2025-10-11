# 🎓 Comprehensive Student Consultation Platform

A full-stack **MERN + TypeScript** application designed to streamline and manage student consultation processes efficiently. This platform provides features for scheduling, managing, and tracking consultations between students and faculty members.

---

## 🚀 Tech Stack

### 🖥️ Client (Frontend)

- **Vite + React + TypeScript** — modern, fast, and strongly typed frontend setup
- **React Router DOM** — for page routing
- **React Query** — for data fetching and caching
- **Tailwind CSS** — for utility-first styling
- **Lucide React** — for icons
- **Class Variance Authority + clsx + tailwind-merge** — for component styling and class management
- **Shadcn** — for UI components library

### ⚙️ Server (Backend)

- **Node.js + Express + TypeScript** — scalable backend architecture
- **MongoDB + Mongoose** — NoSQL database and ORM
- **Zod** — for schema validation
- **JWT (jsonwebtoken)** — for authentication
- **bcryptjs** — for password hashing
- **Helmet + CORS + Cookie Parser** — for security and middleware management
- **Rate Limiter Flexible** — for request limiting
- **dotenv** — for environment configuration

---

## ⚙️ Project Setup Guide

This section will help you set up the project locally for development.

### 🧩 Prerequisites

Make sure you have these installed:

- **Node.js**
- **npm** or **yarn**
- **MongoDB**

---

## 🗂️ Folder Structure

```
comprehensive-student-consultation-platform/
├── client/              # Frontend (Vite + React + TS)
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
├── server/              # Backend (Node + Express + TS)
│   ├── src/
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## ⚡ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-org-or-username>/student-consultation-platform.git
cd student-consultation-platform
```

---

### 2️⃣ Setup and Run the Server

open the project directory in terminal

```bash
cd server
npm install
```

#### Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/ipt2_cscp
JWT_REFRESH_SECRET_KEY=
JWT_SECRET_KEY=
BCRYPT_SALT=
FRONTEND_URL=http://localhost:5173
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
ACCESS_TOKEN_COOKIE_NAME=
REFRESH_TOKEN_COOKIE_NAME=
```

#### Run in development mode:

```bash
npm run dev
```

This will start the backend on your configured `PORT` (default: 5000).

---

### 3️⃣ Setup and Run the Client

open the project directory in another terminal

```bash
cd ../client
npm install
```

<!-- #### Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
``` -->

#### Run in development mode:

```bash
npm run dev
```

The client will start on **[http://localhost:5173](http://localhost:5173)** by default.

---

## Development Workflow

- **Frontend** and **Backend** run independently.
- Make sure both are running for full functionality.
- API calls from the client are proxied or use the `VITE_API_URL` variable.

---
