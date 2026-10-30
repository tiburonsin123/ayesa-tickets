import api, { USE_MOCK } from "../api/client";
import { addDias, hoy, lunesDe, semanaLaboral } from "../utils/fechas";
import { ticketsMock } from "../mocks/data";

export const HORAS_DIA_MAX = 8;
export const DAILY_HORAS = 1;

const delay = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));

// ---- Mock en memoria: { "usuarioId|fecha": { dailyCerrado, items: [...] } } ----
const dias = {};
let nextId = 5000;
const clave = (u, f) => `${u}|${f}`;

function sembrar() {
  const lunes = lunesDe(hoy());
  const mk = (fecha, filas) => {
    dias[clave(1, fecha)] = {
      dailyCerrado: true,
      items: filas.map(([ticketId, horasPlanificadas, horasReales, comentario], i) => ({
        id: nextId++, ticketId, esDaily: ticketId === null, orden: i + 1, horasPlanificadas, horasReales, comentario,
      })),
    };
  };
  if (lunes < hoy()) mk(lunes, [[null, 1, 1, "Reuniones / Soporte"], [4, 4, 4, "Desarrollo de lógica ABAP"], [3, 3, 3, ""]]);
  if (addDias(lunes, 1) < hoy()) mk(addDias(lunes, 1), [[null, 1, 1, ""], [4, 5, 4.5, "Pruebas unitarias"], [10, 2, 2, ""]]);
}
if (USE_MOCK) sembrar();

const plantilla = () => ({
  dailyCerrado: false,
  items: [{ id: null, ticketId: null, esDaily: true, orden: 1, horasPlanificadas: DAILY_HORAS, horasReales: 0, comentario: "" }],
});

// GET /horas/dia?fecha=YYYY-MM-DD  -> { fecha, dailyCerrado, items }
// (si el dia no existe, el frontend precarga el Daily de 1h; a confirmar si lo genera el backend)
export async function getDia(usuarioId, fecha) {
  if (USE_MOCK) return delay({ fecha, ...(dias[clave(usuarioId, fecha)] || plantilla()) });
  return (await api.get("/horas/dia", { params: { fecha } })).data;
}

// GET /horas/semana?desde=lunes -> [{ fecha, planificadas, reales }]
export async function getSemana(usuarioId, lunes) {
  if (USE_MOCK) {
    return delay(
      semanaLaboral(lunes).map((fecha) => {
        const items = dias[clave(usuarioId, fecha)]?.items || [];
        return {
          fecha,
          planificadas: items.reduce((s, i) => s + i.horasPlanificadas, 0),
          reales: items.reduce((s, i) => s + i.horasReales, 0),
        };
      })
    );
  }
  return (await api.get("/horas/semana", { params: { desde: lunes } })).data;
}

// POST /horas/planificacion  (payload A del documento + cerrarDaily)
// { usuarioId, fecha, cerrarDaily, items: [{ ticketId, orden, horasPlanificadas, esDaily }] }
export async function guardarPlanificacion(payload) {
  if (USE_MOCK) {
    const k = clave(payload.usuarioId, payload.fecha);
    const previo = dias[k]?.items || [];
    dias[k] = {
      dailyCerrado: payload.cerrarDaily,
      items: payload.items.map((it) => {
        const ant = previo.find((p) => p.ticketId === (it.esDaily ? null : it.ticketId));
        return {
          id: ant?.id ?? nextId++,
          ticketId: it.esDaily ? null : it.ticketId,
          esDaily: it.esDaily,
          orden: it.orden,
          horasPlanificadas: it.horasPlanificadas,
          horasReales: ant?.horasReales ?? 0,
          comentario: ant?.comentario ?? "",
        };
      }),
    };
    return delay({ fecha: payload.fecha, ...dias[k] });
  }
  return (await api.post("/horas/planificacion", payload)).data;
}

// POST /horas/reales  (payload B)
// { usuarioId, fecha, imputaciones: [{ registroId, horasReales, comentario }] }
export async function guardarReales(payload) {
  if (USE_MOCK) {
    const dia = dias[clave(payload.usuarioId, payload.fecha)];
    payload.imputaciones.forEach((im) => {
      const it = dia.items.find((x) => x.id === im.registroId);
      if (!it) return;
      const ticket = ticketsMock.find((t) => t.id === it.ticketId);
      if (ticket) {
        ticket.horasConsumidas = Math.max(0, ticket.horasConsumidas + im.horasReales - it.horasReales);
        if (im.comentario) ticket.ultimoComentario = im.comentario;
      }
      it.horasReales = im.horasReales;
      it.comentario = im.comentario;
    });
    return delay({ fecha: payload.fecha, ...dia });
  }
  return (await api.post("/horas/reales", payload)).data;
}
