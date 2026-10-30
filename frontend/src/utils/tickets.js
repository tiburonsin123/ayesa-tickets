import { diffDias, hoy } from "./fechas";

// Regla: un ticket cerrado hace mas de 7 dias deja de mostrarse en el Kanban (sigue en BD)
export const archivado = (t) => t.estado === "CERRADO" && !!t.fechaCierre && diffDias(hoy(), t.fechaCierre) > 7;

export const buffer = (t) =>
  t.fechaEntregaCliente && t.fechaEntregaInterna ? Math.max(0, diffDias(t.fechaEntregaCliente, t.fechaEntregaInterna)) : null;
