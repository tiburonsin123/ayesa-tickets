import { useAuth } from "../context/AuthContext";
import { fmtLargo, hoy } from "../utils/fechas";

export default function Topbar({ titulo, rol, children }) {
  const { usuario, logout } = useAuth();
  const iniciales = usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <header className="topbar">
      <div className="brand">{titulo} <span>|</span> <em>{rol}</em></div>
      <div className="topbar-right">
        {children}
        <span className="fecha">{fmtLargo(hoy())}</span>
        <div className="user">
          <span className="avatar">{iniciales}</span>
          <div><strong>{usuario.nombre}</strong><small>{rol}</small></div>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Salir</button>
      </div>
    </header>
  );
}
