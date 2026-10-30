import { APP_NOMBRE } from "../config";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>{APP_NOMBRE}</h1>
        <p className="login-sub">Inicia sesión para continuar</p>

        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coordinador@ayesa.com" required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="login-hint">Demo: coordinador@ayesa.com o juan@ayesa.com (consultor) / 1234</p>
      </form>
    </div>
  );
}
