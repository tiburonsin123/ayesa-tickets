import { APP_NOMBRE } from "../config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as svc from "../services/ticketService";
import { addDias, fmtCorto, hoy, lunesDe, semanaLaboral } from "../utils/fechas";
import { archivado } from "../utils/tickets";
import useMoverTicket from "../hooks/useMoverTicket";
import Topbar from "../components/Topbar";
import ResumenHoras from "../components/ResumenHoras";
import KanbanBoard from "../components/KanbanBoard";
import TicketDetail from "../components/TicketDetail";
import LineaTiempo from "../components/LineaTiempo";

const TABS = ["RESUMEN HORAS", "KANBAN", "LÍNEA DE TIEMPO"];

// Si hoy es fin de semana, se muestra el lunes de la semana
const diaInicial = () => {
  const lunes = lunesDe(hoy());
  return semanaLaboral(lunes).includes(hoy()) ? hoy() : lunes;
};

export default function Consultor() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [tickets, setTickets] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(diaInicial);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const lunes = lunesDe(fecha);
  const yo = useMemo(() => [{ id: usuario.id, nombre: usuario.nombre }], [usuario]);

  const cargar = useCallback(
    () => svc.getMisTickets(usuario.id).then(setTickets).catch(() => setError("No se pudieron cargar tus tickets")),
    [usuario.id]
  );

  useEffect(() => {
    cargar().finally(() => setCargando(false));
  }, [cargar]);

  const visibles = useMemo(() => tickets.filter((t) => !archivado(t)), [tickets]);
  const mover = useMoverTicket({ tickets, setTickets, setSeleccionado, setError });

  const irSemana = (n) => setFecha(addDias(fecha, n * 7));

  return (
    <div className="app">
      <Topbar titulo={APP_NOMBRE} rol="Consultor" />

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
        {tab !== "KANBAN" && (
          <div className="semana-nav">
            <button onClick={() => irSemana(-1)} aria-label="Semana anterior">&lt;</button>
            <span>{fmtCorto(lunes)} - {fmtCorto(addDias(lunes, 4))}</span>
            <button onClick={() => irSemana(1)} aria-label="Semana siguiente">&gt;</button>
            <button className="hoy-btn" onClick={() => setFecha(diaInicial())}>Hoy</button>
          </div>
        )}
      </nav>

      <main className="main-consultor">
        {error && <div className="form-error" onClick={() => setError("")}>{error}</div>}
        {cargando ? (
          <p className="muted">Cargando...</p>
        ) : tab === "RESUMEN HORAS" ? (
          <ResumenHoras usuario={usuario} tickets={tickets} lunes={lunes} fecha={fecha} setFecha={setFecha} onHorasGuardadas={cargar} />
        ) : tab === "KANBAN" ? (
          <div className="kanban-consultor">
            <div className="board-wrap">
              <KanbanBoard tickets={visibles} seleccionadoId={seleccionado?.id} onSelect={setSeleccionado} onMove={mover} />
            </div>
            <TicketDetail ticket={seleccionado} consultores={yo} />
          </div>
        ) : (
          <LineaTiempo tickets={visibles} lunes={lunes} />
        )}
      </main>
    </div>
  );
}
