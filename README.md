# CivicTrack — Smart Civic Complaint Management System with AI Assistant

Full-stack civic complaint portal: citizens raise complaints (with photo), track status through a visual
timeline, and admins manage everything from a dashboard with charts and an AI assistant powered by **Ollama**.

- **Backend:** Java 21, Spring Boot 3, Spring Security + JWT, Spring Data JPA, PostgreSQL, Swagger, Maven
- **Frontend:** React (Vite), Tailwind CSS, Recharts, Axios, React Router — modern civic-tech UI
- **AI:** Ollama (llama3) — rewrite complaints, predict category, detect priority, chat assistant, admin summary, spam detection
- **DevOps:** Docker + Docker Compose (Postgres, pgAdmin, Ollama, backend, frontend all containerized)

---

## 1. What you need installed (for local, non-Docker setup)

| Tool | Version | Check with |
|---|---|---|
| Java JDK | 21 | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| PostgreSQL | 16 | `psql --version` |
| Ollama | latest | `ollama -v` |

For the **Docker-only** route, you only need:
- **Docker Desktop** (includes Docker Compose) — that's it. Everything else runs inside containers.

---

## 2. Project structure

```
complaint-system/
├── backend/            → Spring Boot API (Java 21)
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/            → React + Vite + Tailwind
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml   → orchestrates postgres, pgadmin, ollama, backend, frontend
├── .env.example         → copy to .env and adjust if needed
└── README.md
```

---

## 3. Option A — Run everything with Docker (recommended, easiest)

This spins up Postgres, pgAdmin, Ollama, the Spring Boot backend, and the React frontend — all networked together.

### Step 1: Copy the env file
```bash
cd complaint-system
cp .env.example .env
```
Open `.env` and change `JWT_SECRET`, `POSTGRES_PASSWORD`, and `PGADMIN_DEFAULT_PASSWORD` to your own values (optional for local testing, required before any real deployment).

### Step 2: Build and start all containers
```bash
docker compose up --build
```
First run will take a few minutes (Maven downloads dependencies, npm installs packages, Ollama image downloads).

### Step 3: Pull the AI model into the Ollama container
In a **new terminal**, once containers are up:
```bash
docker exec -it civic_ollama ollama pull llama3
```
This downloads the model (a few GB) **once**. Without this step, AI features silently fall back to simple rule-based logic (the app still works, just without real AI text generation) — nothing breaks either way, but for the full AI experience run this command.

> Want a smaller/faster model? Use `ollama pull mistral` and set `OLLAMA_MODEL=mistral` in `.env`, then `docker compose up -d --build backend`.

### Step 4: Open the app
| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:3000 | Main app |
| Backend API + Swagger | http://localhost:8080/swagger-ui.html | API docs |
| pgAdmin | http://localhost:5050 | login with `.env` pgAdmin credentials |
| PostgreSQL | localhost:5432 | for external DB tools (DBeaver etc.) |
| Ollama | localhost:11434 | raw Ollama API |

### Step 5: Log in
A default admin account is auto-seeded on first backend startup:
```
Email:    admin@civic.com
Password: Admin@123
```
Register a normal citizen account from the Register page to test the user side.

### Connecting pgAdmin to Postgres
1. Open http://localhost:5050 and log in.
2. Right-click **Servers → Register → Server**.
3. **General tab** → Name: `Civic DB`.
4. **Connection tab** → Host: `postgres` (the Docker service name, not `localhost`) → Port: `5432` → Username/Password: from `.env`.

### Stopping / resetting
```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers AND wipe all data (fresh start)
```

---

## 4. Option B — Run everything locally (no Docker)

### Step 1: PostgreSQL
Create a database and user:
```sql
CREATE DATABASE complaint_db;
```
(Default assumption: user `postgres` / password `postgres` on `localhost:5432` — adjust `application.yml` or use env vars if different.)

### Step 2: Ollama
```bash
# Install from https://ollama.com/download, then:
ollama pull llama3
ollama serve      # usually starts automatically as a background service
```
Verify it's running: `curl http://localhost:11434` should respond.

### Step 3: Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend starts on **http://localhost:8080**. It auto-creates all tables (Hibernate `ddl-auto: update`) and seeds the admin user + departments on first run.

Environment variables you can override (all have sane defaults in `application.yml`):
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET, JWT_EXPIRATION_MS
CORS_ORIGIN        (default: http://localhost:5173)
UPLOAD_DIR         (default: uploads)
OLLAMA_BASE_URL    (default: http://localhost:11434)
OLLAMA_MODEL       (default: llama3)
```

### Step 4: Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on **http://localhost:5173** and talks to the backend at `http://localhost:8080/api`.

### Step 5: pgAdmin (optional, local install)
Install pgAdmin4 desktop app or run just that one container:
```bash
docker run -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@pgadmin.com -e PGADMIN_DEFAULT_PASSWORD=admin123 dpage/pgadmin4
```
Connect to `localhost:5432` with your local Postgres credentials.

---

## 5. How the AI (Ollama) integration works

The backend's `OllamaService` calls Ollama's local REST API (`POST /api/generate`) — no external API keys, no internet dependency once the model is pulled, fully self-hosted.

| Feature | Where | What it does |
|---|---|---|
| 1. Rewrite complaint | `POST /api/ai/rewrite` | Cleans up a citizen's raw complaint text into a clear sentence |
| 2. Category prediction | `POST /api/ai/category` | Suggests a category from the description |
| 3. Priority detection | `POST /api/ai/priority` | Flags urgency (LOW/MEDIUM/HIGH) based on risk keywords/context |
| 4. Chat assistant | `POST /api/ai/chat` | Floating chat widget answering "how do I..." questions |
| 5. Admin summary | `GET /api/ai/summary` | Summarizes current complaint stats in plain English |
| Bonus: spam filter | used internally when raising a complaint | Blocks gibberish/spam submissions |

**Important design choice:** every AI call has a rule-based fallback. If Ollama is down, slow, or the model isn't pulled yet, the feature still works using simple keyword logic instead of crashing or blocking the user. You can turn AI off entirely with `OLLAMA_ENABLED=false`.

---

## 6. Features included

**Auth:** Register, login, JWT auth, change password, profile update, profile photo upload.

**User dashboard:** Raise complaint (title, category, description, photo, location, priority — with 3 AI-assist buttons), complaint history with a visual status timeline (Pending → Assigned → In Progress → Resolved, or Rejected), "Mark as Done" action, notifications badge.

**Admin dashboard:** Stats cards (total/pending/resolved/in-progress/today/this month), category pie chart, department bar chart, monthly trend chart, AI-generated summary, searchable/filterable complaints table, assign department, change status, delete complaint.

**Bonus features included:** complaint number generation (`CMP000001`), image upload, role-based auth, soft delete, pagination, search & filter, AI spam detection, modern responsive UI.

**Bonus features intentionally left as extension points** (to avoid shipping half-working, bug-prone code): PDF/Excel export, live Google Maps tracking, audit logs UI, email notifications. Each is a clean add-on:
- *PDF/Excel export:* add `AdminController.exportComplaints()` using `OpenPDF` or `Apache POI` over the existing `ComplaintRepository` — the data layer is already there.
- *Google Maps:* the `location` field is already a free-text string; swap it for lat/lng fields and drop in `@react-google-maps/api` on the frontend.
- *Email notifications:* `NotificationService.notify()` is the single choke point — add a `JavaMailSender` call right there.

---

## 7. Common issues

- **"Ollama call failed" but app still works** → model not pulled yet, or Ollama container not started. Run the `ollama pull llama3` step above. The app degrades gracefully either way.
- **CORS errors in browser console** → make sure `CORS_ORIGIN` in backend matches the exact frontend URL (including port).
- **pgAdmin can't connect to Postgres** → inside Docker, use hostname `postgres`, not `localhost`.
- **Image not showing** → check `VITE_API_ORIGIN` in frontend `.env` points to the backend's actual address.
- **"Port already in use"** → another process is using 8080/5432/5050/3000/11434; stop it or change the port mapping in `docker-compose.yml`.
