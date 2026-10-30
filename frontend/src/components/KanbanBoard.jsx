import { ESTADOS } from "../mocks/data";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({ tickets, seleccionadoId, onSelect, onMove }) {
  return (
    <div className="board">
      {ESTADOS.map((e) => (
        <KanbanColumn
          key={e.id}
          estado={e}
          tickets={tickets.filter((t) => t.estado === e.id)}
          seleccionadoId={seleccionadoId}
          onSelect={onSelect}
          onDropTicket={(id, estado) => onMove(Number(id), estado)}
        />
      ))}
    </div>
  );
}
