import { useState } from 'react';
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

    setForm({ ...form, [name]: valorLimpio });
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!form.reportanteNombre.trim()) {
      nuevosErrores.reportanteNombre = 'INGRESE LOS NOMBRES Y APELLIDOS DEL REPORTANTE (SOLO LETRAS)';
    }
    if (!form.reportanteLote.trim()) {
      nuevosErrores.reportanteLote = 'DEBE BUSCAR Y SELECCIONAR EL LOTE DEL RESIDENTE';
    }
    if (!form.categoria) {
      nuevosErrores.categoria = 'SELECCIONE LA CATEGORÍA DE LA NOVEDAD';
    }
    if (!form.area) {
      nuevosErrores.area = 'SELECCIONE EL ÁREA ASIGNADA';
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

    mostrarToast('NOVEDAD REGISTRADA EXITOSAMENTE EN QUINDE CONTROL', 'exito');
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="REGISTRO DE NOVEDAD"
        subtitulo="Quinde Control · Ingreso con validación estricta y autocompletado de lotes"
      />

      <form className="tarjeta formulario" onSubmit={guardar} noValidate>
        <h2>INFORMACIÓN DEL REPORTANTE</h2>
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
              setForm({ ...form, reportanteLote: loteNombre });
              if (errores.reportanteLote) setErrores({ ...errores, reportanteLote: '' });
            }}
            error={errores.reportanteLote}
          />

          <CampoEntrada
            label="CONTACTO TELEFÓNICO (SOLO DÍGITOS)"
            tipo="tel"
            valor={form.reportanteContacto}
            onChange={(e) => {
              setForm({ ...form, reportanteContacto: soloNumeros(e.target.value) });
            }}
            placeholder="EJ: 0994286523"
            maxlength={10}
          />
        </div>

        <h2>DETALLE DE LA NOVEDAD</h2>
        <div className="grid-2">
          <div className="campo-grupo">
            <label className="campo-label">
              CATEGORÍA <span className="campo-requerido">*</span>
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
            {errores.categoria && <span className="campo-mensaje-error">{errores.categoria}</span>}
          </div>

          <div className="campo-grupo">
            <label className="campo-label">
              ÁREA QUE ATIENDE <span className="campo-requerido">*</span>
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
            <option value="MEDIA">MEDIA (PLAZO 5 DÍAS)</option>
            <option value="ALTA">ALTA (PLAZO 3 DÍAS)</option>
            <option value="URGENTE">URGENTE (PLAZO 1 DÍA)</option>
          </select>
        </div>

        <h2>UBICACIÓN DENTRO DE LA URBANIZACIÓN || LUGAR DE LA NOVEDAD</h2>
        <div className="grid-3">
          <div className="campo-grupo">
            <label className="campo-label">
              ETAPA <span className="campo-requerido">*</span>
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
            <label className="campo-label">CALLE SECUNDARIA</label>
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
          label="REFERENCIA DE UBICACIÓN"
          valor={form.referenciaUbicacion}
          onChange={(e) => setForm({ ...form, referenciaUbicacion: aMayusculas(e.target.value) })}
          placeholder="EJ: FRENTE A LA GARITA PRINCIPAL, JUNTO A CANCHA"
        />

        <h2>ADJUNTOS DE APERTURA (OPCIONALES)</h2>
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
          GUARDAR REPORTE EN QUINDE CONTROL
        </button>
      </form>
    </>
  );
}
