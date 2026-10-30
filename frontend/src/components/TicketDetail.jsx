import { useState } from "react";
import { ESTADOS, PRIORIDADES, TIPOS } from "../mocks/data";
import { fmt } from "../utils/fechas";
import { buffer } from "../utils/tickets";

const TABS = ["Información", "Avance", "Horas", "Adjuntos"];

export default function TicketDetail({ ticket, consultores, onEditar }) {
  const [tab, setTab] = useState("Información");

  if (!ticket) {
    return (
      <aside className="detail">
        <div className="detail-head"><strong>Detalle del Ticket</strong></div>
        <p className="muted">Selecciona un ticket para ver su detalle.</p>
      </aside>
    );
  }

  const estado = ESTADOS.find((e) => e.id === ticket.estado);
  const prio = PRIORIDADES.find((p) => p.id === ticket.prioridad);
  const tipo = TIPOS.find((t) => t.id === ticket.tipo);
  const resp = consultores.find((c) => c.id === ticket.usuarioAsignadoId);
  const etc = Math.max(0, ticket.horasEstimadas - ticket.horasConsumidas);
  const pct = ticket.horasEstimadas ? Math.round((ticket.horasConsumidas / ticket.horasEstimadas) * 100) : 0;

  return (
    <aside className="detail">
      <div className="detail-head">
        <strong>Detalle del Ticket</strong>
        {onEditar && <button className="link-btn" onClick={() => onEditar(ticket)}>✏️ Editar</button>}
      </div>
      <h4 className="detail-title">
        <span className="dot" style={{ background: prio?.color }} /> {ticket.codigoExterno} - {ticket.titulo}
      </h4>

      <div className="tabs-mini">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Información" && (
        <dl className="info">
          <dt>Tipo:</dt><dd>{tipo?.label}</dd>
          <dt>Estado:</dt><dd><span className="pill" style={{ background: estado?.color }}>{estado?.label}</span></dd>
          <dt>Prioridad:</dt><dd>{prio ? <span className="pill" style={{ background: prio.color }}>{prio.label}</span> : "-"}</dd>
          <dt>Cliente:</dt><dd>{ticket.cliente}</dd>
          <dt>Proyecto/Servicio:</dt><dd>{ticket.proyecto || "-"}</dd>
          <dt>Responsable:</dt><dd>{resp?.nombre || "Sin asignar"}</dd>
          <dt>HH Estimadas:</dt><dd>{ticket.horasEstimadas ?? "Sin estimar"}</dd>
          <dt>HH Consumidas:</dt><dd>{ticket.horasConsumidas}</dd>
          <dt>ETC:</dt><dd>{etc}</dd>
          <dt>Fecha Interna:</dt><dd>{fmt(ticket.fechaEntregaInterna)}</dd>
          <dt>Fecha Cliente:</dt><dd>{fmt(ticket.fechaEntregaCliente)}</dd>
          <dt>Buffer:</dt><dd>{buffer(ticket) ?? "-"}{buffer(ticket) !== null && " días"}</dd>
        </dl>
      )}
      {tab === "Avance" && (
        <div className="info">
          <div className="progress big"><div style={{ width: `${Math.min(100, pct)}%` }} /></div>
          <p>{pct}% completado ({ticket.horasConsumidas} de {ticket.horasEstimadas ?? 0} HH)</p>
        </div>
      )}
      {tab === "Horas" && <p className="muted">Aquí se mostrarán las horas que registre el consultor (pendiente de backend).</p>}
      {tab === "Adjuntos" && <p className="muted">Sin adjuntos.</p>}

      {tab === "Información" && (
        <>
          <strong>Descripción:</strong>
          <p className="desc">{ticket.descripcion || "Sin descripción."}</p>
          {ticket.ultimoComentario && (
            <>
              <strong>Último comentario:</strong>
              <p className="desc">{ticket.ultimoComentario}</p>
            </>
          )}
        </>
      )}
    </aside>
  );
}
