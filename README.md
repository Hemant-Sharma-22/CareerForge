# 🚀 CareerForge — AI Career & ATS Platform

> **Don't just check your resume. Improve it, optimize it for the job, discover matching opportunities, and manage your applications — all from one intelligent platform.**

---

## 🌟 Visual Project Screenshots

### 1. Executive Career Dashboard
![CareerForge Executive Dashboard](file:///C:/Users/91724/.gemini/antigravity/brain/52200230-37bc-4163-bb01-2ffcd3c2647c/dashboard_preview_1786282435258.jpg)

### 2. Explainable ATS Scoring & Skill Gap Detector
![ATS Scoring & Skill Gap Analysis](file:///C:/Users/91724/.gemini/antigravity/brain/52200230-37bc-4163-bb01-2ffcd3c2647c/ats_analysis_preview_1786282450683.jpg)

### 3. Multi-Source Job Discovery Engine
![Multi Source Job Discovery](file:///C:/Users/91724/.gemini/antigravity/brain/52200230-37bc-4163-bb01-2ffcd3c2647c/job_discovery_preview_1786282465811.jpg)

---

## 🔄 End-to-End Career Workflow

```text
RESUME UPLOAD (PDF/DOCX)
   ↓
PARSING & SECTION SEGMENTATION
   ↓
EXPLAINABLE ATS RULE SCORING (6-Tier Weights)
   ↓
SKILL GAP & KEYWORD DETECTION
   ↓
GROQ AI BULLET OPTIMIZATION & RESUME GENERATION
   ↓
MULTI-SOURCE JOB AGGREGATION & MATCH SCORING
   ↓
DIRECT AUTHENTIC APPLICATION
   ↓
KANBAN APPLICATION FUNNEL TRACKING
   ↓
ANALYTICS & SCORE PROGRESS TRENDS
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS + Modern Glassmorphism System
- **Routing**: React Router DOM v6
- **Icons & Data Viz**: Lucide React + Recharts
- **Context API**: AuthContext for JWT authentication & profile state

### Backend
- **Runtime**: Node.js + Express.js
- **Database ORM**: Prisma ORM (PostgreSQL with SQLite fallback)
- **AI Intelligence**: Groq API (`llama-3.3-70b-versatile`)
- **File Uploads**: Multer + `pdf-parse` + `mammoth` (PDF/DOCX parsing)
- **Security**: JWT Authentication + `bcryptjs` password hashing
- **API Documentation**: OpenAPI / Swagger UI (`/api-docs`)

---

## 📊 Explainable ATS Scoring Math

CareerForge uses a 100% explainable, rule-based ATS evaluation formula:

$$\text{Final ATS Score} = (0.35 \times \text{Skill}) + (0.25 \times \text{Keyword}) + (0.15 \times \text{Experience}) + (0.10 \times \text{Education}) + (0.10 \times \text{Completeness}) + (0.05 \times \text{Formatting})$$

| Component | Weight | Description |
| :--- | :---: | :--- |
| **Skill Match** | 35% | Direct match ratio between candidate skills and JD required/preferred skills |
| **Keyword Match** | 25% | Presence of target terminology and action keywords in resume body |
| **Experience Match** | 15% | Required experience years vs candidate tenure in roles |
| **Education Match** | 10% | Presence of required degree qualifications (B.Tech, B.S., M.S.) |
| **Completeness** | 10% | Completeness of Summary, Experience, Skills, Education, Projects sections |
| **Formatting** | 5% | Structural length, section headers, and text clarity |

---

## ⚡ Quick Start Guide

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerforge?schema=public"
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=gsk_your_groq_api_key
```

### 2. Install Dependencies & Database Setup

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install

# Run Prisma Database Generation
npm run prisma:generate
```

### 3. Running Development Servers

```bash
# Start Backend Express API (Port 5000)
npm run dev:server

# Start Frontend React Client (Port 3000)
npm run dev:client
```

Visit the application in your browser at `http://localhost:3000`.

---

## 📖 API Documentation (Swagger)

All REST endpoints are documented with OpenAPI / Swagger UI:
Access at: `http://localhost:5000/api-docs`

---

## 🧪 Running Tests

To run the automated ATS scoring engine unit tests:

```bash
npm test
```

---

## 🔒 Ethical & Privacy Standards

- **No Fake Data**: CareerForge never fabricates skills, experience, companies, or credentials that the candidate does not have.
- **Direct Employer Apply**: Application links direct candidates to official, authentic employer application pages.
- **Explainable Metrics**: Scores are transparently calculated without hidden black-box randomness.
