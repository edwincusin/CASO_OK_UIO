import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  FileCheck2,
  Upload,
  FileText,
  Save,
  Info,
} from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
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
 * Formulario estructurado por secciones para registro de novedades comunitarias:
 * 1. Reportante y Lote
 * 2. Ubicación territorial independiente (Etapa, Calles)
 * 3. Clasificación oficial y descripción
 * 4. Evidencias con cargador accesible personalizado
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

  const categoriaSeleccionadaObj = useMemo(() => {
    if (!form.categoria) return null;
    return categorias.find((c) => c.nombre === form.categoria) || null;
  }, [form.categoria, categorias]);

  function sugerirAreaParaCategoria(nombreCategoria) {
    if (!nombreCategoria) return '';
    const cat = categorias.find((c) => c.nombre === nombreCategoria);
    if (cat?.areaSugerida) return cat.areaSugerida;

    const texto = nombreCategoria.toUpperCase();
    if (
      texto.startsWith('01') ||
      texto.startsWith('04') ||
      texto.startsWith('06') ||
      texto.startsWith('07')
    ) {
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
      nuevosErrores.reportanteNombre =
        'Ingrese los nombres y apellidos del reportante (solo letras y espacios)';
    }
    if (!form.reportanteLote.trim()) {
      nuevosErrores.reportanteLote =
        'Debe buscar y seleccionar el lote del residente (NUMERO.SUBLOTE)';
    }
    if (!form.categoria) {
      nuevosErrores.categoria = 'Seleccione la categoría de la novedad';
    }
    if (!form.area) {
      nuevosErrores.area = 'Seleccione el área responsable';
    }
    if (!form.etapa) {
      nuevosErrores.etapa = 'Seleccione la etapa donde ocurrió la novedad';
    }
    if (!form.callePrimaria) {
      nuevosErrores.callePrimaria = 'Seleccione la calle primaria';
    }
    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'Detalle la descripción de la novedad';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function guardar(e) {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarToast('Por favor revise los campos requeridos en el formulario', 'alerta');
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

    mostrarToast('Novedad registrada exitosamente en CASOOK', 'exito');
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espacio-5)' }}>
      <EncabezadoPagina
        titulo="Registro de Novedad"
        subtitulo="Formulario oficial de reporte, categorización y despacho a territorio"
      />

      <form className="formulario" onSubmit={guardar} noValidate>
        {/* SECCIÓN 1: REPORTANTE */}
        <section className="formulario__seccion">
          <h2 className="formulario__seccion-titulo">
            <User size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>1. Información del Reportante</span>
          </h2>

          <div className="grid-formulario-2">
            <CampoEntrada
              label="Nombres y Apellidos del Reportante"
              name="reportanteNombre"
              requerido
              valor={form.reportanteNombre}
              onChange={manejarCambio}
              error={errores.reportanteNombre}
              placeholder="Ej: Alejandra Pazmiño"
              ayuda="Solo se permiten letras y espacios"
            />

            <div className="campo-grupo">
              <label className="campo-label" htmlFor="reportanteTipo">
                <span>Relación con la Urbanización</span>
                <span className="campo-requerido">*</span>
              </label>
              <select
                id="reportanteTipo"
                name="reportanteTipo"
                className="campo-select"
                value={form.reportanteTipo}
                onChange={manejarCambio}
              >
                <option value="PROPIETARIO">Propietario</option>
                <option value="INQUILINO">Inquilino</option>
                <option value="VISITA">Visita</option>
                <option value="PERSONAL INTERNO">Personal Interno</option>
              </select>
            </div>

            <AutocompleteLote
              lotes={lotes}
              valorSeleccionado={form.reportanteLote}
              alSeleccionar={(loteNombre) => {
                setForm((prev) => ({ ...prev, reportanteLote: loteNombre }));
                if (errores.reportanteLote)
                  setErrores((prev) => ({ ...prev, reportanteLote: '' }));
              }}
              error={errores.reportanteLote}
            />

            <CampoEntrada
              label="Contacto Telefónico"
              tipo="tel"
              valor={form.reportanteContacto}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  reportanteContacto: soloNumeros(e.target.value),
                }));
              }}
              placeholder="Ej: 0994286523"
              maxlength={10}
              ayuda="10 dígitos para contacto directo o WhatsApp"
            />
          </div>
        </section>

        {/* SECCIÓN 2: UBICACIÓN TERRITORIAL */}
        <section className="formulario__seccion">
          <h2 className="formulario__seccion-titulo">
            <MapPin size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>2. Ubicación de la Novedad</span>
          </h2>

          <div className="grid-formulario-3">
            <div className="campo-grupo">
              <label className="campo-label" htmlFor="etapa">
                <span>Etapa Independiente</span>
                <span className="campo-requerido">*</span>
              </label>
              <select
                id="etapa"
                name="etapa"
                className={`campo-select ${errores.etapa ? 'campo-select--error' : ''}`}
                value={form.etapa}
                onChange={manejarCambio}
              >
                <option value="">Seleccione etapa...</option>
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
              <label className="campo-label" htmlFor="callePrimaria">
                <span>Calle Primaria</span>
                <span className="campo-requerido">*</span>
              </label>
              <select
                id="callePrimaria"
                name="callePrimaria"
                className={`campo-select ${
                  errores.callePrimaria ? 'campo-select--error' : ''
                }`}
                value={form.callePrimaria}
                onChange={manejarCambio}
              >
                <option value="">Seleccione calle primaria...</option>
                {calles
                  .filter((c) => c.estado)
                  .map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
              {errores.callePrimaria && (
                <span className="campo-mensaje-error">{errores.callePrimaria}</span>
              )}
            </div>

            <div className="campo-grupo">
              <label className="campo-label" htmlFor="calleSecundaria">
                <span>Calle Secundaria (Intersección)</span>
              </label>
              <select
                id="calleSecundaria"
                name="calleSecundaria"
                className="campo-select"
                value={form.calleSecundaria}
                onChange={manejarCambio}
              >
                <option value="">Seleccione calle secundaria...</option>
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
            label="Referencia Específica de Ubicación"
            valor={form.referenciaUbicacion}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                referenciaUbicacion: aMayusculas(e.target.value),
              }))
            }
            placeholder="Ej: Frente a la garita 2, junto a la cancha deportiva"
          />
        </section>

        {/* SECCIÓN 3: CLASIFICACIÓN Y DESCRIPCIÓN */}
        <section className="formulario__seccion">
          <h2 className="formulario__seccion-titulo">
            <FileCheck2 size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>3. Detalle de la Novedad y Clasificación</span>
          </h2>

          <div className="grid-formulario-2">
            <div className="campo-grupo">
              <label className="campo-label" htmlFor="categoria">
                <span>Categoría Oficial</span>
                <span className="campo-requerido">*</span>
              </label>
              <select
                id="categoria"
                name="categoria"
                className={`campo-select ${
                  errores.categoria ? 'campo-select--error' : ''
                }`}
                value={form.categoria}
                onChange={manejarCambio}
              >
                <option value="">Seleccione categoría...</option>
                {categorias
                  .filter((c) => c.estado)
                  .map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
              {categoriaSeleccionadaObj?.descripcion && (
                <span
                  className="campo-ayuda"
                  style={{
                    color: 'var(--color-esmeralda-oscuro)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <Info size={13} />
                  <span>{categoriaSeleccionadaObj.descripcion}</span>
                </span>
              )}
              {errores.categoria && (
                <span className="campo-mensaje-error">{errores.categoria}</span>
              )}
            </div>

            <div className="campo-grupo">
              <label className="campo-label" htmlFor="area">
                <span>Área Responsable Asignada</span>
                <span className="campo-requerido">*</span>
              </label>
              <select
                id="area"
                name="area"
                className={`campo-select ${errores.area ? 'campo-select--error' : ''}`}
                value={form.area}
                onChange={manejarCambio}
              >
                <option value="">Seleccione área...</option>
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
            <label className="campo-label" htmlFor="descripcion">
              <span>Descripción de la Novedad</span>
              <span className="campo-requerido">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              className={`campo-textarea ${
                errores.descripcion ? 'campo-textarea--error' : ''
              }`}
              value={form.descripcion}
              onChange={manejarCambio}
              placeholder="Detalle los hechos observados, personas o vehículos involucrados, etc."
            />
            {errores.descripcion && (
              <span className="campo-mensaje-error">{errores.descripcion}</span>
            )}
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="prioridad">
              <span>Prioridad del Caso</span>
              <span className="campo-requerido">*</span>
            </label>
            <select
              id="prioridad"
              name="prioridad"
              className="campo-select"
              value={form.prioridad}
              onChange={manejarCambio}
            >
              <option value="BAJA">Baja (Plazo de atención: 5 días)</option>
              <option value="MEDIA">Media (Plazo de atención: 3 días)</option>
              <option value="ALTA">Alta (Plazo de atención: 2 días)</option>
              <option value="URGENTE">Urgente (Plazo de atención: 1 día)</option>
            </select>
          </div>
        </section>

        {/* SECCIÓN 4: EVIDENCIAS CON CARGA ACCESIBLE */}
        <section className="formulario__seccion">
          <h2 className="formulario__seccion-titulo">
            <Upload size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>4. Evidencias Fotográficas y Documentos</span>
          </h2>

          <div className="grid-formulario-2">
            {/* Foto inicial */}
            <div className="campo-grupo">
              <span className="campo-label">Foto Inicial de Apertura (Opcional)</span>
              <label className="zona-archivo" htmlFor="fotoInicialInput">
                <input
                  id="fotoInicialInput"
                  type="file"
                  accept="image/*"
                  className="zona-archivo__input-nativo"
                  onChange={(e) => setFotoInicial(e.target.files ? e.target.files[0] : null)}
                />
                <div className="zona-archivo__contenedor">
                  <span className="zona-archivo__icono">
                    <Upload size={24} />
                  </span>
                  <span className="zona-archivo__texto-principal">
                    Seleccionar o arrastrar fotografía
                  </span>
                  <span className="zona-archivo__texto-secundario">
                    JPG, PNG o WebP desde galería o cámara
                  </span>
                </div>
              </label>

              {fotoInicial && (
                <div className="zona-archivo__vista-previa">
                  <img
                    src={URL.createObjectURL(fotoInicial)}
                    alt="Vista previa inicial"
                    className="zona-archivo__miniatura"
                  />
                  <span className="zona-archivo__nombre-archivo">{fotoInicial.name}</span>
                  <button
                    type="button"
                    className="boton boton--sm boton--peligro"
                    onClick={() => setFotoInicial(null)}
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            {/* Oficio PDF */}
            <div className="campo-grupo">
              <span className="campo-label">Documento Oficio PDF (Opcional)</span>
              <label className="zona-archivo" htmlFor="pdfInicialInput">
                <input
                  id="pdfInicialInput"
                  type="file"
                  accept="application/pdf"
                  className="zona-archivo__input-nativo"
                  onChange={(e) => setPdfInicial(e.target.files ? e.target.files[0] : null)}
                />
                <div className="zona-archivo__contenedor">
                  <span className="zona-archivo__icono">
                    <FileText size={24} />
                  </span>
                  <span className="zona-archivo__texto-principal">
                    Seleccionar o arrastrar oficio PDF
                  </span>
                  <span className="zona-archivo__texto-secundario">
                    Archivos en formato .PDF
                  </span>
                </div>
              </label>

              {pdfInicial && (
                <div className="zona-archivo__vista-previa">
                  <FileText size={24} style={{ color: 'var(--color-esmeralda-medio)' }} />
                  <span className="zona-archivo__nombre-archivo">{pdfInicial.name}</span>
                  <button
                    type="button"
                    className="boton boton--sm boton--peligro"
                    onClick={() => setPdfInicial(null)}
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="boton boton--primario boton--grande boton--completo"
        >
          <Save size={20} />
          <span>Registrar Novedad en CASOOK</span>
        </button>
      </form>
    </div>
  );
}
