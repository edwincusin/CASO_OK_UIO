import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Layers,
  FolderTree,
  Plus,
  FileText,
  Wrench,
} from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaMetrica from '../componentes/TarjetaMetrica';
import TarjetaCaso from '../componentes/TarjetaCaso';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useSesion } from '../contextos/ContextoSesion';
import { etiquetasRol } from '../datos/datosDemo';
import { puedeVerMetricasTerritoriales } from '../utilidades/permisos';
import { diasDeAtraso } from '../utilidades/fechas';

export default function Inicio() {
  const { casos } = useCasos();
  const { etapas, calles, lotes } = useCatalogos();
  const { usuario, usuarios } = useSesion();

  // Cálculo de Métricas KPI sobre los casos permitidos para este rol
  const totalCasos = casos.length;
  const activos = casos.filter((c) => c.estado === 'abierto' || c.estado === 'en_proceso').length;
  const pendientes = casos.filter((c) => c.estado === 'abierto').length;
  const porConfirmar = casos.filter((c) => c.estado === 'por_confirmar').length;
  const vencidos = casos.filter((c) => c.esVencido || (c.estado !== 'cerrado' && diasDeAtraso(c.proximoSeguimiento) > 0)).length;
  const cerrados = casos.filter((c) => c.estado === 'cerrado').length;

  const pendientesSeguimiento = [...casos]
    .filter((c) => c.estado !== 'cerrado')
    .sort((a, b) => {
      const atrasoA = diasDeAtraso(a.proximoSeguimiento);
      const atrasoB = diasDeAtraso(b.proximoSeguimiento);
      if (atrasoB !== atrasoA) {
        return atrasoB - atrasoA;
      }
      return (a.proximoSeguimiento || '').localeCompare(b.proximoSeguimiento || '');
    });

  const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'USUARIO';
  const esSuper = usuario?.rol === 'superusuario';
  const esMantenimiento = usuario?.rol === 'mantenimiento';
  const mostrarTerritorial = puedeVerMetricasTerritoriales(usuario);

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <EncabezadoPagina
        titulo="PANEL DE CONTROL GENERAL"
        subtitulo="Quinde Control · Monitoreo y métricas en tiempo real"
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {esSuper && (
            <Link to="/reportes" className="boton boton--contorno">
              <FileText size={16} /> REPORTES PDF
            </Link>
          )}
          <Link to="/casos/nuevo" className="boton boton--primario">
            <Plus size={18} /> NUEVA NOVEDAD
          </Link>
        </div>
      </EncabezadoPagina>

      <div
        className="tarjeta"
        style={{
          background: esMantenimiento ? '#F0F9FF' : '#F8FBF8',
          borderLeft: `4px solid ${esMantenimiento ? 'var(--color-resuelto)' : 'var(--color-secundario)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {esMantenimiento && <Wrench size={18} style={{ color: 'var(--color-resuelto)' }} />}
          <div>
            <span className="texto-tenue">USUARIO ACTIVO:</span>{' '}
            <strong>{nombreUsuario}</strong> ·{' '}
            <span style={{ color: 'var(--color-secundario)', fontWeight: 800 }}>
              {etiquetasRol[usuario?.rol] || usuario?.rol}
            </span>
          </div>
        </div>
        {esMantenimiento && (
          <p className="texto-tenue" style={{ marginTop: '0.25rem', color: '#0369a1', fontWeight: 600 }}>
            Visualización y gestión restringida estrictamente a los casos asignados a la Dirección de Mantenimiento.
          </p>
        )}
      </div>

      {/* FILA 1: KPIS PRINCIPALES DE CASOS (Sincronizados con el rol) */}
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>
          {esMantenimiento ? 'NOVEDADES ASIGNADAS A MANTENIMIENTO' : 'ESTADO GENERAL DE CASOS Y NOVEDADES'}
        </h2>
        <div className="kpi-grid">
          <TarjetaMetrica titulo="TOTAL CASOS" valor={totalCasos} icono={<Shield />} color="var(--color-primario)" />
          <TarjetaMetrica titulo="CASOS ACTIVOS" valor={activos} icono={<Clock />} color="var(--color-info)" />
          <TarjetaMetrica titulo="PENDIENTES" valor={pendientes} icono={<AlertTriangle />} color="var(--color-advertencia)" />
          <TarjetaMetrica titulo="POR CONFIRMAR" valor={porConfirmar} icono={<CheckCircle />} color="var(--color-secundario)" />
          <TarjetaMetrica titulo="CASOS VENCIDOS" valor={vencidos} icono={<AlertTriangle />} color="var(--color-alerta)" destaca />
          <TarjetaMetrica titulo="CERRADOS" valor={cerrados} icono={<CheckCircle />} color="var(--color-resuelto)" />
        </div>
      </div>

      {/* FILA 2: KPIS DE INVENTARIO Y CATÁLOGOS — EXCLUSIVO SUPERUSUARIO */}
      {mostrarTerritorial && (
        <>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>MÉTRICAS TERRITORIALES Y CATÁLOGOS (SUPERUSUARIO)</h2>
            <div className="kpi-grid">
              <TarjetaMetrica titulo="USUARIOS SISTEMA" valor={usuarios.length} icono={<Users />} color="#11321d" subtexto="HABILITADOS" />
              <TarjetaMetrica titulo="ETAPAS REGISTRADAS" valor={etapas.length} icono={<Layers />} color="#11321d" subtexto="ZONAS CATASTRADAS" />
              <TarjetaMetrica titulo="CALLES REGISTRADAS" valor={calles.length} icono={<MapPin />} color="#11321d" subtexto="VÍAS URBANAS" />
              <TarjetaMetrica titulo="LOTES CATASTRADOS" valor={lotes.length} icono={<FolderTree />} color="#11321d" subtexto="3000+ PREDIOS" />
            </div>
          </div>

          {/* RESUMEN POR ETAPAS CON BARRAS DE PROGRESO */}
          <div className="tarjeta seccion-etapas">
            <h3>DISTRIBUCIÓN DE INCIDENCIAS POR ETAPA</h3>
            <p className="texto-tenue">Densidad territorial de novedades reportadas en la Urbanización El Condado.</p>
            <div className="barras-etapas">
              {etapas.map((etapa) => {
                const conteo = casos.filter((c) => c.etapa === etapa.nombre).length;
                const porcentaje = totalCasos > 0 ? ((conteo / totalCasos) * 100).toFixed(1) : 0;
                return (
                  <div key={etapa.id} className="barra-etapa-item">
                    <div className="barra-etapa-item__info">
                      <strong>{etapa.nombre}</strong>
                      <span>
                        <strong>{conteo} CASOS</strong> ({porcentaje}%)
                      </span>
                    </div>
                    <div className="barra-etapa-item__progress-bg">
                      <div className="barra-etapa-item__progress-fill" style={{ width: `${porcentaje}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* PENDIENTES DE SEGUIMIENTO */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2>PENDIENTES DE SEGUIMIENTO (VENCIDOS PRIMERO)</h2>
          <span className="texto-tenue">{pendientesSeguimiento.length} activos</span>
        </div>
        <div className="lista">
          {pendientesSeguimiento.length === 0 && (
            <p className="vacio">NO EXISTEN CASOS PENDIENTES DE ATENCIÓN 🎉</p>
          )}
          {pendientesSeguimiento.map((caso) => (
            <TarjetaCaso key={caso.id} caso={caso} />
          ))}
        </div>
      </section>
    </div>
  );
}
