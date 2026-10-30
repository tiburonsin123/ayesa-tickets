import { hoy } from "../utils/fechas";
import api, { USE_MOCK } from "../api/client";
import { ticketsMock, consultoresMock, clientesMock, proyectosMock } from "../mocks/data";

// Se opera sobre el arreglo mock (compartido con horasService) mientras no hay backend
const tickets = ticketsMock;
const delay = (v) => new Promise((r) => setTimeout(() => r(v), 150));

// GET /tickets
export async function getTickets() {
  if (USE_MOCK) return delay(tickets.map((t) => ({ ...t })));
  return (await api.get("/tickets")).data;
}

// POST /tickets  (codigoExterno lo escribe el coordinador, no es autoincremental)
export async function createTicket(ticket) {
  if (USE_MOCK) {
    if (tickets.some((t) => t.codigoExterno.toLowerCase() === ticket.codigoExterno.toLowerCase()))
      throw new Error("Ya existe un ticket con ese código");
    const id = Math.max(0, ...tickets.map((t) => t.id)) + 1;
    const nuevo = { prioridad: "MEDIA", ...ticket, id, horasConsumidas: 0, ultimoComentario: "", fechaCreacion: hoy(), fechaCierre: null };
    tickets.unshift(nuevo);
    return delay({ ...nuevo });
  }
  return (await api.post("/tickets", ticket)).data;
}

// PUT /tickets/{id}  (edicion completa de los datos del ticket)
export async function updateTicket(id, datos) {
  if (USE_MOCK) {
    const t = tickets.find((x) => x.id === id);
    if (tickets.some((x) => x.id !== id && x.codigoExterno.toLowerCase() === datos.codigoExterno.toLowerCase()))
      throw new Error("Ya existe un ticket con ese código");
    const fechaCierre = datos.estado === "CERRADO" ? t.fechaCierre || hoy() : null;
    Object.assign(t, datos, { fechaCierre });
    return delay({ ...t });
  }
  return (await api.put(`/tickets/${id}`, datos)).data;
}

// PATCH /tickets/{id}/estado  { estado }
export async function updateEstado(id, estado) {
  if (USE_MOCK) {
    const fechaCierre = estado === "CERRADO" ? hoy() : null;
    const t = tickets.find((x) => x.id === id);
    Object.assign(t, { estado, fechaCierre });
    return delay({ ...t });
  }
  return (await api.patch(`/tickets/${id}/estado`, { estado })).data;
}

// GET /consultores
export async function getConsultores() {
  if (USE_MOCK) return delay(consultoresMock);
  return (await api.get("/consultores")).data;
}

// GET /clientes y /proyectos
export async function getClientes() {
  if (USE_MOCK) return delay(clientesMock);
  return (await api.get("/clientes")).data;
}
export async function getProyectos() {
  if (USE_MOCK) return delay(proyectosMock);
  return (await api.get("/proyectos")).data;
}

// GET /tickets/mis  (el backend toma el usuario del token)
export async function getMisTickets(usuarioId) {
  if (USE_MOCK) return delay(tickets.filter((t) => t.usuarioAsignadoId === usuarioId).map((t) => ({ ...t })));
  return (await api.get("/tickets/mis")).data;
}
