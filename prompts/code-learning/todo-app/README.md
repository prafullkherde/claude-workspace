# TodoApp — Production-Grade Full Stack Todo Application

A full-featured todo application built with Spring Boot 3.2 + React 18 + PostgreSQL.

## Features

- JWT authentication (register / login / logout)
- Default sections: Family, Office, Personal (seeded on registration)
- User-created custom sections (with delete protection for defaults)
- Tasks with title, description, priority (URGENT/HIGH/MEDIUM/LOW), due date, completion toggle, and section assignment
- 1-level-deep subtasks: add, inline-edit, toggle, delete
- Full CRUD for tasks, subtasks, and sections
- Tasks filtered by section via sidebar
- Priority color coding (red=URGENT, orange=HIGH, blue=MEDIUM, gray=LOW)
- Overdue date highlighting
- Responsive UI with Tailwind CSS

---

## Quick Start (Docker Compose)

```bash
# From the todo-app directory
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

---

## Local Development

### Prerequisites

- Java 21+
- Maven 3.9+
- Node 20+
- PostgreSQL 16 (or use the Docker postgres service)

### Start PostgreSQL only

```bash
docker-compose up postgres -d
```

### Backend

```bash
cd backend
mvn spring-boot:run
# API runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI runs on http://localhost:5173
```

---

## Environment Variables

| Variable     | Default                                | Description                        |
|--------------|----------------------------------------|------------------------------------|
| `DB_URL`     | `jdbc:postgresql://localhost:5432/tododb` | PostgreSQL JDBC URL             |
| `DB_USER`    | `todo`                                 | Database username                  |
| `DB_PASS`    | `todo`                                 | Database password                  |
| `JWT_SECRET` | (insecure dev default)                 | HMAC-SHA256 signing key (min 32 chars) |

---

## API Endpoints

### Auth

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | `/api/auth/register`  | Register new user    | No   |
| POST   | `/api/auth/login`     | Login, get JWT token | No   |

### Sections

| Method | Endpoint               | Description              | Auth |
|--------|------------------------|--------------------------|------|
| GET    | `/api/sections`        | Get all sections for user | Yes |
| POST   | `/api/sections`        | Create custom section    | Yes  |
| DELETE | `/api/sections/{id}`   | Delete custom section    | Yes  |

### Tasks

| Method | Endpoint                   | Description                    | Auth |
|--------|----------------------------|--------------------------------|------|
| GET    | `/api/tasks`               | Get all tasks (optional `?sectionId=`) | Yes |
| GET    | `/api/tasks/{id}`          | Get single task                | Yes  |
| POST   | `/api/tasks`               | Create task                    | Yes  |
| PUT    | `/api/tasks/{id}`          | Update task                    | Yes  |
| DELETE | `/api/tasks/{id}`          | Delete task                    | Yes  |
| PATCH  | `/api/tasks/{id}/toggle`   | Toggle completion              | Yes  |

### Subtasks

| Method | Endpoint                                      | Description             | Auth |
|--------|-----------------------------------------------|-------------------------|------|
| GET    | `/api/tasks/{taskId}/subtasks`                | List subtasks           | Yes  |
| POST   | `/api/tasks/{taskId}/subtasks`                | Add subtask             | Yes  |
| PUT    | `/api/tasks/{taskId}/subtasks/{id}`           | Update subtask title    | Yes  |
| DELETE | `/api/tasks/{taskId}/subtasks/{id}`           | Delete subtask          | Yes  |
| PATCH  | `/api/tasks/{taskId}/subtasks/{id}/toggle`    | Toggle subtask complete | Yes  |

---

## Tech Stack

### Backend
- Spring Boot 3.2.3
- Spring Security 6 + JWT (jjwt 0.12.3)
- Spring Data JPA + Hibernate
- PostgreSQL 16
- Lombok
- Maven

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- TanStack Query v5
- React Hook Form + Zod
- Axios
- React Router v6
- Lucide React

### Infrastructure
- Docker + Docker Compose
- Nginx (frontend reverse proxy)

---

## Running Tests

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```
