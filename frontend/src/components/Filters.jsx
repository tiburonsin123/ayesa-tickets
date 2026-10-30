import { ESTADOS, PRIORIDADES, TIPOS } from "../mocks/data";

function Select({ label, value, onChange, options }) {
  return (
    <label className="f-field">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function Filters({ filtros, setFiltros, clientes, proyectos, consultores, tickets }) {
  const set = (k) => (v) => setFiltros((f) => ({ ...f, [k]: v }));
  const lista = (arr) => arr.map((x) => ({ id: x, label: x }));
  const equipos = [...new Set(consultores.map((c) => c.equipo))];

  return (
    <aside className="filters">
      <h3>Filtros</h3>
      <Select label="Cliente" value={filtros.cliente} onChange={set("cliente")} options={lista(clientes)} />
      <Select label="Proyecto/Servicio" value={filtros.proyecto} onChange={set("proyecto")} options={lista(proyectos)} />
      <Select label="Tipo" value={filtros.tipo} onChange={set("tipo")} options={TIPOS} />
      <Select label="Prioridad" value={filtros.prioridad} onChange={set("prioridad")} options={PRIORIDADES} />
      <Select label="Estado" value={filtros.estado} onChange={set("estado")} options={ESTADOS} />
      <Select
        label="Consultor"
        value={filtros.consultor}
        onChange={set("consultor")}
        options={consultores.map((c) => ({ id: String(c.id), label: c.nombre }))}
      />
      <label className="f-field">
        Buscar
        <input value={filtros.q} onChange={(e) => set("q")(e.target.value)} placeholder="🔍 Buscar..." />
      </label>
      <button className="btn btn-light btn-block" onClick={() => setFiltros({ cliente: "", proyecto: "", tipo: "", prioridad: "", estado: "", consultor: "", q: "" })}>
        Limpiar filtros
      </button>

      <h3 className="equipos-title">Mis Equipos ({consultores.length})</h3>
      <ul className="equipos">
        {equipos.map((eq, i) => (
          <li key={eq}>
            <span className="dot" style={{ background: ["#16a34a", "#f59e0b", "#2563eb", "#7c3aed"][i % 4] }} />
            Equipo {eq} ({tickets.filter((t) => consultores.find((c) => c.id === t.usuarioAsignadoId)?.equipo === eq).length})
          </li>
        ))}
      </ul>
    </aside>
  );
}
