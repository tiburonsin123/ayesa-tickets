import { parse, toISO, addDias, diffDias, lunesDe, hoy } from "../utils/fechas";

export const ESTADOS = [
  { id: "PENDIENTE", label: "PENDIENTE", color: "#64748b" },
  { id: "EN_CURSO", label: "EN CURSO", color: "#2563eb" },
  { id: "TERCEROS", label: "TERCEROS", color: "#7c3aed" },
  { id: "BLOQUEADO", label: "BLOQUEADO", color: "#dc2626" },
  { id: "CERRADO", label: "CERRADO", color: "#16a34a" },
];
export const TIPOS = [
  { id: "INCIDENCIA", label: "Incidencia" },
  { id: "REQUERIMIENTO", label: "Requerimiento" },
  { id: "PROYECTO", label: "Proyecto" },
];
export const PRIORIDADES = [
  { id: "ALTA", label: "Alta", color: "#dc2626" },
  { id: "MEDIA", label: "Media", color: "#f59e0b" },
  { id: "BAJA", label: "Baja", color: "#64748b" },
];

export const usuariosMock = [
  { id: 100, nombre: "Pedro Castillo", email: "coordinador@ayesa.com", password: "1234", rol: "COORDINADOR" },
];

export const consultoresMock = [
  { id: 1, nombre: "Juan Pérez", equipo: "EAM" },
  { id: 2, nombre: "María Gómez", equipo: "ABAP" },
  { id: 3, nombre: "Luis Rojas", equipo: "CPI" },
  { id: 4, nombre: "Ana Torres", equipo: "ABAP" },
];

export const clientesMock = ["Luz del Sur", "Enel", "Sedapal"];
export const proyectosMock = ["Integraciones", "Mantenimiento", "Migración", "Soporte"];

export const ticketsMock = [
  { id: 1, codigoExterno: "REQ-032", titulo: "Mejora reportes PM", tipo: "REQUERIMIENTO", cliente: "Luz del Sur", proyecto: "Mantenimiento", prioridad: "ALTA", estado: "PENDIENTE", usuarioAsignadoId: 2, horasEstimadas: 40, horasConsumidas: 0, fechaEntregaInterna: "2025-05-16", fechaEntregaCliente: "2025-05-18", descripcion: "Mejoras sobre los reportes de mantenimiento preventivo." },
  { id: 2, codigoExterno: "INC-101", titulo: "Error en OC", tipo: "INCIDENCIA", cliente: "Enel", proyecto: "Soporte", prioridad: "MEDIA", estado: "PENDIENTE", usuarioAsignadoId: 4, horasEstimadas: 8, horasConsumidas: 0, fechaEntregaInterna: "2025-05-15", fechaEntregaCliente: "2025-05-16", descripcion: "Error al generar órdenes de compra." },
  { id: 3, codigoExterno: "REQ-041", titulo: "Nuevo campo EAM", tipo: "REQUERIMIENTO", cliente: "Sedapal", proyecto: "Mantenimiento", prioridad: "BAJA", estado: "PENDIENTE", usuarioAsignadoId: 1, horasEstimadas: 32, horasConsumidas: 0, fechaEntregaInterna: "2025-05-18", fechaEntregaCliente: "2025-05-20", descripcion: "Agregar campo personalizado a equipos EAM." },
  { id: 4, codigoExterno: "REQ-001", titulo: "Integración SAP-CPI", tipo: "REQUERIMIENTO", cliente: "Luz del Sur", proyecto: "Integraciones", prioridad: "ALTA", estado: "EN_CURSO", usuarioAsignadoId: 1, horasEstimadas: 60, horasConsumidas: 36, fechaEntregaInterna: "2025-05-18", fechaEntregaCliente: "2025-05-20", descripcion: "Desarrollo de interface CPI para integración con sistema externo de proveedores." },
  { id: 5, codigoExterno: "INC-005", titulo: "Usuario sin acceso", tipo: "INCIDENCIA", cliente: "Enel", proyecto: "Soporte", prioridad: "MEDIA", estado: "EN_CURSO", usuarioAsignadoId: 4, horasEstimadas: 6, horasConsumidas: 5, fechaEntregaInterna: "2025-05-14", fechaEntregaCliente: "2025-05-15", descripcion: "Usuario no puede ingresar a Fiori." },
  { id: 6, codigoExterno: "REQ-006", titulo: "Ajuste en Fiori", tipo: "REQUERIMIENTO", cliente: "Sedapal", proyecto: "Soporte", prioridad: "ALTA", estado: "EN_CURSO", usuarioAsignadoId: 2, horasEstimadas: 16, horasConsumidas: 6, fechaEntregaInterna: "2025-05-22", fechaEntregaCliente: "2025-05-24", descripcion: "Ajustes visuales y de flujo en app Fiori." },
  { id: 7, codigoExterno: "REQ-009", titulo: "Validación funcional", tipo: "REQUERIMIENTO", cliente: "Luz del Sur", proyecto: "Migración", prioridad: "MEDIA", estado: "EN_CURSO", usuarioAsignadoId: 3, horasEstimadas: 28, horasConsumidas: 8, fechaEntregaInterna: "2025-05-22", fechaEntregaCliente: "2025-05-25", descripcion: "Validación funcional de la migración." },
  { id: 8, codigoExterno: "REQ-015", titulo: "Desarrollo externo", tipo: "REQUERIMIENTO", cliente: "Enel", proyecto: "Integraciones", prioridad: "MEDIA", estado: "TERCEROS", usuarioAsignadoId: 3, horasEstimadas: 24, horasConsumidas: 12, fechaEntregaInterna: "2025-05-19", fechaEntregaCliente: "2025-05-21", descripcion: "Desarrollo a cargo de proveedor externo." },
  { id: 9, codigoExterno: "INC-006", titulo: "Acceso a ambientes", tipo: "INCIDENCIA", cliente: "Sedapal", proyecto: "Soporte", prioridad: "BAJA", estado: "TERCEROS", usuarioAsignadoId: 4, horasEstimadas: 8, horasConsumidas: 2, fechaEntregaInterna: "2025-05-21", fechaEntregaCliente: "2025-05-22", descripcion: "Pendiente de accesos por parte del cliente." },
  { id: 10, codigoExterno: "REQ-017", titulo: "Interface con proveedor", tipo: "REQUERIMIENTO", cliente: "Luz del Sur", proyecto: "Integraciones", prioridad: "ALTA", estado: "TERCEROS", usuarioAsignadoId: 1, horasEstimadas: 40, horasConsumidas: 0, fechaEntregaInterna: "2025-05-23", fechaEntregaCliente: "2025-05-26", descripcion: "A la espera de documentación del proveedor." },
  { id: 11, codigoExterno: "REQ-003", titulo: "Error en lógica ABAP", tipo: "INCIDENCIA", cliente: "Enel", proyecto: "Soporte", prioridad: "ALTA", estado: "BLOQUEADO", usuarioAsignadoId: 2, horasEstimadas: 32, horasConsumidas: 10, fechaEntregaInterna: "2025-05-15", fechaEntregaCliente: "2025-05-17", descripcion: "Bloqueado a la espera de transporte." },
  { id: 12, codigoExterno: "REQ-011", titulo: "Falta de aprobación", tipo: "REQUERIMIENTO", cliente: "Enel", proyecto: "Mantenimiento", prioridad: "ALTA", estado: "BLOQUEADO", usuarioAsignadoId: 1, horasEstimadas: 20, horasConsumidas: 4, fechaEntregaInterna: "2025-05-16", fechaEntregaCliente: "2025-05-18", descripcion: "Sin aprobación del cliente." },
  { id: 13, codigoExterno: "INC-009", titulo: "Pendiente de acceso", tipo: "INCIDENCIA", cliente: "Sedapal", proyecto: "Soporte", prioridad: "MEDIA", estado: "BLOQUEADO", usuarioAsignadoId: 4, horasEstimadas: 12, horasConsumidas: 1, fechaEntregaInterna: "2025-05-14", fechaEntregaCliente: "2025-05-16", descripcion: "Acceso pendiente." },
  { id: 14, codigoExterno: "REQ-004", titulo: "Nuevo report R3", tipo: "REQUERIMIENTO", cliente: "Luz del Sur", proyecto: "Mantenimiento", prioridad: "ALTA", estado: "CERRADO", usuarioAsignadoId: 2, horasEstimadas: 24, horasConsumidas: 24, fechaEntregaInterna: "2025-05-10", fechaEntregaCliente: "2025-05-12", descripcion: "Reporte R3 entregado." },
  { id: 15, codigoExterno: "INC-008", titulo: "Dump en PRD", tipo: "INCIDENCIA", cliente: "Enel", proyecto: "Soporte", prioridad: "MEDIA", estado: "CERRADO", usuarioAsignadoId: 4, horasEstimadas: 6, horasConsumidas: 6, fechaEntregaInterna: "2025-05-12", fechaEntregaCliente: "2025-05-13", descripcion: "Dump resuelto." },
  { id: 16, codigoExterno: "REQ-010", titulo: "Migración de tablas", tipo: "REQUERIMIENTO", cliente: "Sedapal", proyecto: "Migración", prioridad: "ALTA", estado: "CERRADO", usuarioAsignadoId: 3, horasEstimadas: 18, horasConsumidas: 18, fechaEntregaInterna: "2025-05-13", fechaEntregaCliente: "2025-05-15", descripcion: "Tablas migradas." },
];

// --- Ajustes de datos de prueba: fechas relativas a la semana actual ---
const base = parse("2025-05-14"); // miercoles del diseno
const delta = diffDias(addDias(lunesDe(hoy()), 2), toISO(base));
ticketsMock.forEach((t) => {
  t.fechaEntregaInterna = addDias(t.fechaEntregaInterna, delta);
  t.fechaEntregaCliente = addDias(t.fechaEntregaCliente, delta);
  t.fechaCreacion = addDias(t.fechaEntregaInterna, -((t.id % 4) + 2));
  t.fechaCierre = t.estado === "CERRADO" ? addDias(hoy(), -2) : null;
  t.ultimoComentario = "";
});
// Ejemplo de ticket cerrado hace mas de 7 dias (no debe verse en el Kanban)
ticketsMock[ticketsMock.length - 1].fechaCierre = addDias(hoy(), -10);
// Juan Perez (id 1) con varios tickets para probar la vista del consultor
[2, 6, 7, 11].forEach((id) => (ticketsMock.find((t) => t.id === id).usuarioAsignadoId = 1));
ticketsMock.find((t) => t.id === 4).ultimoComentario = "Desarrollo finalizado. Pendiente pruebas unitarias.";

// Usuarios de prueba: cada consultor entra con su nombre@ayesa.com / 1234
consultoresMock.forEach((c) =>
  usuariosMock.push({
    id: c.id,
    nombre: c.nombre,
    email: `${c.nombre.split(" ")[0].toLowerCase()}@ayesa.com`,
    password: "1234",
    rol: "CONSULTOR",
  })
);
