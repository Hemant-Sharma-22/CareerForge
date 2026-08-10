# 🚀 CareerForge Platform — Render.com Deployment Guide

This guide walks you through deploying **CareerForge** (Full-Stack React + Node.js Express + Prisma) on **Render.com** (100% free tier supported).

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub / GitLab
Make sure your latest code is committed and pushed to a repository on GitHub or GitLab:
```bash
git add .
git commit -m "Configure Render deployment"
git push origin main
```

---

### Step 2: Create a New Web Service on Render
1. Open [**dashboard.render.com**](https://dashboard.render.com/) and sign in.
2. Click **New +** (top right) → Select **Web Service**.
3. Select **Build and deploy from a Git repository** → Click **Next**.
4. Connect your GitHub/GitLab repository (`ATS resume Analyser`).

---

### Step 3: Configure Web Service Details

Render will auto-detect settings from `render.yaml`, or you can enter them manually:

| Setting Field | Configuration Value |
| :--- | :--- |
| **Name** | `careerforge-platform` |
| **Region** | Singapore / Oregon / Frankfurt (Choose closest) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

---

### Step 4: Set Environment Variables on Render
Under **Environment Variables** in the Render Dashboard, add the following key-value pairs:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables static bundle serving |
| `JWT_SECRET` | `careerforge_super_secret_jwt_key_2026` | Custom JWT secret key |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration |
| `GROQ_API_KEY` | `xai-HU4lp00xcvnWaFey...` | Your Groq / xAI API key |
| `DATABASE_URL` | *Your PostgreSQL URL (or leave blank for in-memory fallback)* | Render PostgreSQL or Neon / Supabase URL |
| `VITE_GOOGLE_CLIENT_ID` | `669722402174-a8kt...apps.googleusercontent.com` | Google OAuth Client ID |
| `FAST2SMS_API_KEY` | `loGHi2RXTQj8OFN7Z0...` | Fast2SMS API key |

---

### Step 5: Click "Create Web Service"
- Click **Create Web Service**.
- Render will install dependencies, build the React frontend bundle (`client/dist`), generate Prisma schema, and launch the Node.js server.
- Your app will be live at `https://careerforge-platform.onrender.com`! 🎉
