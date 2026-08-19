# VentasPlatform

Plataforma de gestion de ventas y productos.

## URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend (Angular) | https://ventas-platform.vercel.app | Activo |
| Backend API (Spring Boot) | https://ventas-platform-api.onrender.com | Pendiente deploy |
| Base de Datos (Neon PostgreSQL) | neon.tech | Activo |

## Credenciales Demo

| Email | Password | Rol |
|-------|----------|-----|
| admin@ventas.com | password123 | ADMIN |
| vendedor@ventas.com | password123 | USER |

## Endpoints API

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| /api/auth/login | POST | Iniciar sesion |
| /api/auth/register | POST | Registrar usuario |
| /api/products | GET | Listar productos |
| /api/products/{id} | GET | Obtener producto |
| /api/products | POST | Crear producto |
| /api/products/{id} | PUT | Actualizar producto |
| /api/products/{id} | DELETE | Eliminar producto |
| /api/products/stats | GET | Estadisticas productos |
| /api/orders | GET | Listar ordenes |
| /api/orders/{id} | GET | Obtener orden |
| /api/orders | POST | Crear orden |
| /api/orders/{id}/status | PATCH | Actualizar estado |
| /api/orders/stats | GET | Estadisticas ordenes |
| /ws | WebSocket | Tiempo real |

## Stack Tecnologico

- **Frontend**: Angular 20 + NgRx + ag-Grid + Tailwind CSS
- **Backend**: Spring Boot 3.3 (Java 20)
- **DB**: Neon PostgreSQL (serverless)
- **Auth**: JWT (JSON Web Token)
- **Deploy**: Vercel (frontend) + Render (backend)

## Deploy

### Frontend
Automatico via Vercel cada push a `master`.

### Backend
1. Ir a https://dashboard.render.com
2. New > Blueprint
3. Seleccionar repo `cesarm29/ventas-platform`
4. Configurar variable de entorno `DATABASE_URL`
5. Deploy
