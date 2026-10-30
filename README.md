# AYESA Tickets

Aplicación web para gestionar tickets (incidencias y requerimientos) y registrar las horas de los consultores.

- **Coordinador:** crea y asigna tickets, ve el Kanban general.
- **Consultor:** planifica su día, registra horas reales y mueve sus tickets en el Kanban.

## Estructura

| Carpeta | Contenido | Responsable |
|---|---|---|
| `frontend/` | React + JavaScript (Vite) | Reinaldo |
| `backend/` | Java 17 + Spring Boot + PostgreSQL | Alex |
| `docs/` | `API-contrato.md`: qué recibe y devuelve cada endpoint | Ambos |

## Cómo correr

**Frontend** (usa datos simulados hasta que el backend esté listo):
```bash
cd frontend
cp .env.example .env     # en Windows: copy .env.example .env
npm install
npm run dev              # http://localhost:5173
```
Usuarios de prueba (contraseña `1234`): `coordinador@ayesa.com` y `juan@ayesa.com`.

**Backend:** ver `backend/README.md`.

Para conectar el frontend con el backend real: en `frontend/.env` poner `VITE_USE_MOCK=false`.

## Flujo de trabajo con Git

- `main`: código estable. No se sube directo.
- `develop`: integración.
- Una rama por funcionalidad (`feature/nombre`) y Pull Request hacia `develop`, revisado por el otro.
- Cambios en la API: primero se actualiza `docs/API-contrato.md` y luego el código.
