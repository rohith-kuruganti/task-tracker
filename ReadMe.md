# Task Tracker API

This is a backend API for managing tasks in a team-based environment. It supports authentication, role-based access control, task workflows, caching using Redis, and Docker-based deployment.

---

## 🚀 How to Run the Project

The easiest way to run this project:

```bash
docker compose up
```

This will start:

- Node.js backend server
- MongoDB connection (if configured)
- Redis server for caching

API will run on:

```
http://localhost:7777
```

---

## 🔐 Authentication

The system uses JWT-based authentication.

Roles supported:

- ADMIN → full access
- MANAGER → manage tasks & users in organization
- MEMBER → only assigned tasks

---

## 📌 Main Features

- User registration & login
- Role-based access control (RBAC middleware)
- Task CRUD operations
- Task status workflow:

  ```
  TODO → IN_PROGRESS → IN_REVIEW → DONE
  TODO → BLOCKED (from any state)
  ```

- Pagination + filtering (status, priority, assignee)
- Redis caching for task list API
- Dockerized setup

---

## ⚡ Caching Strategy

Task list API is cached based on:

- organizationId
- userId
- filters (status, priority, assignee)
- pagination (page, limit)

Cache TTL: 5 minutes

### Invalidation strategy:

Cache is cleared when:

- task is created
- task is updated
- task is deleted
- task status is changed

This ensures users always get fresh data after mutations.

---

## 🗄️ Database Design

- MongoDB used with Mongoose
- Indexes added on:

  - organizationId + assignee
  - status
  - due_date

These improve performance for filtering and listing tasks.

---

## 🧠 Design Decisions

- Chose Redis for caching list APIs to reduce DB load
- Used role-based middleware instead of controller checks for cleaner architecture
- Task status transitions are enforced server-side to prevent invalid updates

---

## 📦 What I Would Improve With More Time

- Add unit/integration tests
- Add WebSocket notifications for task updates
- Improve analytics (task completion metrics)
- Add rate limiting for auth endpoints
- Add CI/CD pipeline

---

## 📮 Postman Collection

Import the Postman collection located in:

```
/postman/Task_Tracker_API.postman_collection.json
```

---

## 🐳 Deployment

Fully containerized using Docker.

Run:

```bash
docker compose up
```

No manual setup required.

---
