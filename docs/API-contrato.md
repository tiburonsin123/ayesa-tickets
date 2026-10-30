# Contrato de la API: AYESA Tickets

Este documento define **qué recibe y qué devuelve cada endpoint**. El frontend (React) ya está
construido contra este contrato, así que el backend debe respetar las URLs y los nombres de campo tal cual.

## Reglas generales

- **URL base:** `http://localhost:8080/api`
- **Formato:** JSON en peticiones y respuestas (`Content-Type: application/json`).
- **Fechas:** texto `"YYYY-MM-DD"` (ej. `"2026-10-30"`). Sin hora.
- **Horas:** números, admiten decimales (`1.5`, `4`).
- **Autenticación:** todos los endpoints, salvo el login, requieren la cabecera
  `Authorization: Bearer <token>`. El backend toma el usuario **del token**; nunca del cuerpo de la petición.
- **Errores:** siempre con este formato, que es el que muestra el frontend:

  ```json
  { "message": "Texto legible para el usuario" }
  ```

  | Código | Cuándo |
  |---|---|
  | 400 | Datos inválidos (campo obligatorio vacío, fecha cliente anterior a la interna, más de 8 h, etc.) |
  | 401 | Sin token, token vencido o credenciales incorrectas |
  | 403 | El rol no tiene permiso (ej. un consultor intenta crear un ticket) |
  | 404 | El recurso no existe |
  | 409 | Conflicto (ej. código de ticket repetido) |

- **Valores fijos (enums):**
  - `rol`: `COORDINADOR`, `CONSULTOR`
  - `tipo`: `INCIDENCIA`, `REQUERIMIENTO`, `PROYECTO`
  - `estado`: `PENDIENTE`, `EN_CURSO`, `TERCEROS`, `BLOQUEADO`, `CERRADO`
  - `prioridad`: `ALTA`, `MEDIA`, `BAJA`

---

## El objeto Ticket

Así se ve un ticket en **todas** las respuestas:

```json
{
  "id": 17,
  "codigoExterno": "TOYOTA-884",
  "titulo": "Ajuste de interfaces de facturación",
  "tipo": "REQUERIMIENTO",
  "estado": "EN_CURSO",
  "cliente": "Toyota",
  "usuarioAsignadoId": 2,
  "horasEstimadas": 16.0,
  "horasConsumidas": 4.5,
  "fechaEntregaInterna": "2026-10-28",
  "fechaEntregaCliente": "2026-10-30",
  "prioridad": "ALTA",
  "proyecto": "Integraciones",
  "descripcion": "Texto largo opcional",
  "ultimoComentario": "Pendiente pruebas unitarias.",
  "fechaCreacion": "2026-10-20",
  "fechaCierre": null
}
```

| Campo | Tipo | ¿Puede ser null? | Notas |
|---|---|---|---|
| `id` | número | No | Lo genera el backend |
| `codigoExterno` | texto | No | Único. Lo escribe el coordinador (`JIRA-504`). **No es autoincremental** |
| `titulo` | texto | No | Nombre o descripción corta |
| `tipo` | enum | No | |
| `estado` | enum | No | Al crear: `PENDIENTE` |
| `cliente` | **texto** (nombre) | No | Si no existe, el backend lo crea |
| `usuarioAsignadoId` | número | **Sí** | Ticket sin asignar |
| `horasEstimadas` | número | **Sí** | Debe ser > 0 si viene |
| `horasConsumidas` | número | No | Suma de horas reales registradas. Empieza en 0 |
| `fechaEntregaInterna` | fecha | **Sí** | |
| `fechaEntregaCliente` | fecha | **Sí** | No puede ser anterior a la interna |
| `prioridad` | enum | **Sí** | |
| `proyecto` | texto | **Sí** | |
| `descripcion` | texto | **Sí** | |
| `ultimoComentario` | texto | **Sí** | Último comentario guardado en horas reales (máx. 120 caracteres) |
| `fechaCreacion` | fecha | No | La pone el backend |
| `fechaCierre` | fecha | **Sí** | La pone el backend al pasar a `CERRADO`; vuelve a `null` si se reabre |

---

## 1. Login

### `POST /auth/login` (sin token)

**Petición**
```json
{ "email": "juan@ayesa.com", "password": "1234" }
```

**Respuesta 200**
```json
{
  "token": "eyJhbGciOi...",
  "usuario": { "id": 1, "nombre": "Juan Pérez", "email": "juan@ayesa.com", "rol": "CONSULTOR" }
}
```
Credenciales incorrectas → `401` con `{ "message": "Credenciales incorrectas" }`.

---

## 2. Tickets

### `GET /tickets`: todos los tickets (solo COORDINADOR)
**Respuesta 200:** arreglo de Ticket. Incluye los tickets cerrados; el frontend oculta los de más de 7 días.

### `GET /tickets/mis`: tickets del usuario del token
**Respuesta 200:** arreglo de Ticket donde `usuarioAsignadoId` es el usuario autenticado.

### `POST /tickets`: crear (solo COORDINADOR)

**Obligatorios:** `codigoExterno`, `tipo`, `titulo`, `cliente`. Todo lo demás es opcional.

**Petición mínima**
```json
{
  "codigoExterno": "TOYOTA-884",
  "titulo": "Ajuste de interfaces de facturación",
  "tipo": "REQUERIMIENTO",
  "cliente": "Toyota"
}
```

**Petición completa** (lo que envía el formulario cuando se llenan los demás datos)
```json
{
  "codigoExterno": "TOYOTA-884",
  "titulo": "Ajuste de interfaces de facturación",
  "tipo": "REQUERIMIENTO",
  "cliente": "Toyota",
  "estado": "PENDIENTE",
  "prioridad": "MEDIA",
  "proyecto": "Integraciones",
  "usuarioAsignadoId": 2,
  "horasEstimadas": 16,
  "fechaEntregaInterna": "2026-10-28",
  "fechaEntregaCliente": "2026-10-30",
  "descripcion": "Detalle opcional"
}
```

**Respuesta 201:** el Ticket creado (con `id`, `fechaCreacion`, `horasConsumidas: 0`).

**Errores:** `409` código repetido · `400` campo obligatorio vacío, fecha cliente < interna, horas ≤ 0 ·
`403` si no es coordinador.

### `PUT /tickets/{id}`: editar (solo COORDINADOR)
Mismo cuerpo que `POST`. **Respuesta 200:** el Ticket actualizado.
`404` si no existe · `409` si el nuevo código ya lo tiene otro ticket.
Si el `estado` cambia a `CERRADO`, se llena `fechaCierre` (si no la tenía); si sale de `CERRADO`, vuelve a `null`.

### `PATCH /tickets/{id}/estado`: mover en el Kanban
- COORDINADOR: cualquier ticket.
- CONSULTOR: solo si el ticket está asignado a él (`403` en caso contrario).

**Petición**
```json
{ "estado": "EN_CURSO" }
```
**Respuesta 200:** el Ticket actualizado (con `fechaCierre` ajustada según la regla anterior).

---

## 3. Catálogos

### `GET /consultores`
```json
[ { "id": 1, "nombre": "Juan Pérez", "equipo": "EAM" } ]
```

### `GET /clientes`
Arreglo de **textos**:
```json
[ "Luz del Sur", "Enel", "Sedapal" ]
```

### `GET /proyectos`
Arreglo de **textos**:
```json
[ "Integraciones", "Mantenimiento" ]
```

---

## 4. Horas (pantalla "Resumen Horas" del consultor)

Todas actúan sobre el usuario del token. El consultor solo ve y edita lo suyo.

### Objeto "Día"

```json
{
  "fecha": "2026-10-30",
  "dailyCerrado": false,
  "items": [
    { "id": 5001, "ticketId": null, "esDaily": true,  "orden": 1, "horasPlanificadas": 1, "horasReales": 0, "comentario": "" },
    { "id": 5002, "ticketId": 17,   "esDaily": false, "orden": 2, "horasPlanificadas": 4, "horasReales": 0, "comentario": "" }
  ]
}
```
- La fila del Daily tiene `esDaily: true` y `ticketId: null`.
- `dailyCerrado`: cuando es `true` ya no se puede cambiar la planificación y se habilita registrar horas reales.

### `GET /horas/dia?fecha=2026-10-30`
**Respuesta 200:** objeto Día. Si ese día no tiene registros, devolver `dailyCerrado: false` y un solo item: el Daily con
`horasPlanificadas: 1`, `id: null` (decisión pendiente: si el backend lo crea o solo lo sugiere).

### `GET /horas/semana?desde=2026-10-26`
`desde` es el **lunes** de la semana. Devuelve los 5 días laborales:
```json
[
  { "fecha": "2026-10-26", "planificadas": 8, "reales": 8 },
  { "fecha": "2026-10-27", "planificadas": 8, "reales": 6.5 },
  { "fecha": "2026-10-28", "planificadas": 0, "reales": 0 },
  { "fecha": "2026-10-29", "planificadas": 0, "reales": 0 },
  { "fecha": "2026-10-30", "planificadas": 0, "reales": 0 }
]
```

### `POST /horas/planificacion`: guardar la planificación del día

**Petición**
```json
{
  "fecha": "2026-10-30",
  "cerrarDaily": false,
  "items": [
    { "ticketId": null, "orden": 1, "horasPlanificadas": 1, "esDaily": true },
    { "ticketId": 17,   "orden": 2, "horasPlanificadas": 4, "esDaily": false }
  ]
}
```
- `cerrarDaily: true` cierra el Daily (habilita las horas reales). Enviar `false` lo **reabre**.
- El frontend también manda `usuarioId`; el backend debe **ignorarlo** y usar el del token.
- Esta llamada **reemplaza** los items del día. Los que ya tenían `horasReales` o `comentario` los conservan.

**Respuesta 200:** objeto Día (ahora con los `id` de cada fila).

**Reglas y errores `400`:**
- La suma de `horasPlanificadas` del día no puede superar **8** (pendiente de confirmar con Roger si será estricto).
- Un mismo `ticketId` no puede aparecer dos veces en el día.
- Cada ticket (no Daily) debe tener `horasPlanificadas` > 0.
- Solo se pueden planificar tickets asignados al usuario y no cerrados.

### `POST /horas/reales`: guardar horas reales y comentarios

**Petición**
```json
{
  "fecha": "2026-10-30",
  "imputaciones": [
    { "registroId": 5001, "horasReales": 1, "comentario": "Daily habitual" },
    { "registroId": 5002, "horasReales": 5.5, "comentario": "Complejidad mayor en el backend" }
  ]
}
```
- `comentario`: máximo **120** caracteres.
- Solo funciona si el día tiene `dailyCerrado: true`; si no, `400`.
- Por cada fila de un ticket, el backend actualiza `horasConsumidas` del ticket (suma de todas sus horas reales)
  y `ultimoComentario` si el comentario no viene vacío.

**Respuesta 200:** objeto Día actualizado.

---

## Cálculo del ETC

El frontend lo calcula como `horasEstimadas - horasConsumidas` (mínimo 0). No hace falta enviarlo.
Queda pendiente confirmar la fórmula con Roger; si cambia, se avisa.

## Pendiente de confirmar con Roger (puede cambiar el contrato)

1. ¿El tope de 8 h por día es estricto o solo una advertencia?
2. ¿Cuántos días hacia atrás puede un consultor editar horas?
3. ¿Se pueden anular tickets? (habría un estado nuevo o un `DELETE`)
4. ¿`prioridad` y `proyecto` se quedan en el ticket?
5. ¿Quién crea el Daily de 1 h: el backend o solo se sugiere en pantalla?
