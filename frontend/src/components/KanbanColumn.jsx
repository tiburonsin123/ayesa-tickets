import { useState } from "react";
import TicketCard from "./TicketCard";

const LIMITE = 4;

export default function KanbanColumn({ estado, tickets, seleccionadoId, onSelect, onDropTicket }) {
  const [expandida, setExpandida] = useState(false);
  const [over, setOver] = useState(false);
  const visibles = expandida ? tickets : tickets.slice(0, LIMITE);
  const ocultos = tickets.length - LIMITE;

  return (
    <section
      className={`col ${over ? "col-over" : ""}`}
      style={{ "--col": estado.color }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropTicket(e.dataTransfer.getData("text/plain"), estado.id);
      }}
    >
      <header className="col-head">{estado.label} ({tickets.length})</header>
      <div className="col-body">
        {visibles.map((t) => (
          <TicketCard key={t.id} ticket={t} seleccionado={t.id === seleccionadoId} onSelect={onSelect} />
        ))}
        {tickets.length === 0 && <div className="col-empty">Sin tickets</div>}
        {ocultos > 0 && (
          <button className="ver-mas" onClick={() => setExpandida((v) => !v)}>
            {expandida ? "Ver menos" : `+ Ver más (${ocultos})`}
          </button>
        )}
      </div>
    </section>
  );
}
