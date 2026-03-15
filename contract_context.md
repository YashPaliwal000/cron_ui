# Frontend-Backend API Contract Context

This document outlines the API endpoints, JSON data structures, and Authentication mechanisms that the frontend Job Scheduler MVP expects from the backend.

## Base URL
All requests will be made relative to: `/api` (e.g., `http://localhost:8080/api`)

---

## 1. Authentication

The frontend expects **JWT (JSON Web Token)** based authentication.

### **Login API**
- **Endpoint**: `POST /auth/login`
- **Purpose**: Authenticate user and retrieve JWT token.

**Request Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "password"
}
```

**Response Body (JSON):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Authorization Header**
For all subsequent API calls to `/jobs` endpoints, the frontend will automatically attach the JWT token in the HTTP Headers:
```http
Authorization: Bearer <token>
```

---

## 2. Job Management APIs

### **2.1. List All Jobs**
- **Endpoint**: `GET /jobs`
- **Purpose**: Retrieve a list of all jobs for the Dashboard and Jobs List tables.

**Response Body (JSON Array):**
```json
[
  {
    "id": "1",
    "name": "Daily Report",
    "endpoint": "https://api.example.com/report",
    "method": "POST",
    "status": "ACTIVE",      // "ACTIVE" | "PAUSED"
    "nextRun": "2026-03-15T10:00:00",
    "lastStatus": "SUCCESS"  // "SUCCESS" | "FAILED" (used in Dashboard metrics)
  }
]
```

### **2.2. Get Job Details**
- **Endpoint**: `GET /jobs/{id}`
- **Purpose**: Retrieve full details and configuration of a specific job.

**Response Body (JSON):**
```json
{
  "id": "1",
  "name": "Daily Report Generation",
  "endpoint": "https://api.example.com/reports/daily",
  "method": "POST",                  // "GET", "POST", "PUT", "DELETE", "PATCH"
  "status": "ACTIVE",
  "scheduleTime": "2026-03-15T10:00:00",
  "headers": "{\"Content-Type\": \"application/json\"}", // Stringified JSON or parsed Object
  "payload": "{\"reportType\": \"summary\"}",            // Stringified JSON or parsed Object
  "createdAt": "2026-03-01T08:00:00",
  "lastRunTime": "2026-03-14T10:00:00",
  "lastRunStatus": "SUCCESS"
}
```

### **2.3. Create New Job**
- **Endpoint**: `POST /jobs`
- **Purpose**: Create a new scheduled job.

**Request Body (JSON):**
```json
{
  "name": "Trigger Email",
  "endpoint": "https://service/email",
  "method": "POST",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "payload": "{\"userId\": 123}",
  "scheduleTime": "2026-03-15T09:00:00"
}
```
**Response**: `201 Created` (Optionally return the created Job object).

### **2.4. Update existing Job**
- **Endpoint**: `PUT /jobs/{id}`
- **Purpose**: Update configuration of an existing job.

**Request Body (JSON):** Same fields as Create Job.

### **2.5. Delete Job**
- **Endpoint**: `DELETE /jobs/{id}`
- **Purpose**: Remove a job from the system.
- **Response**: `204 No Content`

---

## 3. Job Actions APIs

### **3.1. Pause Job**
- **Endpoint**: `POST /jobs/{id}/pause`
- **Purpose**: Suspend a currently active job from executing.
- **Response**: `200 OK`

### **3.2. Resume Job**
- **Endpoint**: `POST /jobs/{id}/resume`
- **Purpose**: Resume a paused job.
- **Response**: `200 OK`

---

## 4. Job Execution History

### **4.1. Get Job Logs/History**
- **Endpoint**: `GET /jobs/{id}/history`
- **Purpose**: Retrieve historical execution logs for a specific job to display in the data grid.

**Response Body (JSON Array):**
```json
[
  {
    "id": "log-1",
    "executedAt": "2026-03-14T10:00:00",
    "durationMs": 450,
    "responseCode": 200,
    "status": "SUCCESS" // "SUCCESS" | "FAILED"
  },
  {
    "id": "log-2",
    "executedAt": "2026-03-13T10:00:00",
    "durationMs": 120,
    "responseCode": 500,
    "status": "FAILED"
  }
]
```

---

## 5. Global Requirements & Error Handling

- **CORS**: Ensure Cross-Origin Resource Sharing is enabled on the backend so the frontend (running on `localhost:5173` or `localhost:3000`) can make requests.
- **Error Responses**: For bad requests or server errors, return standard HTTP status codes (`400`, `401`, `403`, `404`, `500`).
- **Standard Error Payload**: For meaningful surfaceable errors in the UI via Snackbars, return a consistent schema, e.g.:
```json
{
  "message": "Invalid Cron expression provided.",
  "code": "INVALID_SCHEDULE"
}
```
