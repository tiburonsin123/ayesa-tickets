import { APP_NOMBRE } from "../config";
import { useEffect, useMemo, useState } from "react";
import * as svc from "../services/ticketService";
import { archivado } from "../utils/tickets";
import useMoverTicket from "../hooks/useMoverTicket";
import Topbar from "../components/Topbar";
import Filters from "../components/Filters";
import KanbanBoard from "../components/KanbanBoard";
import TicketDetail from "../components/TicketDetail";
import TicketFormModal from "../components/TicketFormModal";

const TABS = ["KANBAN", "PLANIFICACIÓN (GANTT)", "CAPACIDAD DE RECURSOS", "ANALÍTICA", "BACKLOG"];
const FILTROS_VACIOS = { cliente: "", proyecto: "", tipo: "", prioridad: "", estado: "", consultor: "", q: "" };

export default function Coordinador() {
  const [tickets, setTickets] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modal, setModal] = useState(null); // null | { ticket? }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([svc.getTickets(), svc.getConsultores(), svc.getClientes(), svc.getProyectos()])
      .then(([t, c, cl, p]) => {
        setTickets(t);
        setConsultores(c);
        setClientes(cl);
        setProyectos(p);
        setSeleccionado(t.find((x) => !archivado(x)) || null);
      })
      .catch(() => setError("No se pudieron cargar los datos"))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = filtros.q.toLowerCase();
    return tickets.filter(
      (t) =>
        !archivado(t) &&
        (!filtros.cliente || t.cliente === filtros.cliente) &&
        (!filtros.proyecto || t.proyecto === filtros.proyecto) &&
        (!filtros.tipo || t.tipo === filtros.tipo) &&
        (!filtros.prioridad || t.prioridad === filtros.prioridad) &&
        (!filtros.estado || t.estado === filtros.estado) &&
        (!filtros.consultor || String(t.usuarioAsignadoId) === filtros.consultor) &&
        (!q || t.codigoExterno.toLowerCase().includes(q) || t.titulo.toLowerCase().includes(q))
    );
  }, [tickets, filtros]);

  const mover = useMoverTicket({ tickets, setTickets, setSeleccionado, setError });

  const guardar = async (datos) => {
    if (modal.ticket) {
      const act = await svc.updateTicket(modal.ticket.id, datos);
      setTickets((ts) => ts.map((t) => (t.id === act.id ? act : t)));
      setSeleccionado(act);
    } else {
      const nuevo = await svc.createTicket(datos);
      setTickets((ts) => [nuevo, ...ts]);
      setSeleccionado(nuevo);
    }
    setModal(null);
  };

  return (
    <div className="app">
      <Topbar titulo={APP_NOMBRE} rol="Coordinador">
        <button className="btn btn-accent" onClick={() => setModal({})}>+ Nuevo Ticket</button>
      </Topbar>

      <nav className="tabs">
        {TABS.map((t, i) => (
          <button key={t} className={i === 0 ? "on" : ""} disabled={i !== 0} title={i ? "Próximamente" : ""}>{t}</button>
        ))}
      </nav>

      <main className="layout">
        <Filters filtros={filtros} setFiltros={setFiltros} clientes={clientes} proyectos={proyectos} consultores={consultores} tickets={tickets} />

        <div className="board-wrap">
          {error && <div className="form-error" onClick={() => setError("")}>{error}</div>}
          {cargando ? (
            <p className="muted">Cargando tickets...</p>
          ) : (
            <KanbanBoard tickets={filtrados} seleccionadoId={seleccionado?.id} onSelect={setSeleccionado} onMove={mover} />
          )}
        </div>

        <TicketDetail ticket={seleccionado} consultores={consultores} onEditar={(t) => setModal({ ticket: t })} />
      </main>

      {modal && (
        <TicketFormModal ticket={modal.ticket} clientes={clientes} proyectos={proyectos} consultores={consultores} onClose={() => setModal(null)} onSave={guardar} />
      )}
    </div>
  );
}
