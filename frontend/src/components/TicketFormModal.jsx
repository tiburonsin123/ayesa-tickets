import { useState } from "react";
import { ESTADOS, PRIORIDADES, TIPOS } from "../mocks/data";

const vacio = (v) => (v === null || v === undefined ? "" : v);

// Sirve para crear (sin `ticket`) y para editar (con `ticket`).
// Minimo para crear: codigo, tipo, descripcion (nombre) y cliente. El resto se completa despues.
export default function TicketFormModal({ ticket, clientes, proyectos, consultores, onClose, onSave }) {
  const editando = !!ticket;
  const [f, setF] = useState({
    codigoExterno: ticket?.codigoExterno ?? "",
    titulo: ticket?.titulo ?? "",
    tipo: ticket?.tipo ?? "REQUERIMIENTO",
    cliente: ticket?.cliente ?? "",
    estado: ticket?.estado ?? "PENDIENTE",
    prioridad: ticket?.prioridad ?? "MEDIA",
    proyecto: ticket?.proyecto ?? "",
    usuarioAsignadoId: vacio(ticket?.usuarioAsignadoId),
    horasEstimadas: vacio(ticket?.horasEstimadas),
    fechaEntregaInterna: vacio(ticket?.fechaEntregaInterna),
    fechaEntregaCliente: vacio(ticket?.fechaEntregaCliente),
    descripcion: ticket?.descripcion ?? "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (f.horasEstimadas !== "" && Number(f.horasEstimadas) <= 0) return setError("Las horas estimadas deben ser mayores a 0");
    if (f.fechaEntregaInterna && f.fechaEntregaCliente && f.fechaEntregaCliente < f.fechaEntregaInterna)
      return setError("La fecha cliente no puede ser anterior a la interna");
    setGuardando(true);
    try {
      await onSave({
        ...f,
        codigoExterno: f.codigoExterno.trim(),
        titulo: f.titulo.trim(),
        usuarioAsignadoId: f.usuarioAsignadoId ? Number(f.usuarioAsignadoId) : null,
        horasEstimadas: f.horasEstimadas === "" ? null : Number(f.horasEstimadas),
        fechaEntregaInterna: f.fechaEntregaInterna || null,
        fechaEntregaCliente: f.fechaEntregaCliente || null,
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar el ticket");
      setGuardando(false);
    }
  };

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{editando ? `Editar ${ticket.codigoExterno}` : "Nuevo Ticket"}</h2>
          <button type="button" className="x" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="grid">
          <label>Código del ticket *
            <input value={f.codigoExterno} onChange={set("codigoExterno")} placeholder="Ej. JIRA-504, TOYOTA-12" required maxLength={40} autoFocus={!editando} />
          </label>
          <label>Tipo *
            <select value={f.tipo} onChange={set("tipo")}>
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="span2">Descripción *
            <input value={f.titulo} onChange={set("titulo")} required maxLength={120} placeholder="Nombre o descripción corta del requerimiento" />
          </label>
          <label className="span2">Cliente *
            <input list="clientes-lista" value={f.cliente} onChange={set("cliente")} required maxLength={80} placeholder="Selecciona o escribe un cliente" />
            <datalist id="clientes-lista">
              {clientes.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
        </div>

        <p className="form-sep">{editando ? "Datos adicionales" : "Datos adicionales (opcionales, puedes completarlos después)"}</p>

        <div className="grid">
          <label>Consultor asignado
            <select value={f.usuarioAsignadoId} onChange={set("usuarioAsignadoId")}>
              <option value="">Sin asignar</option>
              {consultores.map((c) => <option key={c.id} value={c.id}>{c.nombre} (Equipo {c.equipo})</option>)}
            </select>
          </label>
          <label>Horas estimadas (HH)
            <input type="number" min="0.5" step="0.5" value={f.horasEstimadas} onChange={set("horasEstimadas")} />
          </label>
          <label>Fecha interna
            <input type="date" value={f.fechaEntregaInterna} onChange={set("fechaEntregaInterna")} />
          </label>
          <label>Fecha cliente
            <input type="date" value={f.fechaEntregaCliente} onChange={set("fechaEntregaCliente")} />
          </label>
          <label>Estado
            <select value={f.estado} onChange={set("estado")}>
              {ESTADOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label>Prioridad
            <select value={f.prioridad} onChange={set("prioridad")}>
              {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <label className="span2">Proyecto/Servicio
            <input list="proyectos-lista" value={f.proyecto} onChange={set("proyecto")} maxLength={80} />
            <datalist id="proyectos-lista">
              {proyectos.map((p) => <option key={p} value={p} />)}
            </datalist>
          </label>
          <label className="span2">Detalle
            <textarea rows="3" value={f.descripcion} onChange={set("descripcion")} />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
