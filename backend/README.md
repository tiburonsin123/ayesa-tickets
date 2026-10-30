# Backend: API de tickets y control de horas

API REST en **Java 17 + Spring Boot 3 + PostgreSQL**. No tiene pantallas: recibe peticiones HTTP del
frontend (React) y responde con **JSON**.

> Este es un **esqueleto inicial**. Incluye la gestión de tickets (crear, listar, editar, cambiar estado)
> y los catálogos. **Aún no está compilado ni probado**; es la base para que Alex continúe.

## Cómo correrlo

Requisitos: JDK 17, Maven y Docker.

```bash
docker compose up -d          # levanta PostgreSQL en el puerto 5432
mvn spring-boot:run           # levanta la API en http://localhost:8080/api
```

Swagger (documentación y pruebas de los endpoints): http://localhost:8080/api/swagger-ui.html

Al iniciar con la base vacía se crean usuarios y clientes de ejemplo (ver `config/DatosDePrueba.java`).

## Endpoints implementados

| Método | URL | Qué hace | Cuerpo |
|---|---|---|---|
| GET | `/api/tickets` | Lista todos los tickets | — |
| POST | `/api/tickets` | Crea un ticket (devuelve 201) | `TicketRequest` |
| PUT | `/api/tickets/{id}` | Edita un ticket | `TicketRequest` |
| PATCH | `/api/tickets/{id}/estado` | Cambia el estado (Kanban) | `{ "estado": "EN_CURSO" }` |
| GET | `/api/clientes` | Lista de nombres de clientes | — |
| GET | `/api/consultores` | Consultores `{id, nombre, equipo}` | — |
| GET | `/api/proyectos` | Proyectos usados en tickets | — |

### Crear un ticket

Solo son obligatorios **codigoExterno, titulo, tipo y cliente**. El resto se completa después con `PUT`.

```json
POST /api/tickets
{
  "codigoExterno": "TOYOTA-884",
  "titulo": "Ajuste de interfaces de facturación",
  "tipo": "REQUERIMIENTO",
  "cliente": "Toyota"
}
```

Reglas ya implementadas: código único (409 si se repite), fecha cliente no anterior a la interna,
horas estimadas mayores a 0, estado inicial PENDIENTE, `fechaCierre` automática al pasar a CERRADO.
Los errores salen como `{ "message": "..." }`.

## Estructura

```
domain/       entidades JPA (Ticket, Cliente, Usuario) y enums
repository/   acceso a la base de datos (Spring Data)
dto/          formas de los JSON de entrada y salida (los mismos nombres que usa el frontend)
service/      reglas de negocio
web/          controladores REST y manejo de errores
config/       CORS y datos de prueba
```

## Lo que falta (en este orden sugerido)

1. **Login con JWT**: `POST /api/auth/login` → `{ token, usuario: { id, nombre, email, rol } }`, con
   Spring Security y contraseñas con BCrypt. Hoy los usuarios guardan la contraseña en texto plano (solo pruebas).
2. **Permisos por rol**: solo COORDINADOR crea/edita tickets (`@PreAuthorize`); el CONSULTOR solo ve lo suyo.
3. `GET /api/tickets/mis`: tickets del usuario autenticado.
4. **Horas** (pantalla "Resumen de Horas"), contratos en el documento de la reunión:
   - `GET /api/horas/dia?fecha=YYYY-MM-DD`
   - `GET /api/horas/semana?desde=YYYY-MM-DD`
   - `POST /api/horas/planificacion` (tope de 8 h por día, sin tickets duplicados el mismo día)
   - `POST /api/horas/reales` (suma a `horasConsumidas` del ticket)
5. Ocultar del Kanban los tickets cerrados hace más de 7 días (sin borrarlos).
6. Migraciones con Flyway en lugar de `ddl-auto: update`.

## Preguntas abiertas con el frontend

- `tipo` y `cliente` viajan hoy como **texto** (el cliente se crea si no existe). Si prefieren ids, hay que avisar.
- `prioridad` y `proyecto` no están en el documento de la reunión; el diseño del frontend los usa. Confirmar con Roger.
- Ver el archivo `src/services/` del frontend: ahí están todas las llamadas que espera.
