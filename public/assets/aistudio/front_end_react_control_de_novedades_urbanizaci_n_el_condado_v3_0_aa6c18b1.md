# Front-end React · Control de Novedades — Urbanización El Condado (v3.0 - Especificación Completa)

Guía y especificación integral para la construcción del **front-end** en **React 19 + Vite** del sistema de gestión de casos y reportes (estilo 911 de atención inmediata). Esta versión 3.0 refina el modelo de datos territorial (Etapas, Lotes, Calles), flexibiliza el manejo de archivos adjuntos, potencia la validación de identidades ecuatorianas, amplía los reportes avanzados y presenta un Dashboard Ejecutivo de alto impacto visual.

---

## 1. Nuevos Requerimientos y Reglas de Negocio (Versión 3.0)

### 1.1 Estructura del Reportante y Novedad
* **Tipo de Relación del Reportante:** `PROPIETARIO` | `INQUILINO` | `VISITA` | `PERSONAL INTERNO`.
* **Identificación del Residente:** Nombre completo, contacto telefónico y número de Lote específico del reportante (Ejemplo: `LOTE 508.6`).
* **Ubicación Exacta de la Novedad dentro de la Urbanización:**
  * **Etapa:** Selección obligatoria (`ETAPA 1`, `ETAPA 2`, `ETAPA 3`).
  * **Calle Primaria:** Selección desde catálogo administrable.
  * **Calle Secundaria:** Selección desde catálogo administrable.
  * **Referencia de Ubicación:** Campo de texto libre para detalles específicos (Ejemplo: `FRENTE AL PARQUE CENTRAL`).

### 1.2 Adjuntos y Visualización de Imágenes
* **Fotos No Obligatorias:** La foto inicial de apertura y la foto final de cierre pasan a ser opcionales para no bloquear el flujo rápido de registro.
* **Miniautora / Vista Previa (Thumbnails):** 
  * Al cargar un archivo de imagen en los formularios, se muestra de inmediato un panel en miniatura (thumbnail) de $80 \times 80\text{ px}$ con opción de borrar o reemplazar antes de enviar.
  * En los listados de tarjetas y tablas, se despliega una miniatura interactiva que expande la imagen a pantalla completa al hacer clic (Modal de Visor de Imágenes).

### 1.3 Validación de Cédula Ecuatoriana (Algoritmo Módulo 10)
* En el módulo de creación y edición de usuarios, el campo Cédula aplica el algoritmo de verificación **Módulo 10** oficial del Registro Civil de Ecuador:
  1. Verificar que tenga exactamente 10 dígitos numéricos.
  2. Validar que el código de provincia (primeros dos dígitos) esté entre `01` y `24`, o sea `30`.
  3. Validar que el tercer dígito sea menor a `6` (personas naturales).
  4. Aplicar coeficientes `[2, 1, 2, 1, 2, 1, 2, 1, 2]` a los 9 primeros dígitos, restar 9 a los resultados $\ge 10$, sumar los dígitos y comprobar el dígito verificador.

### 1.4 Nuevos Catálogos Administrables (CRUD Superusuario)
El superusuario administra con **borrado lógico** (`HABILITADO` / `INACTIVO`):
* **Catálogo de Etapas:** (`ETAPA 1`, `ETAPA 2`, `ETAPA 3`).
* **Catálogo de Lotes:** Registro de numeración formal de propiedades.
* **Catálogo de Calles:** Vías principales y secundarias de la urbanización.
* **Catálogo de Áreas que Atienden:** (`SEGURIDAD`, `MANTENIMIENTO`, `ADMINISTRACIÓN`, etc.).
* **Catálogo de Categorías:** Clasificación del tipo de incidencia.

### 1.5 Reportes por Usuario Creador
* Filtro adicional en la pantalla de Reportes para seleccionar el usuario que abrió/registró los casos.
* Permite auditar la productividad del personal de seguridad o recepción en turnos específicos.

### 1.6 Dashboard Principal Profesional (Métricas KPI)
* Panel de control visual con tarjetas de resumen, gráficos de estado y contadores en tiempo real:
  * Total de Usuarios Registrados y Activos.
  * Indicadores por Catálogo (Total Calles, Total Lotes, Total Etapas).
  * Distribución de Casos: `TOTALES`, `ACTIVOS`, `PENDIENTES`, `POR CONFIRMAR`, `VENCIDOS`, `CERRADOS`.
  * Gráfico de densidad de incidencias por Etapa (`ETAPA 1` vs `ETAPA 2` vs `ETAPA 3`).

---

## 2. Estructura del Proyecto

```text
src/
├── main.jsx
├── App.jsx
├── estilos/
│   ├── variables.css
│   └── global.css
├── datos/
│   └── datosDemo.js            ← Mock data actualizado (Etapas, Lotes, Calles)
├── utilidades/
│   ├── validacionCedula.js     ← Algoritmo Módulo 10 Ecuador
│   ├── fechas.js
│   ├── permisos.js
│   ├── texto.js                ← Mayúsculas y formato WhatsApp V3
│   └── generadorPdf.js         ← PDF de reportes con filtro por Usuario
├── contextos/
│   ├── ContextoSesion.jsx
│   ├── ContextoCasos.jsx
│   ├── ContextoCatalogos.jsx  ← Contexto para Etapas, Calles, Lotes y Áreas
│   ├── ContextoToast.jsx
│   └── ContextoNotificaciones.jsx
├── componentes/
│   ├── DisenoPrincipal.jsx
│   ├── Navegacion.jsx
│   ├── VistaPreviaImagen.jsx   ← Componente para miniaturas y visor emergente
│   ├── TarjetaMetrica.jsx      ← Tarjeta KPI para Dashboard
│   ├── ModalVisorFoto.jsx
│   └── EncabezadoPagina.jsx
└── paginas/
    ├── Ingreso.jsx
    ├── Inicio.jsx              ← Dashboard KPI Profesional
    ├── Casos.jsx
    ├── CasoNuevo.jsx           ← Formulario V3 con Etapas, Lotes y Calles
    ├── CasoDetalle.jsx         ← Atenciones con foto opcional
    ├── Reportes.jsx            ← Incluye filtro por Usuario creador + Exportación PDF
    ├── Usuarios.jsx            ← CRUD con validación de Cédula
    ├── Catalogos.jsx           ← CRUDs de Etapas, Lotes, Calles, Áreas, Categorías
    └── Perfil.jsx
```

---

## 3. Implementación de Código Clave

### `src/utilidades/validacionCedula.js` (Algoritmo Módulo 10 Ecuador)

```javascript
/**
 * Valida un número de cédula ecuatoriana mediante el algoritmo de Módulo 10.
 * @param {string} cedula - Cadena de 10 dígitos.
 * @returns {boolean} - True si es válida, False en caso contrario.
 */
export function validarCedulaEcuatoriana(cedula) {
  if (typeof cedula !== 'string') return false;
  
  // Limpiar espacios y verificar longitud de 10 dígitos numéricos
  const digitos = cedula.trim();
  if (!/^\d{10}$/.test(digitos)) return false;

  // Código de provincia (dos primeros dígitos entre 01 y 24, o 30)
  const provincia = parseInt(digitos.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  // Tercer dígito debe ser menor a 6 para personas naturales
  const tercerDigito = parseInt(digitos.substring(2, 3), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(digitos.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(digitos.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const modulo = suma % 10;
  const resultadoEsperado = modulo === 0 ? 0 : 10 - modulo;

  return resultadoEsperado === digitoVerificador;
}
```

### `src/componentes/VistaPreviaImagen.jsx` (Miniaturas y Visor)

```jsx
import { useState } from 'react';
import { Eye, X, Image as ImageIcon } from 'lucide-react';

export default function VistaPreviaImagen({ archivo, urlExistente, alEliminar, titulo = "FOTO" }) {
  const [visorAbierto, setVisorAbierto] = useState(false);

  // Determinar la fuente de la imagen (Blob local o URL servidor)
  const urlImagen = archivo ? URL.createObjectURL(archivo) : urlExistente;

  if (!urlImagen) {
    return (
      <div className="panel-miniatura panel-miniatura--vacio">
        <ImageIcon size={24} />
        <span>SIN {titulo.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <>
      <div className="panel-miniatura">
        <img src={urlImagen} alt={titulo} className="panel-miniatura__img" />
        <div className="panel-miniatura__acciones">
          <button 
            type="button" 
            className="boton-icono" 
            onClick={() => setVisorAbierto(true)}
            title="Ver imagen completa"
          >
            <Eye size={14} />
          </button>
          {alEliminar && (
            <button 
              type="button" 
              className="boton-icono boton-icono--alerta" 
              onClick={alEliminar}
              title="Quitar foto"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Modal Visor de Pantalla Completa */}
      {visorAbierto && (
        <div className="modal-overlay" onClick={() => setVisorAbierto(false)}>
          <div className="modal-contenido modal-contenido--imagen" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setVisorAbierto(false)}>
              <X size={20} />
            </button>
            <img src={urlImagen} alt={titulo} className="imagen-completa" />
            <p className="modal-pie">{titulo}</p>
          </div>
        </div>
      )}
    </>
  );
}
```

### `src/utilidades/texto.js` (Plantilla WhatsApp Actualizada V3)

```javascript
export function aMayusculas(texto) {
  return texto ? texto.toUpperCase() : '';
}

export function generarTextoWhatsappV3(caso) {
  return `*URBANIZACIÓN EL CONDADO - NOVEDAD ${caso.codigo}*
*ESTADO:* ${caso.estado.toUpperCase()}
*FECHA:* ${caso.fechaRecepcion}
*PRIORIDAD:* ${caso.prioridad.toUpperCase()}

*DATOS DEL REPORTANTE*
- *NOMBRE:* ${caso.reportanteNombre}
- *RELACIÓN:* ${caso.reportanteTipo}
- *LOTE REPORTANTE:* ${caso.reportanteLote}
- *CONTACTO:* ${caso.reportanteContacto || 'SIN CONTACTO'}

*UBICACIÓN DE LA NOVEDAD*
- *ETAPA:* ${caso.etapa}
- *CALLE PRIMARIA:* ${caso.callePrimaria}
- *CALLE SECUNDARIA:* ${caso.calleSecundaria || 'N/A'}
- *REFERENCIA:* ${caso.referenciaUbicacion || 'SIN REFERENCIA'}

*DETALLE*
- *ÁREA ATENCIÓN:* ${caso.area}
- *CATEGORÍA:* ${caso.categoria}
- *DESCRIPCIÓN:*
${caso.descripcion}`;
}
```

### `src/paginas/CasoNuevo.jsx` (Formulario Adaptado V3)

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import VistaPreviaImagen from '../componentes/VistaPreviaImagen';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { aMayusculas } from '../utilidades/texto';

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
    referenciaUbicacion: ''
  });

  const [fotoInicial, setFotoInicial] = useState(null);
  const [pdfInicial, setPdfInicial] = useState(null);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: aMayusculas(value) });
  }

  function guardar(e) {
    e.preventDefault();

    const casoCreado = crearCaso({
      ...form,
      fotoInicial: fotoInicial ? fotoInicial.name : null,
      pdfInicial: pdfInicial ? pdfInicial.name : null
    }, usuario);

    mostrarToast('NOVEDAD REGISTRADA EXITOSAMENTE', 'exito');
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <>
      <EncabezadoPagina titulo="REGISTRO DE NOVEDAD" />
      <form className="tarjeta formulario" onSubmit={guardar}>
        
        <h2>INFORMACIÓN DEL REPORTANTE</h2>
        <div className="grid-2">
          <div className="campo">
            <label>NOMBRES Y APELLIDOS DEL REPORTANTE *</label>
            <input name="reportanteNombre" required value={form.reportanteNombre} onChange={manejarCambio} placeholder="EJ: ALEJANDRA PAZMIÑO" />
          </div>
          <div className="campo">
            <label>RELACIÓN CON LA URBANIZACIÓN *</label>
            <select name="reportanteTipo" value={form.reportanteTipo} onChange={manejarCambio}>
              <option value="PROPIETARIO">PROPIETARIO</option>
              <option value="INQUILINO">INQUILINO</option>
              <option value="VISITA">VISITA</option>
              <option value="PERSONAL INTERNO">PERSONAL INTERNO</option>
            </select>
          </div>
          <div className="campo">
            <label>LOTE DEL RESIDENTE *</label>
            <select name="reportanteLote" required value={form.reportanteLote} onChange={manejarCambio}>
              <option value="">SELECCIONE LOTE...</option>
              {lotes.filter(l => l.estado).map(l => (
                <option key={l.id} value={l.nombre}>{l.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>CONTACTO TELEFÓNICO</label>
            <input name="reportanteContacto" value={form.reportanteContacto} onChange={manejarCambio} placeholder="EJ: 0999999999" />
          </div>
        </div>

        <h2>DETALLE DE LA NOVEDAD</h2>
        <div className="grid-2">
          <div className="campo">
            <label>CATEGORÍA *</label>
            <select name="categoria" required value={form.categoria} onChange={manejarCambio}>
              <option value="">SELECCIONE CATEGORÍA...</option>
              {categorias.filter(c => c.estado).map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>ÁREA QUE ATIENDE *</label>
            <select name="area" required value={form.area} onChange={manejarCambio}>
              <option value="">SELECCIONE ÁREA...</option>
              {areas.filter(a => a.estado).map(a => (
                <option key={a.id} value={a.nombre}>{a.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="campo">
          <label>DESCRIPCIÓN DE LA NOVEDAD *</label>
          <textarea name="descripcion" rows="3" required value={form.descripcion} onChange={manejarCambio} placeholder="DETALLE DE LA INCIDENCIA OCURRIDA..." />
        </div>

        <div className="campo">
          <label>PRIORIDAD *</label>
          <select name="prioridad" value={form.prioridad} onChange={manejarCambio}>
            <option value="BAJA">BAJA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="ALTA">ALTA</option>
            <option value="URGENTE">URGENTE</option>
          </select>
        </div>

        <h2>UBICACIÓN DENTRO DE LA URBANIZACIÓN || LUGAR DE LA NOVEDAD</h2>
        <div className="grid-3">
          <div className="campo">
            <label>ETAPA *</label>
            <select name="etapa" required value={form.etapa} onChange={manejarCambio}>
              <option value="">SELECCIONE ETAPA...</option>
              {etapas.filter(e => e.estado).map(e => (
                <option key={e.id} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>CALLE PRIMARIA *</label>
            <select name="callePrimaria" required value={form.callePrimaria} onChange={manejarCambio}>
              <option value="">SELECCIONE CALLE PRIMARIA...</option>
              {calles.filter(c => c.estado).map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>CALLE SECUNDARIA</label>
            <select name="calleSecundaria" value={form.calleSecundaria} onChange={manejarCambio}>
              <option value="">SELECCIONE CALLE SECUNDARIA...</option>
              {calles.filter(c => c.estado).map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="campo">
          <label>REFERENCIA DE UBICACIÓN</label>
          <input name="referenciaUbicacion" value={form.referenciaUbicacion} onChange={manejarCambio} placeholder="EJ: FRENTE A LA GARITA PRINCIPAL" />
        </div>

        <h2>ADJUNTOS DE APERTURA (OPCIONALES)</h2>
        <div className="grid-2">
          <div className="campo">
            <label>FOTO INICIAL DE APERTURA (OPCIONAL)</label>
            <input type="file" accept="image/*" onChange={(e) => setFotoInicial(e.target.files[0])} />
            <VistaPreviaImagen archivo={fotoInicial} alEliminar={() => setFotoInicial(null)} titulo="FOTO INICIAL" />
          </div>
          <div className="campo">
            <label>DOCUMENTO OFICIO PDF (OPCIONAL)</label>
            <input type="file" accept="application/pdf" onChange={(e) => setPdfInicial(e.target.files[0])} />
          </div>
        </div>

        <button type="submit" className="boton boton--primario">GUARDAR REPORTE</button>
      </form>
    </>
  );
}
```

### `src/paginas/Inicio.jsx` (Dashboard KPI Profesional)

```jsx
import { Shield, AlertTriangle, CheckCircle, Clock, Users, MapPin, Layers, FolderTree } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaMetrica from '../componentes/TarjetaMetrica';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useSesion } from '../contextos/ContextoSesion';

export default function Inicio() {
  const { casos } = useCasos();
  const { etapas, calles, lotes, categorias } = useCatalogos();
  const { usuarios } = useSesion();

  // Cálculo de Métricas KPI
  const totalCasos = casos.length;
  const activos = casos.filter(c => c.estado === 'abierto' || c.estado === 'en_proceso').length;
  const pendientes = casos.filter(c => c.estado === 'abierto').length;
  const porConfirmar = casos.filter(c => c.estado === 'por_confirmar').length;
  const vencidos = casos.filter(c => c.esVencido).length;
  const cerrados = casos.filter(c => c.estado === 'cerrado').length;

  return (
    <div className="dashboard">
      <EncabezadoPagina titulo="PANEL DE CONTROL GENERAL" subtitulo="Métricas y estado del sistema en tiempo real" />

      {/* Fila 1: KPIs Principales de Estado de Casos */}
      <div className="grid- kpi-grid">
        <TarjetaMetrica titulo="TOTAL CASOS" valor={totalCasos} icono={<Shield />} color="var(--color-primario)" />
        <TarjetaMetrica titulo="CASOS ACTIVOS" valor={activos} icono={<Clock />} color="var(--color-info)" />
        <TarjetaMetrica titulo="PENDIENTES" valor={pendientes} icono={<AlertTriangle />} color="var(--color-secundario)" />
        <TarjetaMetrica titulo="POR CONFIRMAR" valor={porConfirmar} icono={<CheckCircle />} color="var(--color-primario-oscuro)" />
        <TarjetaMetrica titulo="CASOS VENCIDOS" valor={vencidos} icono={<AlertTriangle />} color="var(--color-alerta)" destaca />
        <TarjetaMetrica titulo="CERRADOS" valor={cerrados} icono={<CheckCircle />} color="var(--color-resuelto)" />
      </div>

      {/* Fila 2: KPIs de Inventario y Catálogos de la Urbanización */}
      <h2>MÉTRICAS TERRITORIALES Y CATÁLOGOS</h2>
      <div className="grid-4 kpi-grid">
        <TarjetaMetrica titulo="USUARIOS SISTEMA" valor={usuarios.length} icono={<Users />} color="#4A5568" />
        <TarjetaMetrica titulo="ETAPAS REGISTRADAS" valor={etapas.length} icono={<Layers />} color="#4A5568" />
        <TarjetaMetrica titulo="CALLES REGISTRADAS" valor={calles.length} icono={<MapPin />} color="#4A5568" />
        <TarjetaMetrica titulo="LOTES CATASTRADOS" valor={lotes.length} icono={<FolderTree />} color="#4A5568" />
      </div>

      {/* Resumen por Etapas */}
      <div className="tarjeta seccion-etapas">
        <h3>INCIDENCIAS REGISTRADAS POR ETAPA</h3>
        <div className="barras-etapas">
          {etapas.map(etapa => {
            const conteo = casos.filter(c => c.etapa === etapa.nombre).length;
            const porcentaje = totalCasos > 0 ? ((conteo / totalCasos) * 100).toFixed(1) : 0;
            return (
              <div key={etapa.id} className="barra-etapa-item">
                <div className="barra-etapa-item__info">
                  <span>{etapa.nombre}</span>
                  <strong>{conteo} CASOS ({porcentaje}%)</strong>
                </div>
                <div className="barra-etapa-item__progress-bg">
                  <div className="barra-etapa-item__progress-fill" style={{ width: `${porcentaje}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### `src/paginas/Reportes.jsx` (Filtro por Usuario Creador y Exportación PDF)

```jsx
import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useSesion } from '../contextos/ContextoSesion';
import { exportarCasosAPDF } from '../utilidades/generadorPdf';

export default function Reportes() {
  const { casos } = useCasos();
  const { etapas, categorias, areas } = useCatalogos();
  const { usuarios } = useSesion();

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    categoria: '',
    area: '',
    etapa: '',
    usuarioCreadorId: ''
  });

  const casosFiltrados = casos.filter(c => {
    if (filtros.fechaInicio && c.fechaRecepcion < filtros.fechaInicio) return false;
    if (filtros.fechaFin && c.fechaRecepcion > filtros.fechaFin) return false;
    if (filtros.categoria && c.categoria !== filtros.categoria) return false;
    if (filtros.area && c.area !== filtros.area) return false;
    if (filtros.etapa && c.etapa !== filtros.etapa) return false;
    if (filtros.usuarioCreadorId && c.registradoPor !== Number(filtros.usuarioCreadorId)) return false;
    return true;
  });

  function descargarPDF() {
    exportarCasosAPDF(casosFiltrados, filtros);
  }

  return (
    <>
      <EncabezadoPagina titulo="REPORTES Y AUDITORÍA" subtitulo="Filtros avanzados y exportación PDF" />
      
      <div className="tarjeta formulario">
        <h3>FILTROS DE AUDITORÍA Y BÚSQUEDA</h3>
        <div className="grid-3">
          <div className="campo">
            <label>FECHA DESDE</label>
            <input type="date" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
          </div>
          <div className="campo">
            <label>FECHA HASTA</label>
            <input type="date" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
          </div>
          <div className="campo">
            <label>USUARIO QUE ABRIÓ EL CASO</label>
            <select value={filtros.usuarioCreadorId} onChange={(e) => setFiltros({ ...filtros, usuarioCreadorId: e.target.value })}>
              <option value="">TODOS LOS USUARIOS</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.cedula})</option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>ETAPA</label>
            <select value={filtros.etapa} onChange={(e) => setFiltros({ ...filtros, etapa: e.target.value })}>
              <option value="">TODAS LAS ETAPAS</option>
              {etapas.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>CATEGORÍA</label>
            <select value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}>
              <option value="">TODAS LAS CATEGORÍAS</option>
              {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>ÁREA</label>
            <select value={filtros.area} onChange={(e) => setFiltros({ ...filtros, area: e.target.value })}>
              <option value="">TODAS LAS ÁREAS</option>
              {areas.map(a => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
            </select>
          </div>
        </div>

        <button className="boton boton--primario" onClick={descargarPDF}>
          <Download size={16} /> EXPORTAR RESULTADOS EN PDF
        </button>
      </div>
    </>
  );
}
```

---

## 4. Esquema Prisma de Base de Datos PostgreSQL (Versión 3.0)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Rol {
  SUPERUSUARIO
  OPERADOR_ADMINISTRACION
  OPERADOR_SEGURIDAD
  MANTENIMIENTO
}

enum EstadoCaso {
  ABIERTO
  EN_PROCESO
  POR_CONFIRMAR
  CERRADO
}

enum TipoReportante {
  PROPIETARIO
  INQUILINO
  VISITA
  PERSONAL_INTERNO
}

model Usuario {
  id        Int      @id @default(autoincrement())
  cedula    String   @unique // Validado con Módulo 10
  nombre    String
  apellido  String
  password  String
  rol       Rol
  estado    Boolean  @default(true)
  casos     Caso[]   @relation("CreadorCaso")
}

model Etapa {
  id     Int     @id @default(autoincrement())
  nombre String  @unique // ETAPA 1, ETAPA 2, ETAPA 3
  estado Boolean @default(true)
  casos  Caso[]
}

model Lote {
  id     Int     @id @default(autoincrement())
  nombre String  @unique // Ej: LOTE 508.6
  estado Boolean @default(true)
}

model Calle {
  id              Int    @id @default(autoincrement())
  nombre          String @unique
  estado          Boolean @default(true)
  casosPrimarios   Caso[] @relation("CallePrimaria")
  casosSecundarios Caso[] @relation("CalleSecundaria")
}

model Categoria {
  id     Int     @id @default(autoincrement())
  nombre String  @unique
  estado Boolean @default(true)
  casos  Caso[]
}

model Area {
  id     Int     @id @default(autoincrement())
  nombre String  @unique
  estado Boolean @default(true)
  casos  Caso[]
}

model Caso {
  id                  Int            @id @default(autoincrement())
  codigo              String         @unique // REQ-001
  fechaRecepcion      DateTime       @default(now())
  reportanteNombre    String
  reportanteTipo      TipoReportante
  reportanteLote      String
  reportanteContacto  String?
  
  descripcion         String
  prioridad           String
  estado              EstadoCaso     @default(ABIERTO)

  // Ubicación territorial
  etapaId             Int
  etapa               Etapa          @relation(fields: [etapaId], references: [id])
  
  callePrimariaId     Int
  callePrimaria       Calle          @relation("CallePrimaria", fields: [callePrimariaId], references: [id])
  
  calleSecundariaId   Int?
  calleSecundaria     Calle?         @relation("CalleSecundaria", fields: [calleSecundariaId], references: [id])
  
  referenciaUbicacion String?

  // Adjuntos (Opcionales)
  fotoInicial         String?
  fotoFinal           String?
  pdfInicial          String?

  // Relaciones generales
  usuarioId           Int
  usuario             Usuario        @relation("CreadorCaso", fields: [usuarioId], references: [id])
  
  categoriaId         Int
  categoria           Categoria      @relation(fields: [categoriaId], references: [id])
  
  areaId              Int
  area                Area           @relation(fields: [areaId], references: [id])
}
```

---

## 5. Resumen de Diferencias V2.0 vs V3.0

| Característica | Versión 2.0 | Versión 3.0 (Actual) |
|---|---|---|
| **Estructura del Reportante** | Nombre y Contacto general | Nombre, Relación (Propietario/Inquilino/Visita) y Lote del residente |
| **Ubicación Territorio** | Calle y Lote simple | **Etapa + Calle Primaria + Calle Secundaria + Referencia** |
| **Fotografías / Adjuntos** | Obligatorias | **Opcionales + Vista previa Thumbnail ($80\text{px}$) + Visor Pantalla Completa** |
| **Validación de Cédula** | Texto genérico | **Algoritmo Módulo 10 del Registro Civil de Ecuador** |
| **Gestión de Catálogos** | Categorías y Áreas | **Superusuario administra: Etapas, Lotes, Calles, Áreas y Categorías** |
| **Filtros de Reportes** | Fechas, Categorías y Áreas | **Incluye filtro por Usuario que registró/abrió el caso** |
| **Dashboard Principal** | Contadores básicos | **Dashboard KPI con métricas territoriales, gráficos por Etapa e inventario** |