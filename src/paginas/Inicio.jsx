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
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaMetrica from '../componentes/TarjetaMetrica';
import TarjetaCaso from '../componentes/TarjetaCaso';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useSesion } from '../contextos/ContextoSesion';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { etiquetasRol } from '../datos/datosDemo';
import { puedeVerMetricasTerritoriales } from '../utilidades/permisos';
import { diasDeAtraso } from '../utilidades/fechas';

/**
 * Inicio
 * Panel de control principal con KPIs animados, métricas territoriales,
 * distribución por etapas y lista priorizada de seguimiento.
 */
export default function Inicio() {
  const { casos } = useCasos();
  const { etapas, calles, lotes } = useCatalogos();
  const { usuario, usuarios } = useSesion();
  const { nombreUrbanizacion } = useConfiguracion();

  const totalCasos = casos.length;
  const enProceso = casos.filter((c) => c.estado === 'en_proceso').length;
  const porConfirmar = casos.filter((c) => c.estado === 'por_confirmar').length;
  const activos = enProceso + porConfirmar;
  const vencidos = casos.filter(
    (c) => c.esVencido || (c.estado !== 'cerrado' && diasDeAtraso(c.proximoSeguimiento) > 0)
  ).length;
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

  const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';
  const esSuper = usuario?.rol === 'superusuario';
  const esMantenimiento = usuario?.rol === 'mantenimiento';
  const mostrarTerritorial = puedeVerMetricasTerritoriales(usuario);

  return (
    <div className="pagina-inicio">
      <EncabezadoPagina
        titulo="Panel de Control General"
        subtitulo="Monitoreo operativo, indicadores de gestión y seguimiento territorial"
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {esSuper && (
            <Link to="/reportes" className="boton boton--secundario">
              <FileText size={16} />
              <span>Reportes PDF</span>
            </Link>
          )}
          <Link to="/casos/nuevo" className="boton boton--primario">
            <Plus size={18} />
            <span>Nueva Novedad</span>
          </Link>
        </div>
      </EncabezadoPagina>

      {/* Saludo y rol activo */}
      <div
        className="tarjeta"
        style={{
          borderLeft: `4px solid ${
            esMantenimiento ? 'var(--color-info)' : 'var(--color-esmeralda-medio)'
          }`,
          background: esMantenimiento ? '#f0f9ff' : '#f8fdfa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {esMantenimiento ? (
            <Wrench size={20} style={{ color: 'var(--color-info)' }} />
          ) : (
            <Sparkles size={20} style={{ color: 'var(--color-esmeralda-medio)' }} />
          )}
          <div>
            <span className="texto-tenue">Sesión iniciada como:</span>{' '}
            <strong style={{ color: 'var(--color-texto-principal)' }}>{nombreUsuario}</strong> ·{' '}
            <span className="badge badge--activo">
              {etiquetasRol[usuario?.rol] || usuario?.rol}
            </span>
          </div>
        </div>
        {esMantenimiento && (
          <p
            className="texto-tenue"
            style={{ marginTop: '4px', color: '#0369a1', fontWeight: 600 }}
          >
            Visualización y gestión restringida estrictamente a los casos asignados a la Dirección de Mantenimiento.
          </p>
        )}
      </div>

      {/* KPIS PRINCIPALES */}
      <section>
        <h2 className="titulo-seccion" style={{ marginBottom: '12px' }}>
          {esMantenimiento
            ? 'Novedades Asignadas a Mantenimiento'
            : 'Estado General de Casos y Novedades'}
        </h2>
        <div className="kpi-grid">
          <TarjetaMetrica
            titulo="Total Casos"
            valor={totalCasos}
            icono={<Shield />}
            color="var(--color-esmeralda-oscuro)"
          />
          <TarjetaMetrica
            titulo="Casos Activos"
            valor={activos}
            icono={<Clock />}
            color="var(--color-info)"
            subtexto="En proceso + Por confirmar"
          />
          <TarjetaMetrica
            titulo="En Proceso"
            valor={enProceso}
            icono={<Clock />}
            color="var(--color-estado-proceso)"
          />
          <TarjetaMetrica
            titulo="Por Confirmar"
            valor={porConfirmar}
            icono={<CheckCircle2 />}
            color="var(--color-estado-confirmar)"
          />
          <TarjetaMetrica
            titulo="Casos Vencidos"
            valor={vencidos}
            icono={<AlertTriangle />}
            color="var(--color-peligro)"
            destaca={vencidos > 0}
          />
          <TarjetaMetrica
            titulo="Cerrados"
            valor={cerrados}
            icono={<CheckCircle />}
            color="var(--color-exito)"
          />
        </div>
      </section>

      {/* KPIS TERRITORIALES (SUPERUSUARIO) */}
      {mostrarTerritorial && (
        <section>
          <h2 className="titulo-seccion" style={{ marginBottom: '12px' }}>
            Métricas Territoriales y Catálogos
          </h2>
          <div className="kpi-grid">
            <TarjetaMetrica
              titulo="Usuarios"
              valor={usuarios.length}
              icono={<Users />}
              color="var(--color-esmeralda-oscuro)"
              subtexto="Habilitados"
            />
            <TarjetaMetrica
              titulo="Etapas"
              valor={etapas.length}
              icono={<Layers />}
              color="var(--color-esmeralda-oscuro)"
              subtexto="Catálogo activo"
            />
            <TarjetaMetrica
              titulo="Calles"
              valor={calles.length}
              icono={<MapPin />}
              color="var(--color-esmeralda-oscuro)"
              subtexto="Vías registradas"
            />
            <TarjetaMetrica
              titulo="Lotes"
              valor={lotes.length}
              icono={<FolderTree />}
              color="var(--color-esmeralda-oscuro)"
              subtexto="Códigos NUMERO.SUBLOTE"
            />
          </div>

          {/* DISTRIBUCIÓN POR ETAPAS */}
          <div className="tarjeta" style={{ marginTop: '16px' }}>
            <h3 className="tarjeta__titulo">
              <Layers size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
              <span>Distribución de Incidencias por Etapa</span>
            </h3>
            <p className="texto-tenue">
              Densidad territorial de novedades reportadas en {nombreUrbanizacion || 'la urbanización'}.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '12px',
              }}
            >
              {etapas.map((etapa) => {
                const conteo = casos.filter((c) => c.etapa === etapa.nombre).length;
                const porcentaje = totalCasos > 0 ? ((conteo / totalCasos) * 100).toFixed(1) : 0;
                return (
                  <div key={etapa.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                      }}
                    >
                      <strong style={{ color: 'var(--color-texto-principal)' }}>{etapa.nombre}</strong>
                      <span className="texto-mono">
                        <strong>{conteo} casos</strong> ({porcentaje}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${porcentaje}%`,
                          background: 'linear-gradient(90deg, #047857 0%, #10b981 100%)',
                          borderRadius: '999px',
                          transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CASOS PENDIENTES DE SEGUIMIENTO */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h2 className="titulo-seccion">Pendientes de Seguimiento (Vencidos Primero)</h2>
          <span className="texto-tenue">{pendientesSeguimiento.length} activos</span>
        </div>

        {pendientesSeguimiento.length === 0 ? (
          <div className="tarjeta estado-vacio">
            <CheckCircle size={36} style={{ color: 'var(--color-exito)' }} />
            <h3 className="estado-vacio__titulo">No existen casos pendientes 🎉</h3>
            <p className="estado-vacio__texto">
              Todas las incidencias comunitarias han sido resueltas y confirmadas.
            </p>
          </div>
        ) : (
          <div className="casos-cuadricula-tarjetas">
            {pendientesSeguimiento.slice(0, 6).map((caso, index) => (
              <div
                key={caso.id}
                className="animar-escalonado"
                style={{ '--i': index }}
              >
                <TarjetaCaso caso={caso} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
