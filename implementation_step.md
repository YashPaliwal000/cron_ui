# Frontend Implementation Guide — Job Scheduler MVP

This document provides **step-by-step instructions to build the frontend** for the Job Scheduler dashboard.

Goal:
Provide a UI where users can:

* Login
* Create jobs
* Update jobs
* Pause / Resume jobs
* Delete jobs
* View job status
* View job execution history
* Monitor all jobs in a dashboard

Tech Stack:

* React
* React Router
* Axios
* Material UI
* Context API (for authentication)
* JWT Authentication

Backend APIs assumed from backend implementation.

---

# 1. Create React Project

Use Node LTS installed.

Create project:

```bash
npx create-react-app job-scheduler-ui
cd job-scheduler-ui
```

Start development server:

```bash
npm start
```

---

# 2. Install Required Libraries

Install core libraries.

```bash
npm install axios react-router-dom @mui/material @mui/icons-material
```

Optional utilities:

```bash
npm install dayjs
```

Libraries Purpose:

| Library          | Purpose           |
| ---------------- | ----------------- |
| axios            | API communication |
| react-router-dom | routing           |
| material-ui      | UI components     |
| dayjs            | date formatting   |

---

# 3. Project Folder Structure

Organize frontend properly.

```text
src
 ├── api
 ├── components
 ├── pages
 ├── services
 ├── context
 ├── routes
 ├── utils
 └── App.js
```

Explanation:

| Folder     | Purpose                |
| ---------- | ---------------------- |
| api        | API request files      |
| components | reusable UI components |
| pages      | application pages      |
| services   | business logic         |
| context    | authentication state   |
| routes     | route guards           |
| utils      | helper functions       |

---

# 4. Configure API Client

Create centralized API client.

File:

```text
src/api/apiClient.js
```

Implementation concept:

```javascript
import axios from "axios";

const apiClient = axios.create({
 baseURL: "http://localhost:8080/api",
 headers: {
   "Content-Type": "application/json"
 }
});

export default apiClient;
```

Purpose:

* Central API configuration
* Attach authentication token later

---

# 5. Authentication Setup

We will implement **JWT based authentication**.

Token stored in:

```text
localStorage
```

Create authentication context.

File:

```text
src/context/AuthContext.js
```

Responsibilities:

* store user login state
* store JWT token
* provide login/logout functions

Context methods:

```text
login()
logout()
isAuthenticated()
getToken()
```

---

# 6. Add Axios Interceptor for Token

Update API client to attach token.

```javascript
apiClient.interceptors.request.use((config) => {
 const token = localStorage.getItem("token");

 if (token) {
   config.headers.Authorization = `Bearer ${token}`;
 }

 return config;
});
```

This ensures **every API request sends authentication token**.

---

# 7. Setup Routing

Install router earlier.

Create routes.

File:

```text
src/routes/AppRoutes.js
```

Routes needed:

```text
/login
/dashboard
/jobs
/jobs/create
/jobs/:id
/jobs/:id/history
```

Protected routes should require authentication.

---

# 8. Create Pages

Create pages inside:

```text
src/pages
```

Required pages:

| Page           | Purpose                |
| -------------- | ---------------------- |
| LoginPage      | user authentication    |
| DashboardPage  | overview of all jobs   |
| CreateJobPage  | create new job         |
| JobDetailsPage | view job info          |
| JobHistoryPage | view execution history |
| EditJobPage    | update job             |

---

# 9. Login Page

File:

```text
pages/LoginPage.js
```

UI Fields:

```text
Email
Password
Login Button
```

Login Flow:

```text
User enters credentials
↓
POST /auth/login
↓
Receive JWT token
↓
Save token in localStorage
↓
Redirect to dashboard
```

Example request:

```json
POST /auth/login

{
 "email": "admin@test.com",
 "password": "password"
}
```

Response:

```json
{
 "token": "jwt_token_here"
}
```

---

# 10. Dashboard Page

File:

```text
pages/DashboardPage.js
```

Purpose:

Show overview of jobs.

Display:

```text
Total Jobs
Active Jobs
Paused Jobs
Failed Jobs
```

Also display **job table**.

Table Columns:

```text
Job Name
Endpoint
Status
Next Run Time
Last Status
Actions
```

Actions:

```text
Pause
Resume
Delete
View Details
```

---

# 11. Jobs List Page

File:

```text
pages/JobsPage.js
```

Fetch jobs from API:

```text
GET /jobs
```

Display in table.

Example API response:

```json
[
 {
  "id": "1",
  "name": "Daily Report",
  "status": "ACTIVE",
  "scheduleTime": "2026-03-15T10:00"
 }
]
```

---

# 12. Create Job Page

File:

```text
pages/CreateJobPage.js
```

Form Fields:

```text
Job Name
API Endpoint
HTTP Method
Headers
Payload
Schedule Time
```

Submit Flow:

```text
User fills form
↓
POST /jobs
↓
Redirect to dashboard
```

Example request:

```json
{
 "name": "Trigger Email",
 "apiEndpoint": "https://service/email",
 "method": "POST",
 "scheduleTime": "2026-03-15T09:00"
}
```

---

# 13. Job Details Page

File:

```text
pages/JobDetailsPage.js
```

Fetch job info.

API:

```text
GET /jobs/{id}
```

Display:

```text
Job Name
Endpoint
Method
Schedule Time
Status
```

Buttons:

```text
Pause
Resume
Edit
Delete
View History
```

---

# 14. Job History Page

File:

```text
pages/JobHistoryPage.js
```

API:

```text
GET /jobs/{id}/executions
```

Display execution logs.

Table Columns:

```text
Run Time
Status
Duration
Response Code
```

---

# 15. Reusable Components

Create inside:

```text
src/components
```

Recommended components:

| Component   | Purpose               |
| ----------- | --------------------- |
| Navbar      | navigation bar        |
| Sidebar     | navigation menu       |
| JobTable    | job list table        |
| JobForm     | job creation form     |
| StatusBadge | success/failed labels |
| Loader      | loading indicator     |

---

# 16. Authentication Guard

Create protected route component.

File:

```text
routes/ProtectedRoute.js
```

Logic:

```text
If token exists → allow access
Else → redirect to login
```

---

# 17. Navigation Layout

Use layout component.

File:

```text
components/Layout.js
```

Structure:

```text
Navbar
Sidebar
Main Content
```

Navigation Menu:

```text
Dashboard
Jobs
Create Job
Logout
```

---

# 18. API Service Layer

Create services for API calls.

Example:

```text
services/jobService.js
```

Functions:

```text
getJobs()
getJob(id)
createJob()
updateJob()
pauseJob()
resumeJob()
deleteJob()
getJobHistory()
```

---

# 19. Error Handling

Handle API errors globally.

Show alerts when:

```text
Job creation fails
API endpoint invalid
Unauthorized access
Network error
```

Use Material UI Snackbar.

---

# 20. Basic UI Flow

Application flow:

```text
Login
 ↓
Dashboard
 ↓
View Jobs
 ↓
Create Job
 ↓
Monitor Job
 ↓
View Execution Logs
```

---

# 21. Development Order

Recommended implementation order:

1. Create React project
2. Setup folder structure
3. Setup API client
4. Implement authentication
5. Implement routing
6. Build login page
7. Build dashboard page
8. Implement job list
9. Implement create job page
10. Implement job details page
11. Implement job history page
12. Connect APIs
13. Add error handling
14. Improve UI styling

---

# 22. MVP Limitations

Current version includes:

* Basic authentication
* Job CRUD
* Job monitoring
* Execution history

Future improvements:

* Role-based access control
* Real-time job updates
* Retry job execution
* Notifications
* Job analytics dashboard

---

