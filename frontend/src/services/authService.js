import api, { USE_MOCK } from "../api/client";
import { usuariosMock } from "../mocks/data";

// Contrato esperado: POST /auth/login {email, password} -> { token, usuario: {id, nombre, email, rol} }
export async function login(email, password) {
  if (USE_MOCK) {
    const u = usuariosMock.find((x) => x.email === email && x.password === password);
    if (!u) throw new Error("Credenciales incorrectas");
    const { password: _omit, ...usuario } = u;
    return { token: "mock-token", usuario };
  }
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  } catch (e) {
    throw new Error(e.response?.data?.message || "Credenciales incorrectas");
  }
}
