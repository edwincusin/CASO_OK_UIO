# Front-end React · Control de Novedades — Urbanización El Condado (v2.0 - Especificación Completa)

Guía y especificación paso a paso para construir el **front-end** del sistema de gestión de casos y reportes (estilo 911). Esta versión incorpora la gestión completa de roles, notificaciones con badge, exportación a PDF, formato para WhatsApp, modales de gestión (CRUDs) y reglas de validación en mayúsculas.

> **Nota para AI Studio / Backend:** Diseñado en **React 19 + Vite**, estructurado para ser consumido fácilmente mediante Endpoints API REST (Node.js + Prisma).

---

## 1. Requerimientos y Reglas de Negocio Incorporadas

1. **Gestión de Roles Actualizada:**
   - `superusuario`: Acceso total, CRUDs del sistema, configuración y reportes.
   - `operador_administracion`: Visualización global con permisos de gestión general.
   - `operador_seguridad`: Visualización global, pero solo puede dar por atendido casos del área de *Seguridad*.
   - `mantenimiento`: Visualización exclusiva de casos de *Mantenimiento* y permiso para marcar como **Atendido** los casos de su área.
   - *(El rol Recepción fue eliminado).*

2. **Autenticación e Ingreso:**
   - Cédula de identidad (usuario) y contraseña (por defecto el mismo número de cédula).
   - Nombres y apellidos obligatorios por usuario.
   - Módulo de cambio de contraseña para todos los usuarios.
   - Módulo CRUD de Usuarios exclusivo para el Superusuario.

3. **Mantenimiento de Catálogos (CRUDs) con Borrado Lógico:**
   - Categorías y Áreas con estado (`HABILITADO` / `INACTIVO`).
   - Eliminación física permitida **solo si no existen relaciones**; de lo contrario, aplica borrado lógico.

4. **Flujo de Fotografías y Adjuntos:**
   - **Foto Inicial:** Obligatoria al crear/abrir el caso.
   - **Foto Final:** Requerida para cerrar/atender el caso.
   - Documento PDF inicial opcional.
   - Se removió la geolocalización por GPS.

5. **Edición Restringida de Casos:**
   - Un caso solo puede modificarse si fue recién creado, por el mismo usuario creador y mientras permanezca en estado **Abierto**.

6. **Formato de Texto y Validaciones:**
   - Transformación automática de todos los campos de texto e inputs a **MAYÚSCULAS**. Prohibidas minúsculas.
   - Mensajes emergentes (**Toast**) con duración fija de 3 segundos para confirmaciones y errores.

7. **Reportes y Exportación:**
   - Filtros avanzados por rango de fechas, categorías, lotes, áreas, etc.
   - Exportación de la lista filtrada a PDF mediante `jspdf` y `jspdf-autotable`.

8. **Exportación a WhatsApp & Notificaciones:**
   - Botón de **Copiar formato WhatsApp** en el detalle del caso con plantilla Markdown/Negritas.
   - Icono de notificaciones con **Badge contador** numérico de pendientes y redirección directa al caso.

---

## 2. Paleta de Colores

| Variable CSS | Código | Uso |
|---|---|---|
| `--color-primario` | `#2A8C4B` | Verde Condado: botones y acentos |
| `--color-primario-claro` | `#A3E4B0` | Fondos suaves y prioridad *Baja* |
| `--color-secundario` | `#F9D11C` | Amarillo: prioridad *Alta* y estado *Por confirmar* |
| `--color-alerta` | `#E13333` | Rojo: alertas, vencidos y prioridad *Urgente* |
| `--color-info` | `#1DAB78` | Verde azulado: prioridad *Media* y estado *En proceso* |
| `--color-resuelto` | `#0056B3` | Azul: casos cerrados / resueltos |
| `--color-superficie` | `#FCFCFC` | Tarjetas |
| `--color-fondo` | `#F5F5F7` | Fondo de la página |
| `--color-texto` | `#1A1A1A` | Texto principal |
| `--color-borde` | `#B0B0B0` | Bordes y divisores |

---

## 3. Estructura del Proyecto

```text
src/
├── main.jsx
├── App.jsx
├── estilos/
│   ├── variables.css
│   └── global.css
├── datos/
│   └── datosDemo.js            ← Mock data con roles y nuevos estados
├── utilidades/
│   ├── fechas.js
│   ├── permisos.js             ← Permisos actualizados para Mantenimiento/Seguridad
│   ├── texto.js                ← Mayúsculas y plantilla WhatsApp
│   └── generadorPdf.js         ← Exportación de reportes a PDF
├── contextos/
│   ├── ContextoSesion.jsx      ← Auth, login con Cédula, cambio de clave
│   ├── ContextoCasos.jsx       ← CRUD de Casos, Foto Inicial y Final
│   ├── ContextoToast.jsx       ← Mensajes Toast de 3 segundos
│   └── ContextoNotificaciones.jsx
├── componentes/
│   ├── DisenoPrincipal.jsx
│   ├── Navegacion.jsx          ← Con Badge de notificaciones
│   ├── RutaProtegida.jsx
│   ├── TarjetaCaso.jsx
│   ├── Toast.jsx               ← Componente emergente 3 seg
│   └── EncabezadoPagina.jsx
└── paginas/
    ├── Ingreso.jsx             ← Login con Cédula y Contraseña
    ├── Inicio.jsx              ← Dashboard mejorado para Superusuario
    ├── Casos.jsx               ← Lista de casos y edición restringida
    ├── CasoNuevo.jsx           ← Formulario con Foto Inicial + Uppercase
    ├── CasoDetalle.jsx         ← Cierre con Foto Final + Botón WhatsApp
    ├── Reportes.jsx            ← Filtros por rango de fecha y exportación PDF
    ├── Usuarios.jsx            ← CRUD de Usuarios (Superusuario)
    ├── Catalogos.jsx           ← CRUD Categorías/Áreas con Soft Delete
    ├── Perfil.jsx              ← Módulo cambio de contraseña
    └── Notificaciones.jsx      ← Redirección directa al caso
```

---

## 4. Implementación de Código Relevante

### `src/estilos/variables.css`

```css
:root {
  --color-primario: #2A8C4B;
  --color-primario-claro: #A3E4B0;
  --color-secundario: #F9D11C;
  --color-alerta: #E13333;
  --color-info: #1DAB78;
  --color-resuelto: #0056B3;

  --color-superficie: #FCFCFC;
  --color-fondo: #F5F5F7;
  --color-texto: #1A1A1A;
  --color-texto-suave: #333333;
  --color-borde: #B0B0B0;

  --color-primario-oscuro: #226F3C;
  --color-alerta-fondo: #FCEAEA;
  --color-texto-tenue: #6B6B6B;

  --radio: 12px;
  --sombra: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

### `src/utilidades/texto.js` (Mayúsculas y Plantilla WhatsApp)

```javascript
// Transformación automática a mayúsculas
export function aMayusculas(texto) {
  return texto ? texto.toUpperCase() : '';
}

// Generador de formato para WhatsApp
export function generarTextoWhatsapp(caso) {
  const ubicacion = caso.lote 
    ? `Lote ${caso.lote} · ${caso.calle}` 
    : (caso.ubicacionTexto || 'Sin lote');

  return `*${caso.codigo}*
*${caso.estado.toUpperCase()}* Recibido el ${caso.fechaRecepcion}
*Prioridad ${caso.prioridad.toUpperCase()}*

${caso.descripcion}

*Reportante*
${caso.reportanteNombre} (${caso.reportanteTipo || 'Personal interno'})

*Contacto*
${caso.reportanteContacto || 'Sin contacto'}

*Ubicación*
${ubicacion}
${caso.ubicacionTexto ? caso.ubicacionTexto : ''}

*Área y categoría*
- ${caso.area} · ${caso.categoria}`;
}
```

### `src/utilidades/permisos.js` (Reglas de Roles y Atenciones)

```javascript
export function esSuperusuario(usuario) {
  return usuario.rol === 'superusuario';
}

export function obtenerCasosVisibles(casos, usuario) {
  if (usuario.rol === 'mantenimiento') {
    return casos.filter((caso) => caso.area === 'Mantenimiento');
  }
  return casos; // Superusuario, Operador Admin y Operador Seguridad ven todo
}

export function puedeAtenderCaso(usuario, caso) {
  if (caso.estado === 'cerrado') return false;

  if (usuario.rol === 'superusuario' || usuario.rol === 'operador_administracion') {
    return true;
  }
  if (usuario.rol === 'operador_seguridad' && caso.area === 'Seguridad') {
    return true;
  }
  if (usuario.rol === 'mantenimiento' && caso.area === 'Mantenimiento') {
    return true;
  }

  return false;
}

export function puedeEditarCaso(usuario, caso) {
  return caso.estado === 'abierto' && caso.registradoPor === usuario.id;
}
```

### `src/contextos/ContextoToast.jsx` (Mensajes Toast 3 Segundos)

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ContextoToast = createContext(null);

export function ProveedorToast({ children }) {
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    setToast({ mensaje: mensaje.toUpperCase(), tipo });
    setTimeout(() => {
      setToast(null);
    }, 3000); // 3 segundos exactos
  }, []);

  return (
    <ContextoToast.Provider value={{ mostrarToast }}>
      {children}
      {toast && (
        <div className={`toast toast--${toast.tipo}`}>
          {toast.mensaje}
        </div>
      )}
    </ContextoToast.Provider>
  );
}

export const useToast = () => useContext(ContextoToast);
```

### `src/utilidades/generadorPdf.js` (Exportación a PDF)

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportarCasosAPDF(casosFiltrados, parametros) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('URBANIZACIÓN EL CONDADO - REPORTE DE CASOS', 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Rango de Fechas: ${parametros.fechaInicio || 'INICIO'} al ${parametros.fechaFin || 'HOY'}`, 14, 22);
  doc.text(`Categoría: ${parametros.categoria || 'TODAS'} | Área: ${parametros.area || 'TODAS'}`, 14, 28);

  const columnas = ['CÓDIGO', 'FECHA', 'REPORTANTE', 'ÁREA', 'CATEGORÍA', 'ESTADO', 'PRIORIDAD'];
  const filas = casosFiltrados.map(c => [
    c.codigo,
    c.fechaRecepcion,
    c.reportanteNombre.toUpperCase(),
    c.area.toUpperCase(),
    c.categoria.toUpperCase(),
    c.estado.toUpperCase(),
    c.prioridad.toUpperCase()
  ]);

  doc.autoTable({
    startY: 34,
    head: [columnas],
    body: filas,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [42, 140, 75] }
  });

  doc.save(`Reporte_Casos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
```

### `src/componentes/Navegacion.jsx` (Navegación + Badge Contador)

```jsx
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, Bell, Users, FolderTree, FileText, UserCheck } from 'lucide-react';
import { useSesion } from '../contextos/ContextoSesion';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';

export default function Navegacion() {
  const { usuario } = useSesion();
  const { contadorPendientes } = useNotificaciones();

  return (
    <nav className="navegacion">
      <NavLink to="/" className="navegacion__enlace"><Home size={20} /> Inicio</NavLink>
      <NavLink to="/casos" className="navegacion__enlace"><ClipboardList size={20} /> Casos</NavLink>
      <NavLink to="/casos/nuevo" className="navegacion__enlace"><PlusCircle size={20} /> Nuevo</NavLink>
      
      <NavLink to="/notificaciones" className="navegacion__enlace navegacion__enlace--relativo">
        <Bell size={20} />
        <span>Avisos</span>
        {contadorPendientes > 0 && (
          <span className="badge-notificacion">{contadorPendientes}</span>
        )}
      </NavLink>

      {usuario.rol === 'superusuario' && (
        <>
          <NavLink to="/reportes" className="navegacion__enlace"><FileText size={20} /> Reportes</NavLink>
          <NavLink to="/usuarios" className="navegacion__enlace"><Users size={20} /> Usuarios</NavLink>
          <NavLink to="/catalogos" className="navegacion__enlace"><FolderTree size={20} /> Catálogos</NavLink>
        </>
      )}
      
      <NavLink to="/perfil" className="navegacion__enlace"><UserCheck size={20} /> Mi Perfil</NavLink>
    </nav>
  );
}
```

### `src/paginas/CasoNuevo.jsx` (Foto Inicial Obligatoria + Transformación Mayúsculas)

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useToast } from '../contextos/ContextoToast';
import { aMayusculas } from '../utilidades/texto';

export default function CasoNuevo() {
  const { usuario } = useSesion();
  const { crearCaso, prioridades, categorias, areas } = useCasos();
  const { mostrarToast } = useToast();
  const navegar = useNavigate();

  const [form, setForm] = useState({
    reportanteNombre: '',
    reportanteContacto: '',
    calle: '',
    lote: '',
    ubicacionTexto: '',
    categoria: '',
    area: '',
    prioridad: 'media',
    descripcion: ''
  });

  const [fotoInicial, setFotoInicial] = useState(null);
  const [pdfInicial, setPdfInicial] = useState(null);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: aMayusculas(value) });
  }

  function guardar(e) {
    e.preventDefault();
    if (!fotoInicial) {
      mostrarToast('LA FOTO INICIAL ES OBLIGATORIA', 'alerta');
      return;
    }

    const casoCreado = crearCaso({
      ...form,
      fotoInicial: fotoInicial.name,
      pdfInicial: pdfInicial ? pdfInicial.name : null
    }, usuario);

    mostrarToast('CASO REGISTRADO CORRECTAMENTE', 'exito');
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <>
      <EncabezadoPagina titulo="NUEVO REPORTE" />
      <form className="tarjeta formulario" onSubmit={guardar}>
        <h2>DATOS DEL REPORTANTE</h2>
        <div className="campo">
          <label>NOMBRES Y APELLIDOS *</label>
          <input name="reportanteNombre" required value={form.reportanteNombre} onChange={manejarCambio} />
        </div>
        <div className="campo">
          <label>DESCRIPCIÓN DE LA NOVEDAD *</label>
          <textarea name="descripcion" rows="4" required value={form.descripcion} onChange={manejarCambio} />
        </div>

        <h2>ADJUNTOS DE APERTURA</h2>
        <div className="campo">
          <label>FOTO INICIAL DE APERTURA (OBLIGATORIA) *</label>
          <input type="file" accept="image/*" required onChange={(e) => setFotoInicial(e.target.files[0])} />
        </div>
        <div className="campo">
          <label>DOCUMENTO OFICIO PDF (OPCIONAL)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setPdfInicial(e.target.files[0])} />
        </div>

        <button type="submit" className="boton boton--primario">GUARDAR REPORTE</button>
      </form>
    </>
  );
}
```

### `src/paginas/CasoDetalle.jsx` (Atención por Mantenimiento, Copia WhatsApp y Foto Final)

```jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check, CheckCircle2 } from 'lucide-react';
import { useCasos } from '../contextos/ContextoCasos';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { puedeAtenderCaso } from '../utilidades/permisos';
import { generarTextoWhatsapp, aMayusculas } from '../utilidades/texto';

export default function CasoDetalle() {
  const { idCaso } = useParams();
  const { usuario } = useSesion();
  const { casos, agregarSeguimiento } = useCasos();
  const { mostrarToast } = useToast();

  const [fotoFinal, setFotoFinal] = useState(null);
  const [notaAtencion, setNotaAtencion] = useState('');
  const [copiado, setCopiado] = useState(false);

  const caso = casos.find((c) => c.id === Number(idCaso));

  function copiarWhatsApp() {
    const texto = generarTextoWhatsapp(caso);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    mostrarToast('COPIADO AL PORTAPAPELES PARA WHATSAPP', 'exito');
    setTimeout(() => setCopiado(false), 2000);
  }

  function marcarAtendido(e) {
    e.preventDefault();
    if (!fotoFinal) {
      mostrarToast('LA FOTO FINAL ES OBLIGATORIA PARA DAR ATENDIDO', 'alerta');
      return;
    }

    agregarSeguimiento(caso.id, usuario, 'atendido', notaAtencion || 'TRABAJO REALIZADO', 'por_confirmar', fotoFinal.name);
    mostrarToast('CASO MARCADO COMO ATENDIDO', 'exito');
  }

  return (
    <div className="caso-detalle">
      <div className="encabezado-acciones">
        <h1>{caso.codigo}</h1>
        <button className="boton boton--secundario" onClick={copiarWhatsApp}>
          {copiado ? <Check size={16} /> : <Copy size={16} />} COPIAR PARA WHATSAPP
        </button>
      </div>

      <div className="tarjeta">
        <p>{caso.descripcion}</p>
      </div>

      {/* Formulario de Atención para Mantenimiento / Seguridad / Admin */}
      {puedeAtenderCaso(usuario, caso) && caso.estado !== 'por_confirmar' && (
        <form onSubmit={marcarAtendido} className="tarjeta formulario">
          <h3>MARCAR COMO ATENDIDO ({caso.area.toUpperCase()})</h3>
          <div className="campo">
            <label>FOTO FINAL DE CIERRE (OBLIGATORIA) *</label>
            <input type="file" accept="image/*" required onChange={(e) => setFotoFinal(e.target.files[0])} />
          </div>
          <div className="campo">
            <label>NOTA DE ATENCIÓN</label>
            <textarea 
              rows="2" 
              value={notaAtencion} 
              onChange={(e) => setNotaAtencion(aMayusculas(e.target.value))} 
            />
          </div>
          <button type="submit" className="boton boton--primario">
            <CheckCircle2 size={16} /> MARCAR COMO ATENDIDO
          </button>
        </form>
      )}
    </div>
  );
}
```

---

## 5. Esquema para Conexión Backend (Node.js + Prisma REST API)

El modelo de datos para la base de datos PostgreSQL mediante Prisma queda estructurado de la siguiente forma:

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

model Usuario {
  id        Int      @id @default(autoincrement())
  cedula    String   @unique
  nombre    String
  apellido  String
  password  String
  rol       Rol
  estado    Boolean  @default(true)
  casos     Caso[]   @relation("CreadorCaso")
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
  id               Int        @id @default(autoincrement())
  codigo           String     @unique // REQ-001
  fechaRecepcion   DateTime   @default(now())
  reportanteNombre String
  reportanteContacto String?
  calle            String?
  lote             String?
  ubicacionTexto   String?
  descripcion      String
  fotoInicial      String     // OBLIGATORIA
  fotoFinal        String?    // OBLIGATORIA AL CERRAR/ATENDER
  pdfInicial       String?    // OPCIONAL
  prioridad        String
  estado           EstadoCaso @default(ABIERTO)
  
  usuarioId        Int
  usuario          Usuario    @relation("CreadorCaso", fields: [usuarioId], references: [id])
  
  categoriaId      Int
  categoria        Categoria  @relation(fields: [categoriaId], references: [id])
  
  areaId           Int
  area             Area       @relation(fields: [areaId], references: [id])
}