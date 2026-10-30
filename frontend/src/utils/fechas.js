// Fechas como "YYYY-MM-DD" en hora local (evita el desfase de toISOString/UTC)
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parse = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const hoy = () => toISO(new Date());

export const addDias = (iso, n) => {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const diffDias = (a, b) => Math.round((parse(a) - parse(b)) / 86400000);

// Lunes de la semana de `iso`
export const lunesDe = (iso) => {
  const d = parse(iso);
  return addDias(iso, -((d.getDay() + 6) % 7));
};

export const semanaLaboral = (lunes) => [0, 1, 2, 3, 4].map((i) => addDias(lunes, i));

export const NOMBRE_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const nombreDia = (iso) => NOMBRE_DIA[parse(iso).getDay()];
export const diaMes = (iso) => parse(iso).getDate();
export const fmt = (iso) => (iso ? iso.split("-").reverse().join("/") : "-");
export const fmtCorto = (iso) => (iso ? iso.split("-").reverse().slice(0, 2).join("/") : "-");
export const fmtLargo = (iso) =>
  parse(iso).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
