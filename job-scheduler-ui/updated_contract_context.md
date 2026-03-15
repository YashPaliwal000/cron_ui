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
    "id": "uuid-1",
    "name": "Daily Report",
    "endpoint": "https://api.example.com/report",
    "method": "POST",
    "status": "ACTIVE",
    "nextRun": "2026-03-16T09:00:00",
    "lastStatus": "SUCCESS"
  },
  {
    "id": "uuid-2",
    "name": "Weekly Backup",
    "endpoint": "https://api.example.com/backup",
    "method": "GET",
    "status": "ACTIVE",
    "nextRun": "2026-03-17T10:00:00",
    "lastStatus": "FAILED"
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
  "scheduleType": "RECURRING",
  "scheduleTime": "2026-03-15T10:00:00",
  "cronExpression": "0 0 9 * * ?",
  "timeZone": "Asia/Kolkata",
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
  "scheduleType": "RECURRING",  // "ONE_TIME" | "RECURRING"
  "scheduleTime": "2026-03-15T09:00:00",  // Required for ONE_TIME, optional start time for RECURRING
  "cronExpression": null,  // Optional; if not provided, generated from scheduleConfig
  "timeZone": "Asia/Kolkata",  // Optional, defaults to system timezone
  "scheduleConfig": {  // Optional; used to generate cronExpression if not provided
    "frequency": "DAILY",  // "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"
    "times": ["09:00", "13:00"],  // HH:MM format, required for DAILY/WEEKLY/MONTHLY
    "daysOfWeek": null,  // ["MON", "TUE", ...] for WEEKLY
    "daysOfMonth": null,  // [1, 15] for MONTHLY
    "interval": null  // e.g., 2 for every 2 hours (for HOURLY, but can extend)
  }
}
```
**Response Body (JSON):** (Optional, if returning the created job)
```json
{
  "id": "uuid-new-job",
  "name": "Trigger Email",
  "endpoint": "https://service/email",
  "method": "POST",
  "status": "ACTIVE",
  "scheduleType": "RECURRING",
  "scheduleTime": "2026-03-15T09:00:00",
  "cronExpression": "0 0 9,13 * * ?",
  "timeZone": "Asia/Kolkata",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "payload": "{\"userId\": 123}",
  "createdAt": "2026-03-15T12:00:00",
  "lastRunTime": null,
  "lastRunStatus": null
}
```

**Example Request (One-Time Job):**
```json
{
  "name": "One-Time Backup",
  "endpoint": "https://api.example.com/backup",
  "method": "POST",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "payload": "{}",
  "scheduleType": "ONE_TIME",
  "scheduleTime": "2026-03-20T14:30:00",
  "timeZone": "America/New_York"
}
```

**Example Request (Recurring with Cron):**
```json
{
  "name": "Hourly Health Check",
  "endpoint": "https://api.example.com/health",
  "method": "GET",
  "headers": null,
  "payload": null,
  "scheduleType": "RECURRING",
  "cronExpression": "0 0 * * * ?",
  "timeZone": "UTC"
}
```

**Notes on Scheduling:**
- **Backend implementation note (current MVP)**: `scheduleTime` is **required for both** `"ONE_TIME"` **and** `"RECURRING"` jobs because the backend DTO has `scheduleTime` marked as `@NotNull`. The UI **must always send** a valid `scheduleTime` value for now, even for recurring jobs.
- **ONE_TIME**: Executes once at the specified `scheduleTime` (local time in the given `timeZone` or system default).
- **RECURRING**: If `cronExpression` is provided, uses it directly. Otherwise, generates from `scheduleConfig`.
- `scheduleConfig` allows UI to send user-friendly selections; backend converts to `cronExpression`.
- Examples:
  - Daily at 9 AM and 1 PM: `{"frequency": "DAILY", "times": ["09:00", "13:00"]}` → `"0 0 9,13 * * ?"`
  - Weekly on Mon/Wed at 10 AM: `{"frequency": "WEEKLY", "daysOfWeek": ["MON", "WED"], "times": ["10:00"]}` → `"0 0 10 ? * MON,WED"`
  - Custom: Provide `cronExpression` directly, e.g., `"0 0 9 * * ?"`
- If both `cronExpression` and `scheduleConfig` are provided, `cronExpression` takes precedence.

### **2.4. Update existing Job**
- **Endpoint**: `PUT /jobs/{id}`
- **Purpose**: Update configuration of an existing job.

**Request Body (JSON):** Same fields as Create Job. Only provide fields to update; others remain unchanged.

**Example Request (Update to Weekly Schedule):**
```json
{
  "name": "Updated Weekly Report",
  "scheduleType": "RECURRING",
  "scheduleConfig": {
    "frequency": "WEEKLY",
    "daysOfWeek": ["MON", "FRI"],
    "times": ["08:00"]
  },
  "timeZone": "UTC"
}
```

**Response Body (JSON):** (Optional, if returning the updated job)
```json
{
  "id": "uuid-job-id",
  "name": "Updated Weekly Report",
  "endpoint": "https://service/email",
  "method": "POST",
  "status": "ACTIVE",
  "scheduleType": "RECURRING",
  "scheduleTime": "2026-03-15T09:00:00",
  "cronExpression": "0 0 8 ? * MON,FRI",
  "timeZone": "UTC",
  "headers": "{\"Authorization\": \"Bearer token\"}",
  "payload": "{\"userId\": 123}",
  "createdAt": "2026-03-15T12:00:00",
  "lastRunTime": "2026-03-14T10:00:00",
  "lastRunStatus": "SUCCESS"
}
```

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
