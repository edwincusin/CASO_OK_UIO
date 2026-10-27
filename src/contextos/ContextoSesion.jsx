import { createContext, useContext, useState } from 'react';
import { usuariosDemoIniciales } from '../datos/datosDemo';

const ContextoSesion = createContext(null);

export function ProveedorSesion({ children }) {
  const [usuarios, setUsuarios] = useState(usuariosDemoIniciales);
  const [usuario, setUsuario] = useState(usuariosDemoIniciales[0]); // Por defecto Superusuario activo para comodidad

  function iniciarSesionConCredenciales(cedula, password) {
    const encontrado = usuarios.find((u) => u.cedula.trim() === cedula.trim());
    if (!encontrado) {
      return { exito: false, mensaje: 'CÉDULA NO ENCONTRADA EN EL SISTEMA' };
    }
    if (!encontrado.estado) {
      return { exito: false, mensaje: 'EL USUARIO SE ENCUENTRA INACTIVO. CONTACTE A ADMINISTRACIÓN' };
    }
    if (encontrado.password !== password) {
      return { exito: false, mensaje: 'CONTRASEÑA INCORRECTA' };
    }

    setUsuario(encontrado);
    return { exito: true, usuario: encontrado };
  }

  function iniciarSesionRapida(usuarioElegido) {
    if (!usuarioElegido.estado) {
      return { exito: false, mensaje: 'EL USUARIO SE ENCUENTRA INACTIVO' };
    }
    setUsuario(usuarioElegido);
    return { exito: true };
  }

  function cerrarSesion() {
    setUsuario(null);
  }

  function cambiarPassword(idUsuario, claveActual, claveNueva) {
    const u = usuarios.find((item) => item.id === idUsuario);
    if (!u) return { exito: false, mensaje: 'USUARIO NO ENCONTRADO' };
    if (u.password !== claveActual) return { exito: false, mensaje: 'LA CONTRASEÑA ACTUAL NO COINCIDE' };
    if (!claveNueva || claveNueva.length < 4) return { exito: false, mensaje: 'LA NUEVA CONTRASEÑA DEBE TENER AL MENOS 4 CARACTERES' };

    setUsuarios((lista) =>
      lista.map((item) => (item.id === idUsuario ? { ...item, password: claveNueva } : item))
    );
    if (usuario && usuario.id === idUsuario) {
      setUsuario((actual) => ({ ...actual, password: claveNueva }));
    }
    return { exito: true, mensaje: 'CONTRASEÑA ACTUALIZADA CON ÉXITO' };
  }

  // Métodos CRUD para Superusuario
  function crearUsuario(datos) {
    const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
    const nuevo = {
      ...datos,
      id: nuevoId,
      cedula: datos.cedula.trim(),
      nombre: datos.nombre.toUpperCase(),
      apellido: datos.apellido.toUpperCase(),
      password: datos.cedula.trim(), // Contraseña inicial por defecto = Cédula
      estado: true,
    };
    setUsuarios([...usuarios, nuevo]);
    return nuevo;
  }

  function actualizarUsuario(id, datos) {
    setUsuarios((lista) =>
      lista.map((u) => (u.id === id ? { ...u, ...datos } : u))
    );
    if (usuario && usuario.id === id) {
      setUsuario((actual) => ({ ...actual, ...datos }));
    }
  }

  function toggleEstadoUsuario(id) {
    setUsuarios((lista) =>
      lista.map((u) => (u.id === id ? { ...u, estado: !u.estado } : u))
    );
  }

  function resetearPassword(id) {
    const u = usuarios.find((item) => item.id === id);
    if (!u) return;
    setUsuarios((lista) =>
      lista.map((item) => (item.id === id ? { ...item, password: item.cedula } : item))
    );
  }

  const valor = {
    usuario,
    usuarios,
    iniciarSesionConCredenciales,
    iniciarSesionRapida,
    cerrarSesion,
    cambiarPassword,
    crearUsuario,
    actualizarUsuario,
    toggleEstadoUsuario,
    resetearPassword,
  };

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
  const contexto = useContext(ContextoSesion);
  return contexto || {};
}
