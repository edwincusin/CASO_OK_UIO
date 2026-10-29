import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import VistaPreviaImagen from '../componentes/VistaPreviaImagen';
import AutocompleteLote from '../componentes/AutocompleteLote';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { aMayusculas } from '../utilidades/texto';
import { soloLetras, soloNumeros } from '../utilidades/validaciones';

/**
 * CasoNuevo
 * Formulario de creación de casos para CASOOK:
 * - 3 selectores independientes: Etapa, Calle y Lote.
 * - 10 categorías oficiales con código, descripción de ayuda y sugerencia automática de área responsable.
 * - Registro con validación estricta y fechaHoraApertura ISO (America/Guayaquil).
 */

export default function CasoNuevo() {
  const { usuario } = useSesion();
  const { crearCaso } = useCasos();
  const { etapas, lotes, calles, areas, categorias } = useCatalogos();
  const { mostrarToast } = useToast();
  const navegar = useNavigate();

  const [form, setForm] = useState({
    reportanteNombre: '',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: '',
    reportanteContacto: '',
    categoria: '',
    area: '',
    descripcion: '',
    prioridad: 'MEDIA',
    etapa: '',
    callePrimaria: '',
    calleSecundaria: '',
    referenciaUbicacion: '',
  });

  const [fotoInicial, setFotoInicial] = useState(null);
  const [pdfInicial, setPdfInicial] = useState(null);
  const [errores, setErrores] = useState({});

  // Objeto de la categoría actualmente seleccionada para mostrar su descripción
  const categoriaSeleccionadaObj = useMemo(() => {
    if (!form.categoria) return null;
    return categorias.find((c) => c.nombre === form.categoria) || null;
  }, [form.categoria, categorias]);

  function sugerirAreaParaCategoria(nombreCategoria) {
    if (!nombreCategoria) return '';
    const cat = categorias.find((c) => c.nombre === nombreCategoria);
    if (cat?.areaSugerida) return cat.areaSugerida;

    const texto = nombreCategoria.toUpperCase();
    if (texto.startsWith('01') || texto.startsWith('04') || texto.startsWith('06') || texto.startsWith('07')) {
      return 'MANTENIMIENTO';
    }
    if (texto.startsWith('02')) {
      return 'SEGURIDAD';
    }
    return 'ADMINISTRACIÓN';
  }

  function manejarCambio(e) {
    const { name, value } = e.target;
    let valorLimpio = value;

    if (name === 'reportanteNombre') {
      valorLimpio = soloLetras(aMayusculas(value));
    } else if (name === 'reportanteContacto') {
      valorLimpio = soloNumeros(value);
    } else {
      valorLimpio = aMayusculas(value);
    }

    if (name === 'categoria') {
      const areaSugerida = sugerirAreaParaCategoria(value);
      setForm((prev) => ({
        ...prev,
        categoria: value,
        area: areaSugerida || prev.area,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: valorLimpio }));
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!form.reportanteNombre.trim()) {
      nuevosErrores.reportanteNombre = 'INGRESE LOS NOMBRES Y APELLIDOS DEL REPORTANTE (SOLO LETRAS)';
    }
    if (!form.reportanteLote.trim()) {
      nuevosErrores.reportanteLote = 'DEBE BUSCAR Y SELECCIONAR EL LOTE DEL RESIDENTE (NUMERO.SUBLOTE)';
    }
    if (!form.categoria) {
      nuevosErrores.categoria = 'SELECCIONE LA CATEGORÍA DE LA NOVEDAD';
    }
    if (!form.area) {
      nuevosErrores.area = 'SELECCIONE EL ÁREA RESPONSABLE';
    }
    if (!form.etapa) {
      nuevosErrores.etapa = 'SELECCIONE LA ETAPA DONDE OCURRIÓ LA NOVEDAD';
    }
    if (!form.callePrimaria) {
      nuevosErrores.callePrimaria = 'SELECCIONE LA CALLE PRIMARIA';
    }
    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'DETALLE LA DESCRIPCIÓN DE LA NOVEDAD';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function guardar(e) {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarToast('POR FAVOR REVISE LOS CAMPOS OBLIGATORIOS MARCADOS EN ROJO', 'alerta');
      return;
    }

    const casoCreado = crearCaso(
      {
        ...form,
        fotoInicial: fotoInicial ? fotoInicial.name : null,
        pdfInicial: pdfInicial ? pdfInicial.name : null,
      },
      usuario
    );

    mostrarToast('NOVEDAD REGISTRADA EXITOSAMENTE EN CASOOK (EN PROCESO)', 'exito');
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="REGISTRO DE NOVEDAD"
        subtitulo="CASOOK · Formulario oficial de reporte y despacho de casos"
      />

      <form className="tarjeta formulario" onSubmit={guardar} noValidate>
        <h2>1. INFORMACIÓN DEL REPORTANTE</h2>
        <div className="grid-2">
          <CampoEntrada
            label="NOMBRES Y APELLIDOS DEL REPORTANTE"
            name="reportanteNombre"
            requerido
            valor={form.reportanteNombre}
            onChange={manejarCambio}
            error={errores.reportanteNombre}
            placeholder="EJ: ALEJANDRA PAZMIÑO (LETRAS Y ESPACIOS)"
          />

          <div className="campo-grupo">
            <label className="campo-label">
              RELACIÓN CON LA URBANIZACIÓN <span className="campo-requerido">*</span>
            </label>
            <select
              name="reportanteTipo"
              className="campo-input"
              value={form.reportanteTipo}
              onChange={manejarCambio}
            >
              <option value="PROPIETARIO">PROPIETARIO</option>
              <option value="INQUILINO">INQUILINO</option>
              <option value="VISITA">VISITA</option>
              <option value="PERSONAL INTERNO">PERSONAL INTERNO</option>
            </select>
          </div>

          <AutocompleteLote
            lotes={lotes}
            valorSeleccionado={form.reportanteLote}
            alSeleccionar={(loteNombre) => {
              setForm((prev) => ({ ...prev, reportanteLote: loteNombre }));
              if (errores.reportanteLote) setErrores((prev) => ({ ...prev, reportanteLote: '' }));
            }}
            error={errores.reportanteLote}
          />

          <CampoEntrada
            label="CONTACTO TELEFÓNICO (SOLO DÍGITOS)"
            tipo="tel"
            valor={form.reportanteContacto}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, reportanteContacto: soloNumeros(e.target.value) }));
            }}
            placeholder="EJ: 0994286523"
            maxlength={10}
          />
        </div>

        <h2>2. UBICACIÓN DE LA NOVEDAD (TRES SELECTORES INDEPENDIENTES)</h2>
        <div className="grid-3">
          <div className="campo-grupo">
            <label className="campo-label">
              ETAPA INDEPENDIENTE <span className="campo-requerido">*</span>
            </label>
            <select
              name="etapa"
              className={`campo-input ${errores.etapa ? 'campo-input--error' : ''}`}
              value={form.etapa}
              onChange={manejarCambio}
            >
              <option value="">SELECCIONE ETAPA...</option>
              {etapas
                .filter((e) => e.estado)
                .map((e) => (
                  <option key={e.id} value={e.nombre}>
                    {e.nombre}
                  </option>
                ))}
            </select>
            {errores.etapa && <span className="campo-mensaje-error">{errores.etapa}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label">
              CALLE PRIMARIA <span className="campo-requerido">*</span>
            </label>
            <select
              name="callePrimaria"
              className={`campo-input ${errores.callePrimaria ? 'campo-input--error' : ''}`}
              value={form.callePrimaria}
              onChange={manejarCambio}
            >
              <option value="">SELECCIONE CALLE PRIMARIA...</option>
              {calles
                .filter((c) => c.estado)
                .map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            {errores.callePrimaria && <span className="campo-mensaje-error">{errores.callePrimaria}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label">CALLE SECUNDARIA (INTERSECCIÓN)</label>
            <select
              name="calleSecundaria"
              className="campo-input"
              value={form.calleSecundaria}
              onChange={manejarCambio}
            >
              <option value="">SELECCIONE CALLE SECUNDARIA...</option>
              {calles
                .filter((c) => c.estado)
                .map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <CampoEntrada
          label="REFERENCIA ESPECÍFICA DE UBICACIÓN"
          valor={form.referenciaUbicacion}
          onChange={(e) => setForm((prev) => ({ ...prev, referenciaUbicacion: aMayusculas(e.target.value) }))}
          placeholder="EJ: FRENTE A LA GARITA PRINCIPAL, JUNTO A CANCHA DEPORTIVA"
        />

        <h2>3. DETALLE DE LA NOVEDAD Y CLASIFICACIÓN OFICIAL</h2>
        <div className="grid-2">
          <div className="campo-grupo">
            <label className="campo-label">
              CATEGORÍA OFICIAL <span className="campo-requerido">*</span>
            </label>
            <select
              name="categoria"
              className={`campo-input ${errores.categoria ? 'campo-input--error' : ''}`}
              value={form.categoria}
              onChange={manejarCambio}
            >
              <option value="">SELECCIONE CATEGORÍA...</option>
              {categorias
                .filter((c) => c.estado)
                .map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            {/* Texto de ayuda descriptivo según la categoría seleccionada */}
            {categoriaSeleccionadaObj?.descripcion && (
              <span className="texto-tenue" style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: '#166534', fontWeight: 500 }}>
                ℹ {categoriaSeleccionadaObj.descripcion}
              </span>
            )}
            {errores.categoria && <span className="campo-mensaje-error">{errores.categoria}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label">
              ÁREA RESPONSABLE ASIGNADA <span className="campo-requerido">*</span>
            </label>
            <select
              name="area"
              className={`campo-input ${errores.area ? 'campo-input--error' : ''}`}
              value={form.area}
              onChange={manejarCambio}
            >
              <option value="">SELECCIONE ÁREA...</option>
              {areas
                .filter((a) => a.estado)
                .map((a) => (
                  <option key={a.id} value={a.nombre}>
                    {a.nombre}
                  </option>
                ))}
            </select>
            {errores.area && <span className="campo-mensaje-error">{errores.area}</span>}
          </div>
        </div>

        <div className="campo-grupo">
          <label className="campo-label">
            DESCRIPCIÓN DE LA NOVEDAD <span className="campo-requerido">*</span>
          </label>
          <textarea
            name="descripcion"
            rows={3}
            className={`campo-input ${errores.descripcion ? 'campo-input--error' : ''}`}
            value={form.descripcion}
            onChange={manejarCambio}
            placeholder="DETALLE DE LA INCIDENCIA OCURRIDA..."
          />
          {errores.descripcion && <span className="campo-mensaje-error">{errores.descripcion}</span>}
        </div>

        <div className="campo-grupo">
          <label className="campo-label">
            PRIORIDAD DEL CASO <span className="campo-requerido">*</span>
          </label>
          <select name="prioridad" className="campo-input" value={form.prioridad} onChange={manejarCambio}>
            <option value="BAJA">BAJA (PLAZO 5 DÍAS)</option>
            <option value="MEDIA">MEDIA (PLAZO 3 DÍAS)</option>
            <option value="ALTA">ALTA (PLAZO 2 DÍAS)</option>
            <option value="URGENTE">URGENTE (PLAZO 1 DÍA)</option>
          </select>
        </div>

        <h2>4. EVIDENCIAS FOTOGRÁFICAS Y DOCUMENTOS</h2>
        <div className="grid-2">
          <div className="campo-grupo">
            <label className="campo-label">FOTO INICIAL DE APERTURA (OPCIONAL)</label>
            <input
              type="file"
              accept="image/*"
              className="campo-input"
              onChange={(e) => setFotoInicial(e.target.files ? e.target.files[0] : null)}
            />
            {fotoInicial && (
              <VistaPreviaImagen
                archivo={fotoInicial}
                alEliminar={() => setFotoInicial(null)}
                titulo="FOTO INICIAL"
              />
            )}
          </div>
          <div className="campo-grupo">
            <label className="campo-label">DOCUMENTO OFICIO PDF (OPCIONAL)</label>
            <input
              type="file"
              accept="application/pdf"
              className="campo-input"
              onChange={(e) => setPdfInicial(e.target.files ? e.target.files[0] : null)}
            />
            {pdfInicial && (
              <span className="texto-tenue" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                Archivo seleccionado: <strong>{pdfInicial.name}</strong>
              </span>
            )}
          </div>
        </div>

        <button type="submit" className="boton boton--primario boton--completo" style={{ marginTop: '0.5rem' }}>
          REGISTRAR CASO EN CASOOK
        </button>
      </form>
    </>
  );
}
