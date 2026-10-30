import { PRIORIDADES, TIPOS } from "../mocks/data";
import { fmt } from "../utils/fechas";



export default function TicketCard({ ticket, seleccionado, onSelect }) {
  const prio = PRIORIDADES.find((p) => p.id === ticket.prioridad);
  const tipo = TIPOS.find((t) => t.id === ticket.tipo);
  const pct = ticket.horasEstimadas ? Math.min(100, Math.round((ticket.horasConsumidas / ticket.horasEstimadas) * 100)) : 0;

  return (
    <div
      className={`ticket ${seleccionado ? "ticket-sel" : ""}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", ticket.id)}
      onClick={() => onSelect(ticket)}
    >
      <div className="ticket-top">
        <span className="dot" style={{ background: prio?.color }} title={`Prioridad ${prio?.label}`} />
        <strong>{ticket.codigoExterno}</strong>
      </div>
      <div className="ticket-title">{ticket.titulo}</div>
      <div className="ticket-cliente">{ticket.cliente}</div>
      <div className="ticket-fecha">📅 {fmt(ticket.fechaEntregaCliente)}</div>
      <div className="ticket-bottom">
        <span className={`badge badge-${ticket.tipo.toLowerCase()}`}>{tipo?.label}</span>
        <span className="hh">{ticket.horasEstimadas ?? "-"} HH</span>
      </div>
      {ticket.horasConsumidas > 0 && (
        <div className="progress-row">
          <div className="progress"><div style={{ width: `${pct}%` }} /></div>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
