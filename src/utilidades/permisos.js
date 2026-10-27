export function esSuperusuario(usuario) {
  if (!usuario) return false;
  return usuario.rol === 'superusuario';
}

export function puedeVerCRUDs(usuario) {
  return esSuperusuario(usuario);
}

export function puedeVerReportes(usuario) {
  return esSuperusuario(usuario);
}

export function puedeVerMetricasTerritoriales(usuario) {
  return esSuperusuario(usuario);
}

export function puedeVerConfiguracion(usuario) {
  return esSuperusuario(usuario);
}

export function filtrarCasosPorUsuario(casos, usuario) {
  if (!usuario || !casos) return [];

  if (usuario.rol === 'superusuario' || usuario.rol === 'operador_administracion') {
    return casos;
  }

  if (usuario.rol === 'operador_seguridad') {
    return casos; // Visualización global para Seguridad
  }

  if (usuario.rol === 'mantenimiento') {
    return casos.filter(
      (c) => String(c.area).trim().toUpperCase() === 'MANTENIMIENTO'
    );
  }

  return [];
}

export function puedeAtenderCaso(usuario, caso) {
  if (!usuario || !caso) return false;
  if (caso.estado === 'cerrado') return false;

  if (usuario.rol === 'superusuario' || usuario.rol === 'operador_administracion') {
    return true;
  }
  if (usuario.rol === 'operador_seguridad' && String(caso.area).toUpperCase() === 'SEGURIDAD') {
    return true;
  }
  if (usuario.rol === 'mantenimiento' && String(caso.area).toUpperCase() === 'MANTENIMIENTO') {
    return true;
  }

  return false;
}

export function puedeConfirmarCaso(usuario, caso) {
  if (!usuario || !caso) return false;
  if (caso.estado !== 'por_confirmar') return false;
  return usuario.rol === 'superusuario' || usuario.rol === 'operador_administracion';
}

export function puedeEditarCaso(usuario, caso) {
  if (!usuario || !caso) return false;
  return caso.estado === 'abierto' && caso.registradoPor === usuario.id;
}

export function puedeAgregarSeguimiento(usuario) {
  return Boolean(usuario);
}
