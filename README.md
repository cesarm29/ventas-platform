# VentasPlatform

Plataforma de gestion de ventas y productos.

## URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend (Angular) | https://ventas-platform.vercel.app | Activo |
| Backend API (Spring Boot) | https://ventas-platform-api.onrender.com | Activo |
| Base de Datos (Neon PostgreSQL) | neon.tech | Activo |

## Credenciales Demo

| Email | Password | Rol |
|-------|----------|-----|
| admin@ventas.com | password123 | ADMIN |
| vendedor@ventas.com | password123 | USER |

Los usuarios se crean automaticamente al iniciar el backend (DataSeeder). Si las credenciales no funcionan, el DataSeeder resetea las passwords al siguiente deploy.

## Endpoints API

| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| /api/auth/login | POST | No | Iniciar sesion |
| /api/auth/register | POST | No | Registrar usuario |
| /api/products | GET | Si | Listar productos |
| /api/products/{id} | GET | Si | Obtener producto |
| /api/products | POST | Si | Crear producto (ADMIN) |
| /api/products/{id} | PUT | Si | Actualizar producto (ADMIN) |
| /api/products/{id} | DELETE | Si | Eliminar producto (ADMIN) |
| /api/products/stats | GET | Si | Estadisticas productos |
| /api/orders | GET | Si | Listar ordenes |
| /api/orders/{id} | GET | Si | Obtener orden |
| /api/orders | POST | Si | Crear orden |
| /api/orders/{id}/status | PATCH | Si | Actualizar estado |
| /api/orders/stats | GET | Si | Estadisticas ordenes |
| /actuator/health | GET | No | Health check |

## Stack Tecnologico

- **Frontend**: Angular 20 + NgRx + ag-Grid + Tailwind CSS v4
- **Backend**: Spring Boot 3.3.2 (Java 20)
- **DB**: Neon PostgreSQL (serverless)
- **Auth**: JWT (JSON Web Token) + BCrypt
- **Deploy**: Vercel (frontend) + Render (backend)

## Deploy

### Frontend
Automatico via Vercel cada push a `master`.

### Backend
Automatico via Render cada push a `master`.
El `start.sh` convierte `DATABASE_URL` (postgresql://) a `SPRING_DATASOURCE_URL` (jdbc:postgresql://).

### Base de Datos
1. Neon PostgreSQL: Base de datos `ventas_db` en proyecto Neon existente
2. Tablas creadas por Hibernate (`ddl-auto: update`)
3. Usuarios demo creados por `DataSeeder` al arrancar
