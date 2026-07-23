# Supply Chain App

A full-stack supply chain management application with:

- Express + TypeScript backend
- SQLite database
- Static HTML/CSS/JS frontend
- Admin and manager views

## Project Structure

- `backend/` — API server, database access, and routes
- `frontend/` — login, admin, and manager pages

## Run Locally

1. Open a terminal in the project root.
2. Start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, serve the frontend:

   ```bash
   cd frontend
   python -m http.server 3000
   ```

4. Open:

   - http://localhost:3000/index.html
   - API health check: http://localhost:3001/api/health

## Notes

- The backend uses SQLite and runs on port `3001` by default.
- The frontend is served on port `3000`.
- The repository is intended to be used as a simple local development project.
