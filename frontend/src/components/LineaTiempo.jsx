import { useMemo } from "react";
import { PRIORIDADES } from "../mocks/data";
import { diaMes, diffDias, fmt, fmtCorto, hoy, nombreDia, semanaLaboral } from "../utils/fechas";

const UMBRAL_SOBRECARGA = 2; // entregas internas el mismo dia

export default function LineaTiempo({ tickets, lunes }) {
  const dias = semanaLaboral(lunes);
  const viernes = dias[4];
  const hoyISO = hoy();

  const filas = useMemo(
    () =>
      tickets
        .filter((t) => t.estado !== "CERRADO")
        .sort((a, b) => (a.fechaEntregaCliente || "9999").localeCompare(b.fechaEntregaCliente || "9999")),
    [tickets]
  );

  // Barra: desde la creacion del ticket hasta la fecha interna, recortada a la semana visible
  const barra = (t) => {
    if (!t.fechaEntregaInterna) return null;
    const ini = t.fechaCreacion > lunes ? t.fechaCreacion : lunes;
    const fin = t.fechaEntregaInterna < viernes ? t.fechaEntregaInterna : viernes;
    if (fin < lunes || ini > viernes || fin < ini) return null;
    return { desde: diffDias(ini, lunes) + 1, hasta: diffDias(fin, lunes) + 2 };
  };
  const hito = (t) => {
    if (!t.fechaEntregaCliente) return null;
    const d = diffDias(t.fechaEntregaCliente, lunes);
    return d >= 0 && d <= 4 ? d + 1 : null;
  };

  const entregasPorDia = dias.map((d) => filas.filter((t) => t.fechaEntregaInterna === d).length);
  const proximas = filas.filter((t) => t.fechaEntregaCliente && t.fechaEntregaCliente >= hoyISO).slice(0, 6);

  return (
    <div className="timeline">
      <section className="panel">
        <h3>Planificación Semanal ({fmtCorto(lunes)} - {fmtCorto(viernes)})</h3>
        <div className="gantt">
          <div className="g-head g-ticket">Ticket</div>
          <div className="g-head g-desc">Descripción</div>
          <div className="g-head g-fecha">Fecha Cliente</div>
          <div className="g-head g-dias">
            {dias.map((d, i) => (
              <div key={d} className={`g-dia ${d === hoyISO ? "hoy" : ""}`}>
                {nombreDia(d).slice(0, 3)} {diaMes(d)}
                {entregasPorDia[i] >= UMBRAL_SOBRECARGA && <span className="alerta" title="Varias entregas el mismo día">⚠</span>}
              </div>
            ))}
          </div>

          {filas.map((t) => {
            const prio = PRIORIDADES.find((p) => p.id === t.prioridad);
            const b = barra(t);
            const h = hito(t);
            return (
              <div key={t.id} className="g-row">
                <div className="g-ticket"><span className="dot" style={{ background: prio?.color }} /> {t.codigoExterno}</div>
                <div className="g-desc" title={t.titulo}>{t.titulo}</div>
                <div className="g-fecha">{fmt(t.fechaEntregaCliente)}</div>
                <div className="g-dias g-track">
                  {dias.map((d) => <div key={d} className={`g-celda ${d === hoyISO ? "hoy" : ""}`} />)}
                  {b && <div className="g-barra" style={{ gridColumn: `${b.desde} / ${b.hasta}`, background: prio?.color }} />}
                  {h && <div className="g-hito" style={{ gridColumn: `${h} / ${h + 1}` }} title="Fecha de entrega al cliente">◆</div>}
                </div>
              </div>
            );
          })}
          {filas.length === 0 && <p className="muted">No hay tickets activos.</p>}
        </div>
      </section>

      <aside className="panel entregas">
        <h3>Próximas Entregas</h3>
        <ul>
          {proximas.map((t) => (
            <li key={t.id}>
              <span>{fmtCorto(t.fechaEntregaCliente)}</span>
              <span className="dot" style={{ background: PRIORIDADES.find((p) => p.id === t.prioridad)?.color }} />
              <span>{t.codigoExterno} - {t.titulo}</span>
            </li>
          ))}
          {proximas.length === 0 && <li className="muted">Sin entregas próximas</li>}
        </ul>
        <h3 className="leyenda-t">Leyenda</h3>
        <p className="leyenda"><span className="g-barra mini" /> Actividad planificada &nbsp; ◆ Hito de entrega al cliente &nbsp; <span className="hoy-box" /> Hoy</p>
      </aside>
    </div>
  );
}

