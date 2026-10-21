# AI Task Planner

Turns a goal into a clear, editable task plan using AI.

You type a goal (for example "Finish my final year project in 6 weeks"), the AI breaks it into tasks with priorities and time estimates, you review and edit the plan, and then save it to a task board where you track progress.

**Live demo:** https://faiqa-task-planner.netlify.app

> Note: the app runs on free hosting, so the first request after some idle time can take 10 to 30 seconds.

## Problem
People often have a big goal but do not know where to start. This app turns one goal into a clear list of tasks.

## Users
Students and freelancers who struggle to plan big goals.

## Features
- [x] Register and login with JWT authentication
- [x] Create a goal with an optional deadline
- [x] AI generates 5 to 10 tasks with priority and estimated hours
- [x] Review step: edit, add or remove tasks before saving
- [x] Save the plan (goal and tasks together)
- [x] Goals list with progress bars
- [x] Task board with To do, In progress and Done columns
- [x] Edit, delete and add tasks at any time
- [x] Each user can only see their own data
- [x] Rate limiting on the AI endpoint to protect the free quota

## User Flow
Register / Login → Enter goal → Generate → Review and edit → Save → Goals list → Task board

## Tech Stack
- **Frontend:** Angular, TypeScript, Tailwind CSS
- **Backend:** .NET Web API (C#), Entity Framework Core
- **Database:** SQL Server
- **AI:** Groq API (free tier)
- **Auth:** JWT, BCrypt password hashing
- **Hosting:** Netlify (frontend), MonsterASP.NET (backend and database)

## Architecture

```
Angular app  ->  .NET Web API  ->  SQL Server
                      |
                      +-> Groq API (AI)
```

- The AI key never reaches the browser. Only the backend talks to the AI.
- The AI service sits behind an interface (`IAiPlannerService`), so the provider can be changed without touching the rest of the code.
- AI output is requested as JSON, then validated and cleaned before it is used.
- Preview and save are separate steps, so nothing is stored until the user approves it.
- DTOs control what data goes in and out of the API, so database models and password hashes are never exposed.

## Project Structure

```
ai-task-planner/
├── backend/TaskPlanner.Api/   Controllers, Models, DTOs, Services, Data
├── frontend/                  Angular app (core, features, shared)
├── docs/                      Database design
├── netlify.toml               Netlify build settings
└── README.md
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Current user (token test) |
| POST | /api/planner/preview | AI task preview (rate limited) |
| POST | /api/planner/save | Save goal with tasks |
| GET, POST | /api/goals | List or create goals |
| GET, PUT, DELETE | /api/goals/{id} | Read, update, delete a goal |
| GET, POST | /api/goals/{goalId}/tasks | List or add tasks |
| PUT, DELETE | /api/tasks/{id} | Update or delete a task |
| PATCH | /api/tasks/{id}/status | Change task status |

All endpoints except register and login need a JWT token.

## Database

Three tables: `Users`, `Goals`, `TaskItems`. A user has many goals, and a goal has many tasks (deleting a goal deletes its tasks). Details are in [docs/database-design.md](docs/database-design.md).

## Getting Started (local)

### Requirements
- .NET SDK 10
- Node.js 24 and Angular CLI
- SQL Server Express
- A free Groq API key

### Backend
```
cd backend/TaskPlanner.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<a long random string, 32+ characters>"
dotnet user-secrets set "Groq:ApiKey" "<your Groq key>"
dotnet ef database update
dotnet run
```
Check the connection string in `appsettings.json` if your SQL Server instance name is different from `localhost\SQLEXPRESS`. The API runs on `http://localhost:5140` and the API docs are at `/scalar` (development only).

### Frontend
```
cd frontend
npm install
ng serve
```
Open `http://localhost:4200`.

## Deployment

- **Frontend:** Netlify builds the Angular app from the `frontend` folder (see `netlify.toml`). A `_redirects` file makes page refresh work on Angular routes.
- **Backend:** published with `dotnet publish` and uploaded to MonsterASP.NET.
- **Secrets:** stored as environment variables on the host (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Groq__ApiKey`, `Cors__Origins`), never in the repository.

## Security Notes
- Secrets are stored in .NET user secrets locally and in environment variables on the server. They are never committed.
- Passwords are hashed with BCrypt.
- Every goal and task query is filtered by the logged-in user's id, taken from the token.
- CORS only allows the frontend origin.
- User input is treated as data in the AI prompt, not as instructions.
- Rate limit: 5 AI requests per minute per user.

## Known Limitations
- No automated tests yet.
- No password reset or email verification.
- The token is stored in `localStorage` and there is no refresh token (login again after 8 hours).
- The rate limit counter lives in server memory, so it resets when the server restarts.
- The task board uses buttons to move tasks, not drag and drop.

## Roadmap
- UI polish and a more refined design
- Drag and drop board
- Due-date reminders
- Export plan to PDF
- Unit tests for the AI response parser
- Password reset

## Author
Faiqa, BSCS student at Lahore College for Women University.