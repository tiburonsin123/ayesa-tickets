import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Coordinador from "./pages/Coordinador";
import Consultor from "./pages/Consultor";

const home = (usuario) => (usuario?.rol === "COORDINADOR" ? "/coordinador" : "/consultor");

// Solo deja pasar al rol indicado; si no hay sesion va a login, si es otro rol a su home
function Privada({ rol, children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to={home(usuario)} replace />;
  return children;
}

export default function App() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to={home(usuario)} replace /> : <Login />} />
      <Route path="/coordinador" element={<Privada rol="COORDINADOR"><Coordinador /></Privada>} />
      <Route path="/consultor" element={<Privada rol="CONSULTOR"><Consultor /></Privada>} />
      <Route path="*" element={<Navigate to={usuario ? home(usuario) : "/login"} replace />} />
    </Routes>
  );
}
