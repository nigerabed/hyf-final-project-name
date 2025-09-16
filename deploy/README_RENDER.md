Render deployment notes

API service (api/)
- Root Directory: api
- Build Command: npm install
- Start Command: node scripts/wait-for-db-and-migrate.mjs && npm run start:prod
- Health Check Path: /api/health
- Environment variables to set in Render (API):
  - DATABASE_URL (use Internal URL provided by the Render DB)
  - JWT_SECRET (generate a secure random string)
  - FRONTEND_URL (https://<your-frontend>.onrender.com)
  - Optional: PGSSLMODE=require

Frontend service (app-next)
- Root Directory: app-next
- Build Command: npm install && npm run build
- Start Command: npm run start
- Important: Set NEXT_PUBLIC_API_URL in the Render Environment BEFORE build
  - e.g. NEXT_PUBLIC_API_URL=https://hyf-final-project-name.onrender.com

Notes
- Do NOT commit real secrets to the repository. Use Render's Environment Variables UI or upload a .env file via the Render web UI only for temporary convenience.
- If you experience DB SSL errors, set PGSSLMODE=require or configure knex to use a CA certificate.
