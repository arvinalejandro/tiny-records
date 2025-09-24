Tiny Records
A minimal full-stack application built with Node.js (Express + TypeScript) and React (Vite).
It demonstrates secure login, record creation, and record listing — using in-memory storage (no database setup required).

Features
-Login via /api/login (simple session auth)
-Add records with a title and priority (low, med, high)
-View records in a table showing ID, title, priority, and creation date
-Lightweight setup — runs with Node.js and in-memory storage only

Criteria
- Login using { email: 'demo@sma.local', password: 'demo123' }
- Calling endpoint /api/records without sid / not logged in returns error:unauthorized (test via postman)
- Create Record returns data with ID tied to session.
- Get /api/records returns only the logged in user's records
  

Local Setup

1. Clone the repo
   `git clone https://github.com/arvinalejandro/tiny-records.git`

2. Setup (Backend / Frontend)
   `npm run install-all`

3. Run Application Concurrent(Backend/Frontend)
   `npm run dev`
