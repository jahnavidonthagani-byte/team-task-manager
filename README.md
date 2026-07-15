# Team Task Manager (MERN Stack)

A full-stack task management app for teams: admins create projects and assign
tasks, members update their task status, and everyone sees an analytics
overview.

## What changed in this fixed version

- **Fixed a real permission bug:** members could previously update the status
  of *any* task, not just their own. Now: admins can update any task; members
  can only update tasks assigned to them.
- **Ownership checks added** on project update/delete (previously any logged-in
  user could delete any project).
- **Real backend analytics** (`GET /api/analytics/summary`) using MongoDB
  aggregation, instead of the dashboard just counting an array on the client.
- **Project membership management:** add/remove members via
  `POST/DELETE /api/projects/:id/members`.
- **Input validation** on all write routes (express-validator).
- **Centralized error handling** instead of repeated try/catch boilerplate.
- **Security hardening:** helmet, rate limiting, CORS restricted to your
  frontend origin via env var.
- **Removed the exposed `.env`** (it had a real database password committed).
  Use `.env.example` as a template instead.
- **Removed ~800 lines of commented-out dead code** left over from earlier
  iterations of the routes/pages.
- Corrected a few dependency versions in `backend/package.json` that didn't
  actually exist on npm.

## Project structure

```
team-task-manager-main/
├── backend/     Express + MongoDB API
└── frontend/    React + Vite client
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI (your MongoDB connection string) and JWT_SECRET
npm install
npm run dev        # nodemon, auto-restarts
# or: npm start
```

Backend runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000/api
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## API overview

| Method | Route                              | Access          |
|--------|-------------------------------------|-----------------|
| POST   | /api/auth/register                  | Public          |
| POST   | /api/auth/login                     | Public          |
| GET    | /api/users                          | Logged in       |
| GET    | /api/users/me                       | Logged in       |
| GET    | /api/projects                       | Logged in       |
| GET    | /api/projects/:id                   | Logged in       |
| POST   | /api/projects                       | Admin           |
| PUT    | /api/projects/:id                   | Admin / owner   |
| DELETE | /api/projects/:id                   | Admin / owner   |
| POST   | /api/projects/:id/members            | Admin / owner   |
| DELETE | /api/projects/:id/members/:userId    | Admin / owner   |
| GET    | /api/tasks                          | Logged in (scoped) |
| POST   | /api/tasks                          | Admin           |
| PUT    | /api/tasks/:id                      | Admin / assignee |
| DELETE | /api/tasks/:id                      | Admin           |
| GET    | /api/analytics/summary              | Logged in (scoped) |
| GET    | /api/comments/task/:taskId          | Logged in       |
| POST   | /api/comments/task/:taskId           | Logged in       |
| GET    | /api/notifications                  | Logged in       |
| PUT    | /api/notifications/:id/read          | Logged in       |
| PUT    | /api/notifications/read-all          | Logged in       |

## New features added

- **Kanban board** (`/kanban`) — drag-and-drop task cards between Pending /
  In Progress / Completed / Overdue columns. Dropping a card calls the same
  `PUT /api/tasks/:id` endpoint as the status dropdown, so all the existing
  permission rules (admin vs. own-task-only) still apply.
- **Calendar view** (`/calendar`) — month grid showing tasks on their due
  date, color-coded by status, with prev/next/today navigation.
- **In-app notifications** — a bell icon in the navbar shows unread count
  and a dropdown of notifications. Triggered automatically when: a task is
  assigned to you, a task you're assigned changes status, or someone
  comments on your task.
- **Real dashboard charts** — pie chart of task status breakdown + bar chart
  of team workload (admin view), powered by the `/api/analytics/summary`
  backend endpoint using MongoDB aggregation. Built with Recharts.
- **Project member management UI** — admins can add/remove members from a
  project directly from the Projects page (uses the
  `/api/projects/:id/members` endpoints).
- **Task comments / activity log** — each task now has an expandable
  "Activity Log" where any user with access can post and read comments,
  timestamped and attributed to the author.

## Not included (flagged, not built)

- **Organization / multi-team management** — this would mean restructuring
  Users, Projects, and Tasks to all belong to an Organization, which touches
  nearly every model and route in the app. Rather than bolt it on quickly
  and risk breaking what's already working, this needs to be planned as its
  own migration. Happy to scope and build it as the next step if you want
  it — but it's a genuinely bigger job than everything above combined.

## UI fixes

- Fixed the task creation form's dropdown to say "Assigned By" instead of
  "Assign To" (matches the field name used throughout the app).
- Centered all page and section headings for a cleaner look.
- Added a working **Edit** button on each project (name/description) — the
  backend already supported this, it just had no button.
- Removed `Login.jsx` and `Register.jsx` — dead, unused files not wired into
  the app at all (login/register is handled inline in `Auth.jsx`).

## Known open issue — needs your help to pin down

File uploads and comments were tested and working in isolation (see backend
test output), but you reported they're not working for you. I couldn't find
a bug by re-reading the code, so to fix it properly I need the actual error:
open DevTools (F12) → Network tab → try the action → click the failed
request → send me the status code and response body.

## If pages look wrong / features seem missing (stale build checklist)

If buttons, task names, or features described in this README don't appear
on your screen, it's almost always a stale copy, not a code bug — I
server-rendered the actual Calendar component code from this zip and
confirmed the Prev/Today/Next buttons and task rendering logic are correct.
Before assuming something's broken, do this fresh:

1. **Delete your old extracted folder completely** (don't extract on top of
   it — Windows sometimes nests folders like
   `team-task-manager-fixed\team-task-manager-fixed\` from repeated
   downloads, and you can end up running old code without realizing it).
2. Extract this zip fresh into a clean location.
3. In `backend/`: run `npm install` again (new dependencies were added:
   multer for uploads).
4. In `frontend/`: run `npm install` again (Recharts was added).
5. Copy `.env.example` to `.env` in both folders and fill in real values.
6. Stop any old `npm run dev` process (Ctrl+C) and start it fresh in both
   folders.
7. **Hard refresh your browser** (Ctrl+Shift+R) or open in an incognito
   window to rule out a cached old JS bundle.
8. For the calendar specifically: task names only appear on days that have
   a `dueDate` set on that task, in the month you're currently viewing —
   an empty calendar with no tasks with due dates in the current month is
   expected, not a bug.

## Feature status vs. the full "enterprise" wishlist

You asked whether a large list of enterprise features (Organizations, Teams,
Departments, enterprise roles, Profile/Settings pages, Time Tracking,
Reports, Dark Mode, Render deployment, architecture diagrams, project
report, etc.) are already in this project. Being straight with you: **no,
most of that is not built.** Here's the honest breakdown:

**Actually in this project:**
- Backend: Auth (JWT), Projects, Tasks, Comments, Notifications,
  Analytics, file uploads, input validation, security middleware
- Frontend: Login/Register (combined in Auth), Dashboard w/ charts,
  Projects (with edit + member management), Tasks, Kanban, Calendar
- Two roles: Admin and Member

**Not built (would need real work, not a quick add):**
- Organizations / Teams / Departments — needs a full schema redesign,
  flagged earlier as its own project
- Enterprise roles (Super Admin, Manager, Team Lead, Developer, Tester) —
  currently just Admin/Member
- Profile page, Settings page
- Search & filters, Time tracking, Reports
- Dark mode
- Deployment to Render/Atlas (you'd need to do this yourself or ask me to
  walk you through it — I can't deploy to your accounts)
- Architecture diagram, formal project report document

If you want, I can help you write the project report and architecture
diagram for what's actually built (that's genuinely useful for an
evaluation) — that's very different from claiming the whole wishlist above
is implemented when it isn't.

## New this round: Search/Filters, Activity Log, Reports

- **Search & Filters** — Tasks page now has a search box (by title) plus
  status and project filters. Projects page has a name search. All
  client-side, instant, no backend changes needed.
- **Activity Log** — task creation and every status change now
  auto-generate a system entry (e.g. `"Alice changed status from Pending
  to Completed"`) that appears in the same panel as comments, visually
  distinct (italic, clock icon, no delete button — audit entries can't be
  deleted by anyone, tested).
- **Reports page** (`/reports`) — status breakdown, completion rate per
  project, workload per team member, and a "Export as CSV" button that
  downloads your full task list.

Explicitly deferred (bigger scope, not rushed in): UI design polish,
Organizations/Teams, Time tracking. Happy to tackle these next, one at a
time, same as everything above.

## Access model simplified

Per your request, the only restriction left for Members is **creating**
tasks and projects (Admin-only). Everything else is now fully open to
Members too:

- Members see **all** tasks and **all** projects (previously scoped to only
  their own assigned tasks)
- Members can update the status of **any** task, not just their own
  (status dropdown now shows for both roles)
- Members see full dashboard analytics and workload breakdown (previously
  admin-only)
- Deleting tasks/projects and adding members to a project stays admin-only
  (not mentioned as something to open up)

Tested: a member logged in as a user who owns none of the tasks can now
see all of them and successfully update one they didn't create (verified
with a live simulated request, not just code review).

## Fixed this round (all verified, not guessed)

- **Real bug found and fixed: invisible calendar buttons.** `navbar.css` had
  an unscoped `button { color: white; }` rule that leaked onto every button
  on every page. The Calendar's Prev/Today/Next buttons set a white
  background but never set text color, so they inherited white-on-white —
  invisible text, not missing buttons. Scoped the CSS to `.navbar button`
  and added explicit color as a backup.
- **Create Task form was visible/usable by all roles** (the code literally
  said `Visible to All` in a comment) even though the backend already
  blocked non-admins. Now disabled and greyed out for non-admins, matching
  how the Projects page already worked.
- **File attachments removed entirely** (frontend component, backend
  routes, Multer dependency, Task schema field, uploads folder) since it
  wasn't working for you and you asked to remove it rather than keep
  debugging blind.
- **Comment delete added** — each comment now has a small Delete button,
  visible to its author or an admin. Backend enforces this too (tested: a
  non-author member gets a 403).

## Is this actually a "major project"?

Being honest: **it depends on what your evaluator is grading.** As a
functional full-stack MERN app, yes — it now has real auth, RBAC enforced
on both frontend and backend, projects, tasks, a working Kanban board,
calendar, dashboard with charts, comments, and notifications, all backed
by tested API routes. That's a legitimate, working, reasonably complete
app.

What it is **not**: an enterprise-grade product with multi-organization
support, formal architecture documentation, deployment to a live server,
or a written project report. If your evaluation criteria include any of
those, they still need to be done separately — see the "Feature status vs.
the full enterprise wishlist" section below for the honest gap list.

## Fixed since the last version

- **Renamed `assignedTo` to `assignedBy` consistently** across the Task
  model, all backend routes (create/read/update, analytics), and the
  frontend — matching the name the frontend form and UI label already used.
  (Note: despite the name, this field still represents who the task is
  assigned *to* — that's just what it's called throughout this codebase.)
- **Task creation was broken (400 error)** — the frontend sends the assignee
  field as `assignedBy`, but a backend cleanup pass had dropped the fallback
  that accepted it. Fixed and tested end-to-end.

## Security note

The original `.env` file that was in the zip contained a **real MongoDB
username and password**. It has been removed from this version. If that
database is still using those credentials, **rotate the password now** in
MongoDB Atlas, since it was exposed in a file you shared.
## Live Demo

🌐 Frontend:https://team-task-manager-one-eta.vercel.app

⚙️ Backend API: https://team-task-manager-11.onrender.com