# Hospital Management System

A full-stack hospital management web app with patients, doctors, appointments, medical records, and prescriptions. Built with **MySQL + Express + React**.

![Stack](https://img.shields.io/badge/MySQL-9.x-4479A1?logo=mysql&logoColor=white)
![Node](https://img.shields.io/badge/Node-22+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

---

## Stack

| Layer    | Technology                                                   |
|----------|--------------------------------------------------------------|
| Database | MySQL 9 (Homebrew)                                           |
| Backend  | Node.js + Express + `mysql2/promise` — REST API on port 4000 |
| Frontend | React 19 + Vite + react-router-dom — port 5173               |

The Vite dev server proxies `/api/*` to the backend, so the frontend code talks to a single relative origin.

---

## Quick Start (macOS)

### 1. Install prerequisites

```bash
# Homebrew: https://brew.sh
brew install mysql node
brew services start mysql
```

If `brew` is not on your PATH (Apple Silicon), add this to `~/.zshrc` and reload:

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Load the database

```bash
mysql -u root < sql/schema.sql
```

This drops/recreates a `hospital` database with all 10 tables and seed data (3 patients, 3 doctors, 3 appointments, etc.). Verify:

```bash
mysql -u root -e "USE hospital; SHOW TABLES;"
```

### 3. Start the backend

```bash
cd backend
npm install
npm run dev          # auto-reloads on changes (or: npm start)
```

API runs at `http://localhost:4000`. Sanity check: `curl http://localhost:4000/api/health` → `{"ok":true}`.

If your MySQL root user has a password, copy `backend/.env.example` to `backend/.env` and set `DB_PASSWORD`.

### 4. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## Project Structure

```
project/
├── sql/
│   └── schema.sql              # MySQL schema + seed data
│
├── backend/
│   ├── server.js               # Express routes
│   ├── db.js                   # mysql2 connection pool
│   ├── .env.example            # DB_HOST, DB_USER, etc.
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Layout + router
│   │   ├── api.js              # Fetch-based API client
│   │   ├── validators.js       # Form validation rules per entity
│   │   ├── components/
│   │   │   ├── Field.jsx       # Reusable input/select with inline error
│   │   │   ├── Toast.jsx       # Success/error toast + useToast() hook
│   │   │   └── ErrorBanner.jsx # Server-error banner inside forms
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Records.jsx
│   │   │   └── Prescriptions.jsx
│   │   ├── App.css             # Layout (sidebar, panels, stat cards)
│   │   └── index.css           # Design tokens, inputs, buttons, badges
│   └── vite.config.js          # Proxies /api → :4000
│
└── README.md
```

---

## Features

### Pages

| Page          | Description                                                                  |
|---------------|------------------------------------------------------------------------------|
| Dashboard     | KPI cards (patients, doctors, appointments, records, active prescriptions) + recent appointments table |
| Patients      | List all patients; add new with full demographics                            |
| Doctors       | List all doctors; add new with department and specialization                 |
| Appointments  | List with patient + doctor names joined; schedule new appointments           |
| Medical Records | List with diagnosis/treatment; create records linked to a patient/doctor   |
| Prescriptions | List with active/completed status; issue new prescriptions                   |

### Form Validation

Every form has inline, real-time validation defined in `frontend/src/validators.js`:

| Field              | Rule                                                       |
|--------------------|------------------------------------------------------------|
| IDs (any entity)   | Required, positive integer, unique among existing records  |
| First / Last name  | Required, ≥ 2 characters                                   |
| Email              | Valid email format                                         |
| Phone              | 7–20 chars: digits, dashes, spaces, `+`, `(`, `)`          |
| SSN                | Exactly `123-45-6789` format                               |
| Blood type         | Must be one of A+/A−/B+/B−/AB+/AB−/O+/O−                   |
| Date of birth      | Cannot be in the future                                    |
| Medical record date| Cannot be in the future                                    |
| Scheduled appt.    | Date cannot be in the past (only when status is Scheduled) |
| Appointment time   | `HH:MM AM/PM` format (e.g. `10:00AM`)                      |
| Duration           | 5–480 minutes                                              |
| Weight             | 1–1000 lbs                                                 |
| Height             | 1–10 ft                                                    |
| Prescription dates | End date ≥ start date                                      |
| FK selects         | Required where the database FK is non-null                 |

**Validation UX:**
- Errors appear inline below each field, with red border + shake animation.
- Errors trigger on blur (after the user leaves a field) and clear in real-time as the user fixes them.
- Submitting touches all fields, so any remaining errors light up at once.
- Server errors (e.g. foreign-key violations) appear as a dismissible banner inside the form panel.
- Successful saves show a green toast in the bottom-right corner.

---

## API Reference

Base URL: `http://localhost:4000`

| Method | Endpoint                  | Description                                             |
|--------|---------------------------|---------------------------------------------------------|
| GET    | `/api/health`             | Liveness check                                          |
| GET    | `/api/stats`              | Counts for dashboard cards                              |
| GET    | `/api/doctors`            | List all doctors                                        |
| POST   | `/api/doctors`            | Create doctor                                           |
| GET    | `/api/patients`           | List all patients                                       |
| GET    | `/api/patients/:id`       | One patient + allergies, contacts, addresses (joined)   |
| POST   | `/api/patients`           | Create patient                                          |
| GET    | `/api/appointments`       | List with patient + doctor names joined                 |
| POST   | `/api/appointments`       | Create appointment                                      |
| GET    | `/api/records`            | List with patient + doctor names joined                 |
| POST   | `/api/records`            | Create medical record                                   |
| GET    | `/api/prescriptions`      | List with patient + doctor names joined                 |
| POST   | `/api/prescriptions`      | Create prescription                                     |

### Example request

```bash
curl -X POST http://localhost:4000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "doctorid": 4,
    "fname": "Sarah", "lname": "Lee",
    "email": "slee@hospital.com",
    "pnumber": "555-444-5555",
    "dept": "Oncology",
    "spec": "Medical Oncologist"
  }'
```

---

## Database Schema

10 tables with foreign-key relationships:

```
patient ─┬─< appointments >─ doctor
         ├─< medicalrecords >─ doctor
         ├─< prescription >─ doctor
         ├─< contactinfo
         ├─< allergies
         └─< address >─ zipcodes

doctor ──< employment
```

The original Oracle schema was converted to MySQL — see `sql/schema.sql`. Notes:
- `default sysdate` was removed; the frontend supplies dates explicitly (`YYYY-MM-DD`).
- `time` and `language` are MySQL reserved words and are backticked in SQL.
- IDs are entered manually (no auto-increment), matching the original schema.

To switch to auto-increment, change the column types to `INT AUTO_INCREMENT` and stop sending the ID from the frontend.

---

## Common Tasks

**Reset the database:**
```bash
mysql -u root < sql/schema.sql
```

**Tail backend logs:**
```bash
cd backend && npm run dev
```

**Stop MySQL when you're done:**
```bash
brew services stop mysql
```

**Restart everything:**
```bash
brew services start mysql
cd backend  && npm run dev   # terminal 1
cd frontend && npm run dev   # terminal 2
```

---
## Proof of Concept:
<img width="1470" height="728" alt="Screenshot 2026-05-03 at 11 41 06 PM" src="https://github.com/user-attachments/assets/b6a34817-a6cf-49cd-aaee-13329e8fb6fd" />

<img width="1470" height="741" alt="Screenshot 2026-05-03 at 11 41 10 PM" src="https://github.com/user-attachments/assets/fe2c562d-d631-4bd2-bd91-de14d2c557e5" />

<img width="1470" height="682" alt="Screenshot 2026-05-03 at 11 41 13 PM" src="https://github.com/user-attachments/assets/d207e7bf-94a9-4e6f-a76b-cd8a527d9acf" />

<img width="1470" height="673" alt="Screenshot 2026-05-03 at 11 41 18 PM" src="https://github.com/user-attachments/assets/763230bc-1eb0-4106-8d13-43beac86a8b9" />

<img width="1470" height="629" alt="Screenshot 2026-05-03 at 11 41 22 PM" src="https://github.com/user-attachments/assets/3da8b074-2a15-4c68-8f22-82484df7a42d" />

<img width="1470" height="599" alt="Screenshot 2026-05-03 at 11 41 25 PM" src="https://github.com/user-attachments/assets/5155328e-6e3d-4efa-ba5f-09fa007d549c" />

<img width="1470" height="759" alt="Screenshot 2026-05-03 at 11 41 29 PM" src="https://github.com/user-attachments/assets/242ff6f9-5016-481b-afdb-e2ef2ec96c64" />


## Troubleshooting

| Symptom                                              | Fix                                                                  |
|------------------------------------------------------|----------------------------------------------------------------------|
| `command not found: brew`                            | Add `eval "$(/opt/homebrew/bin/brew shellenv)"` to `~/.zshrc`        |
| `ER_ACCESS_DENIED_ERROR` on backend                  | Set `DB_PASSWORD` in `backend/.env`                                  |
| `ECONNREFUSED ::1:3306`                              | MySQL isn't running — `brew services start mysql`                    |
| Frontend shows `Failed to fetch`                     | Backend isn't running on port 4000, or check Vite proxy config       |
| `ER_NO_REFERENCED_ROW_2` (FK violation) when posting | The selected patient/doctor/record ID doesn't exist                  |
| Port 5173 or 4000 already in use                     | `lsof -ti :5173 \| xargs kill` (replace with the conflicting port)   |
