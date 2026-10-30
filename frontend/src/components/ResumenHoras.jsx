import { useCallback, useEffect, useMemo, useState } from "react";
import { PRIORIDADES, TIPOS, ESTADOS } from "../mocks/data";
import * as horas from "../services/horasService";
import { HORAS_DIA_MAX } from "../services/horasService";
import { diaMes, hoy, nombreDia } from "../utils/fechas";

// Si Roger confirma que el limite de 8h es solo una advertencia, poner en false
const BLOQUEAR_EXCESO = true;
const MAX_COMENTARIO = 120;
const num = (v) => (v === "" || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

export default function ResumenHoras({ usuario, tickets, lunes, fecha, setFecha, onHorasGuardadas }) {
  const [dia, setDia] = useState(null);
  const [items, setItems] = useState([]);
  const [semana, setSemana] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [msg, setMsg] = useState(null); // { tipo: "ok" | "error", texto }
  const [guardando, setGuardando] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);

  const cargarSemana = useCallback(() => horas.getSemana(usuario.id, lunes).then(setSemana), [usuario.id, lunes]);

  useEffect(() => {
    cargarSemana();
  }, [cargarSemana]);

  useEffect(() => {
    let vivo = true;
    horas.getDia(usuario.id, fecha).then((d) => {
      if (!vivo) return;
      setDia(d);
      setItems(d.items.map((i) => ({ ...i, key: i.id ?? `n${i.ticketId ?? "daily"}` })));
      setMsg(null);
    });
    return () => { vivo = false; };
  }, [usuario.id, fecha]);

  const cerrado = !!dia?.dailyCerrado;
  const ordenados = useMemo(() => [...items].sort((a, b) => a.orden - b.orden), [items]);
  const totalPlan = items.reduce((s, i) => s + i.horasPlanificadas, 0);
  const totalReal = items.reduce((s, i) => s + i.horasReales, 0);
  const excede = totalPlan > HORAS_DIA_MAX;
  const ticketDe = (it) => tickets.find((t) => t.id === it.ticketId);
  const etcDe = (it) => {
    const t = ticketDe(it);
    return t ? Math.max(0, t.horasEstimadas - t.horasConsumidas) : null;
  };
  const etcTotal = ordenados.reduce((s, it) => s + (etcDe(it) ?? 0), 0);

  const disponibles = tickets
    .filter((t) => t.estado !== "CERRADO")
    .filter((t) => `${t.codigoExterno} ${t.titulo}`.toLowerCase().includes(busqueda.toLowerCase()));

  const agregar = (t) => {
    if (cerrado) return setMsg({ tipo: "error", texto: "El Daily está cerrado. Reabre la planificación para agregar tickets." });
    if (items.some((i) => i.ticketId === t.id)) return setMsg({ tipo: "error", texto: `${t.codigoExterno} ya está en la grilla de este día.` });
    const orden = Math.max(0, ...items.map((i) => i.orden)) + 1;
    setItems([...items, { id: null, key: `n${t.id}`, ticketId: t.id, esDaily: false, orden, horasPlanificadas: 1, horasReales: 0, comentario: "" }]);
    setMsg(null);
  };

  const cambiar = (key, campo, valor) => setItems((is) => is.map((i) => (i.key === key ? { ...i, [campo]: valor } : i)));

  const quitar = (key) => setItems((is) => is.filter((i) => i.key !== key).map((i, n) => ({ ...i, orden: n + 1 })));

  const soltar = (destino) => {
    if (arrastrando === null || arrastrando === destino || cerrado) return;
    const lista = [...ordenados];
    const [mov] = lista.splice(arrastrando, 1);
    lista.splice(destino, 0, mov);
    setItems(lista.map((i, n) => ({ ...i, orden: n + 1 })));
    setArrastrando(null);
  };

  const payloadPlan = (cerrarDaily) => ({
    usuarioId: usuario.id,
    fecha,
    cerrarDaily,
    items: ordenados.map((i) => ({ ticketId: i.ticketId, orden: i.orden, horasPlanificadas: i.horasPlanificadas, esDaily: i.esDaily })),
  });

  const ejecutar = async (fn, okTexto) => {
    setGuardando(true);
    try {
      const d = await fn();
      setDia(d);
      setItems(d.items.map((i) => ({ ...i, key: i.id })));
      setMsg({ tipo: "ok", texto: okTexto });
      await cargarSemana();
      onHorasGuardadas();
    } catch {
      setMsg({ tipo: "error", texto: "No se pudo guardar. Intenta nuevamente." });
    } finally {
      setGuardando(false);
    }
  };

  const guardarPlan = (cerrarDaily) => {
    if (excede && BLOQUEAR_EXCESO) return setMsg({ tipo: "error", texto: `La planificación del día no puede superar ${HORAS_DIA_MAX} horas.` });
    if (items.some((i) => i.horasPlanificadas <= 0 && !i.esDaily)) return setMsg({ tipo: "error", texto: "Cada ticket debe tener horas planificadas mayores a 0." });
    return ejecutar(() => horas.guardarPlanificacion(payloadPlan(cerrarDaily)), cerrarDaily ? "Daily cerrado. Ya puedes registrar horas reales." : "Planificación guardada.");
  };

  const guardarReales = () =>
    ejecutar(
      () => horas.guardarReales({
        usuarioId: usuario.id,
        fecha,
        imputaciones: items.filter((i) => i.id).map((i) => ({ registroId: i.id, horasReales: i.horasReales, comentario: i.comentario })),
      }),
      "Horas reales guardadas."
    );

  // Resumen semanal: el dia seleccionado usa los valores en edicion
  const semanaVista = semana.map((d) => (d.fecha === fecha ? { ...d, planificadas: totalPlan, reales: totalReal } : d));
  const wPlan = semanaVista.reduce((s, d) => s + d.planificadas, 0);
  const wReal = semanaVista.reduce((s, d) => s + d.reales, 0);
  const activos = tickets.filter((t) => t.estado !== "CERRADO").length;

  return (
    <div className="resumen">
      <aside className="panel asignados">
        <h3>Tickets Asignados ({activos})</h3>
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="🔍 Buscar..." />
        <ul>
          {disponibles.map((t) => {
            const prio = PRIORIDADES.find((p) => p.id === t.prioridad);
            const yaEsta = items.some((i) => i.ticketId === t.id);
            return (
              <li key={t.id}>
                <span className="dot" style={{ background: prio?.color }} />
                <span className="cod">{t.codigoExterno}</span>
                <span className="desc-corta" title={t.titulo}>{t.titulo}</span>
                <button className="add" onClick={() => agregar(t)} disabled={yaEsta || cerrado} title={yaEsta ? "Ya está en el día" : "Agregar al día"}>+</button>
              </li>
            );
          })}
          {disponibles.length === 0 && <li className="muted">Sin tickets</li>}
        </ul>
      </aside>

      <section className="panel semana">
        <h3>Horas de la Semana</h3>
        <div className="dias">
          {semanaVista.map((d) => (
            <button key={d.fecha} className={`dia-card ${d.fecha === fecha ? "sel" : ""}`} onClick={() => setFecha(d.fecha)}>
              <span>{nombreDia(d.fecha)} {diaMes(d.fecha)}{d.fecha === hoy() ? " (Hoy)" : ""}</span>
              <strong className={d.planificadas > HORAS_DIA_MAX ? "rojo" : ""}>{d.planificadas}</strong>
            </button>
          ))}
        </div>
      </section>

      <aside className="panel resumen-sem">
        <h3>Resumen Semana</h3>
        <dl>
          <dt>HH Planificadas:</dt><dd>{wPlan}</dd>
          <dt>HH Registradas:</dt><dd>{wReal}</dd>
          <dt>Pendiente:</dt><dd className="rojo">{Math.max(0, wPlan - wReal)}</dd>
          <dt>Tickets Activos:</dt><dd>{activos}</dd>
        </dl>
      </aside>

      <section className="panel detalle-dia">
        <div className="detalle-head">
          <h3>Detalle del Día - {nombreDia(fecha)} {diaMes(fecha)}</h3>
          <div className="acciones">
            {!cerrado ? (
              <>
                <button className="btn btn-light" disabled={guardando} onClick={() => guardarPlan(false)}>Guardar planificación</button>
                <button className="btn btn-primary" disabled={guardando} onClick={() => guardarPlan(true)}>Cerrar Daily</button>
              </>
            ) : (
              <>
                <button className="btn btn-light" disabled={guardando} onClick={() => guardarPlan(false)}>Reabrir planificación</button>
                <button className="btn btn-primary" disabled={guardando} onClick={guardarReales}>💾 Guardar horas reales</button>
              </>
            )}
          </div>
        </div>

        {msg && <div className={msg.tipo === "ok" ? "form-ok" : "form-error"}>{msg.texto}</div>}
        {excede && <div className="form-warn">Planificaste {totalPlan} h; el máximo por día es {HORAS_DIA_MAX} h (recomendado: 6 h tareas + 1 h Daily + 1 h libre).</div>}
        {!cerrado && <p className="hint">Planifica el día y arrastra las filas para definir el orden. Al cerrar el Daily se habilita el registro de horas reales.</p>}

        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Orden</th><th>Ticket</th><th>Descripción</th><th>Tipo</th><th>Prioridad</th>
                <th>HH Plan</th><th>HH Real</th><th>ETC</th><th>Estado</th><th>Comentario</th><th />
              </tr>
            </thead>
            <tbody>
              {ordenados.map((it, idx) => {
                const t = ticketDe(it);
                const prio = PRIORIDADES.find((p) => p.id === t?.prioridad);
                const estado = ESTADOS.find((e) => e.id === t?.estado);
                return (
                  <tr
                    key={it.key}
                    draggable={!cerrado}
                    onDragStart={() => setArrastrando(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => soltar(idx)}
                    className={arrastrando === idx ? "arrastrando" : ""}
                  >
                    <td className="orden">{cerrado ? "" : "⋮⋮ "}{it.orden}</td>
                    <td><strong>{it.esDaily ? "Daily" : t?.codigoExterno}</strong></td>
                    <td>{it.esDaily ? "Actividades internas" : t?.titulo}</td>
                    <td>{it.esDaily ? "Interno" : TIPOS.find((x) => x.id === t?.tipo)?.label}</td>
                    <td>{prio ? <><span className="dot" style={{ background: prio.color }} /> {prio.label}</> : "-"}</td>
                    <td>
                      <input className="n" type="number" min="0" step="0.5" value={it.horasPlanificadas} disabled={cerrado}
                        onChange={(e) => cambiar(it.key, "horasPlanificadas", num(e.target.value))} />
                    </td>
                    <td>
                      <input className="n" type="number" min="0" step="0.5" value={it.horasReales} disabled={!cerrado}
                        title={cerrado ? "" : "Se habilita al cerrar el Daily"}
                        onChange={(e) => cambiar(it.key, "horasReales", num(e.target.value))} />
                    </td>
                    <td>{etcDe(it) ?? "-"}</td>
                    <td>{estado ? <span className="pill" style={{ background: estado.color }}>{estado.label}</span> : "-"}</td>
                    <td>
                      <input value={it.comentario} maxLength={MAX_COMENTARIO} disabled={!cerrado}
                        placeholder={cerrado ? `Máx. ${MAX_COMENTARIO} caracteres` : ""}
                        onChange={(e) => cambiar(it.key, "comentario", e.target.value)} />
                    </td>
                    <td>
                      <button className="x-row" disabled={cerrado} title={it.esDaily ? "Sin reunión hoy: quitar Daily" : "Quitar"} onClick={() => quitar(it.key)}>×</button>
                    </td>
                  </tr>
                );
              })}
              <tr className="total">
                <td colSpan={5}>TOTAL</td>
                <td className={excede ? "rojo" : ""}>{totalPlan}</td>
                <td>{totalReal}</td>
                <td>{etcTotal}</td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
