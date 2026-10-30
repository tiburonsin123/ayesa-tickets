import { useCallback } from "react";
import * as svc from "../services/ticketService";
import { hoy } from "../utils/fechas";

// Cambia el estado de un ticket (optimista) y revierte si el backend falla
export default function useMoverTicket({ tickets, setTickets, setSeleccionado, setError }) {
  return useCallback(
    async (id, estado) => {
      const t = tickets.find((x) => x.id === id);
      if (!t || t.estado === estado) return;
      const antes = tickets;
      const fechaCierre = estado === "CERRADO" ? hoy() : null;
      setTickets((ts) => ts.map((x) => (x.id === id ? { ...x, estado, fechaCierre } : x)));
      setSeleccionado((s) => (s?.id === id ? { ...s, estado, fechaCierre } : s));
      try {
        await svc.updateEstado(id, estado);
      } catch {
        setTickets(antes);
        setError("No se pudo cambiar el estado");
      }
    },
    [tickets, setTickets, setSeleccionado, setError]
  );
}
