# Front-end React · Control de novedades — Urbanización El Condado

Guía paso a paso para construir el **front-end** del sistema de recepción y seguimiento de reportes (estilo 911).
Es minimalista, responsive (celular y computador) y usa la paleta de colores de la urbanización.

> **Estado:** funciona con datos de ejemplo (sin backend). Cada pantalla y cada rol se pueden probar ya.
> Este código fue compilado y probado en las 8 pantallas con los 6 usuarios de prueba, sin errores.

---

## 1. Qué incluye

| Pantalla | Ruta | Para qué sirve |
|---|---|---|
| Ingreso | `/ingreso` | Entrar como uno de los usuarios de prueba |
| Inicio | `/` | Contadores y **pendientes de seguimiento** (vencidos primero) |
| Casos | `/casos` | Lista con búsqueda y filtros por estado y prioridad |
| Nuevo reporte | `/casos/nuevo` | Formulario: reportante, calle/lote, GPS, descripción y archivos opcionales |
| Detalle del caso | `/casos/:idCaso` | Datos, acciones según el rol e historial |
| Avisos | `/notificaciones` | Notificaciones del sistema |
| Configuración | `/configuracion` | Solo superusuario: plazos de cada prioridad |

### Flujo que ya se puede probar

1. **Recepción** crea un reporte.
2. El **jefe del área** (mantenimiento o seguridad) pulsa **Marcar como atendido** → el caso queda *Por confirmar*.
3. **Ana (Administración)**, la única persona que confirma, pulsa **Confirmar solución** (se cierra) o **Devolver** con una nota (vuelve a *En proceso*).
4. Cada seguimiento reinicia el contador de días según la prioridad.

---

## 2. Crear el proyecto

Necesitas **Node.js 20.19 o superior** (`node -v` para comprobarlo).

```bash
npm create vite@latest condado-front
```

Cuando pregunte, elige **React** y la variante **JavaScript**. Luego:

```bash
cd condado-front
npm install
npm install react-router-dom
npm install react-icons
npm install lucide-react
```

Borra lo que trae Vite de ejemplo y crea las carpetas:

```bash
rm -rf src/App.css src/index.css src/assets
mkdir -p src/estilos src/datos src/utilidades src/contextos src/componentes src/paginas
```

En `index.html` cambia `lang="en"` por `lang="es"` y el `<title>` por `El Condado · Control de novedades`.

Para ejecutarlo:

```bash
npm run dev
```

Versiones con las que se probó: Vite 8, React 19, react-router-dom 7, lucide-react 1.x y react-icons 5.

---

## 3. Paleta de colores

Los códigos se tomaron de la imagen de la paleta.

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
| `--color-texto-suave` | `#333333` | Texto secundario |
| `--color-borde` | `#B0B0B0` | Bordes y divisores |

**Decisiones que tomé donde la imagen no era clara** (revísalas):

- La imagen solo define tres prioridades (rojo, amarillo, verde claro). Como el sistema tiene cuatro, usé: **Urgente** rojo, **Alta** amarillo, **Media** verde azulado y **Baja** verde claro.
- El código de la prioridad baja aparece ilegible en la imagen (`#9056B2`, que sería morado), así que usé el verde claro `#A3E4B0` que se ve en el cuadro.
- El gris oscuro de texto secundario no trae código en la imagen; usé `#333333` (estimado).
- Agregué tres colores derivados para detalles: `--color-primario-oscuro` (`#226F3C`, al pasar el mouse sobre un botón), `--color-alerta-fondo` (`#FCEAEA`, fondo de casos vencidos) y `--color-texto-tenue` (`#6B6B6B`, textos pequeños; el `#B0B0B0` es demasiado claro para leer texto).
- El **logo** no se puede extraer de la imagen. Guárdalo como `public/logo.png` y cámbialo por el icono de hoja en `Navegacion.jsx` y `DisenoPrincipal.jsx` con `<img src="/logo.png" alt="El Condado" height="32" />`.

Para que la base de datos use los mismos colores de prioridad:

```sql
UPDATE prioridades SET color = '#E13333' WHERE nombre = 'Urgente';
UPDATE prioridades SET color = '#F9D11C' WHERE nombre = 'Alta';
UPDATE prioridades SET color = '#1DAB78' WHERE nombre = 'Media';
UPDATE prioridades SET color = '#A3E4B0' WHERE nombre = 'Baja';
```

---

## 4. Reglas de código limpio de este proyecto

1. **Todo en español:** variables, funciones, props, componentes y clases CSS (`casosVisibles`, `guardarReporte`, `TarjetaCaso`).
2. **Nombres que se explican solos:** `cantidadVencidos` en vez de `cv`; `estaAtrasado` en vez de `flag`.
3. **Una función, una tarea.** Ninguna función pasa de ~20 líneas.
4. **Un componente por archivo**, con el mismo nombre del archivo.
5. **Sin números ni textos "mágicos" repartidos:** colores en `variables.css`, catálogos en `datosDemo.js`.
6. **Reglas de permisos en un solo lugar** (`permisos.js`), no esparcidas por las pantallas.
7. **Comentarios solo para explicar el "por qué"**, no lo que ya dice el código.
8. **Sin librerías extra:** solo React, react-router-dom, lucide-react y react-icons.

---

## 5. Estructura de carpetas

```text
src/
├── main.jsx
├── App.jsx                     ← rutas
├── estilos/
│   ├── variables.css           ← paleta de colores
│   └── global.css
├── datos/
│   └── datosDemo.js            ← datos de ejemplo (luego, la API)
├── utilidades/
│   ├── fechas.js
│   └── permisos.js             ← quién puede qué
├── contextos/
│   ├── ContextoSesion.jsx      ← usuario que inició sesión
│   └── ContextoCasos.jsx       ← casos y prioridades
├── componentes/                ← piezas reutilizables
│   ├── DisenoPrincipal.jsx
│   ├── Navegacion.jsx
│   ├── RutaProtegida.jsx
│   ├── TarjetaCaso.jsx
│   ├── Insignia.jsx
│   └── EncabezadoPagina.jsx
└── paginas/                    ← una por pantalla
    ├── Ingreso.jsx
    ├── Inicio.jsx
    ├── Casos.jsx
    ├── CasoNuevo.jsx
    ├── CasoDetalle.jsx
    ├── Notificaciones.jsx
    └── Configuracion.jsx
```

---

## 6. Código, archivo por archivo

Crea cada archivo con su contenido exacto.

### `src/estilos/variables.css`

Aquí viven **todos los colores** de la paleta. Si quieres cambiar un color, se cambia solo en este archivo.

```css
/* =========================================================
   Paleta de colores - Urbanización El Condado
   Los códigos salen de la imagen de la paleta.
   ========================================================= */
:root {
  /* Marca */
  --color-primario: #2A8C4B;          /* Verde Condado: botones y acentos */
  --color-primario-claro: #A3E4B0;    /* Verde claro: fondos suaves, prioridad baja */
  --color-secundario: #F9D11C;        /* Amarillo: solicitudes express, prioridad alta */
  --color-alerta: #E13333;            /* Rojo: alertas, vencidos, prioridad urgente */
  --color-info: #1DAB78;              /* Verde azulado: información, prioridad media */
  --color-resuelto: #0056B3;          /* Azul: casos resueltos */

  /* Neutros */
  --color-superficie: #FCFCFC;        /* Tarjetas */
  --color-fondo: #F5F5F7;             /* Fondo de la página */
  --color-texto: #1A1A1A;             /* Texto principal */
  --color-texto-suave: #333333;       /* Texto secundario (estimado de la imagen) */
  --color-borde: #B0B0B0;             /* Divisores y bordes */

  /* Derivados (añadidos para estados hover y accesibilidad) */
  --color-primario-oscuro: #226F3C;   /* Hover del botón principal */
  --color-alerta-fondo: #FCEAEA;      /* Fondo suave de alertas */
  --color-texto-tenue: #6B6B6B;       /* Textos pequeños (mejor contraste que el borde) */

  /* Medidas */
  --espacio-1: 0.5rem;
  --espacio-2: 1rem;
  --espacio-3: 1.5rem;
  --radio: 12px;
  --sombra: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

### `src/estilos/global.css`

Estilos de toda la aplicación. Los nombres de las clases están en español y siguen el patrón `bloque__elemento--variante` (por ejemplo `tarjeta__fila`, `boton--primario`).

```css
@import './variables.css';

/* ---------- Base ---------- */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-fondo);
  color: var(--color-texto);
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
h1 { font-size: 1.4rem; }
h2 { font-size: 1.05rem; margin-bottom: var(--espacio-1); }
.texto-tenue { color: var(--color-texto-tenue); font-size: 0.85rem; }
.texto-alerta { color: var(--color-alerta); font-weight: 600; }

/* ---------- Estructura de la página ---------- */
.diseno { min-height: 100vh; }
.diseno__principal { display: flex; flex-direction: column; min-height: 100vh; }
.cabecera {
  position: sticky; top: 0; z-index: 5;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem var(--espacio-2);
  background: var(--color-superficie);
  border-bottom: 1px solid var(--color-borde);
}
.marca { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: var(--color-primario); }
.contenido {
  flex: 1; width: 100%; max-width: 960px; margin: 0 auto;
  padding: var(--espacio-2) var(--espacio-2) 6rem;
  display: flex; flex-direction: column; gap: var(--espacio-2);
}

/* ---------- Navegación: abajo en celular, a la izquierda en computador ---------- */
.navegacion {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;
  display: flex; justify-content: space-around;
  background: var(--color-superficie);
  border-top: 1px solid var(--color-borde);
}
.navegacion__marca { display: none; }
.navegacion__enlace {
  display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
  padding: 0.5rem; font-size: 0.72rem; color: var(--color-texto-tenue);
}
.navegacion__enlace.activo { color: var(--color-primario); font-weight: 600; }

@media (min-width: 900px) {
  .diseno { display: grid; grid-template-columns: 230px 1fr; }
  .navegacion {
    position: sticky; top: 0; height: 100vh;
    flex-direction: column; justify-content: flex-start; gap: 0.25rem;
    padding: var(--espacio-2);
    border-top: none; border-right: 1px solid var(--color-borde);
  }
  .navegacion__marca { display: flex; margin-bottom: var(--espacio-2); }
  .navegacion__enlace { flex-direction: row; gap: 0.75rem; padding: 0.65rem 0.75rem; font-size: 0.95rem; border-radius: var(--radio); }
  .navegacion__enlace.activo { background: var(--color-fondo); }
  .cabecera .marca { display: none; }
  .cabecera { justify-content: flex-end; }
  .contenido { padding-bottom: var(--espacio-3); }
}

/* ---------- Tarjeta ---------- */
.tarjeta {
  background: var(--color-superficie);
  border: 1px solid #E4E4E4;
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  padding: var(--espacio-2);
}
.tarjeta--enlace { display: block; border-left: 5px solid var(--color-borde); }
.tarjeta--enlace:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }
.tarjeta--vencida { background: var(--color-alerta-fondo); }
.tarjeta__fila { display: flex; justify-content: space-between; align-items: center; gap: var(--espacio-1); flex-wrap: wrap; }
.tarjeta__codigo { font-weight: 700; }
.tarjeta__descripcion {
  margin: 0.35rem 0; color: var(--color-texto-suave);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ---------- Botones ---------- */
.boton {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem 1rem; border-radius: var(--radio);
  border: 1px solid transparent; cursor: pointer; font-weight: 600;
}
.boton--primario { background: var(--color-primario); color: #fff; }
.boton--primario:hover { background: var(--color-primario-oscuro); }
.boton--secundario { background: var(--color-secundario); color: var(--color-texto); }
.boton--contorno { background: transparent; border-color: var(--color-borde); }
.boton--alerta { background: var(--color-alerta); color: #fff; }
.boton--completo { width: 100%; }
.boton:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- Insignia (punto de color + texto) ---------- */
.insignia { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; }
.insignia__punto { width: 0.6rem; height: 0.6rem; border-radius: 50%; }

/* ---------- Formularios ---------- */
.formulario { display: flex; flex-direction: column; gap: var(--espacio-2); }
.campo { display: flex; flex-direction: column; gap: 0.25rem; }
.campo label { font-size: 0.85rem; font-weight: 600; }
.campo input, .campo select, .campo textarea {
  padding: 0.6rem 0.75rem; background: var(--color-superficie);
  border: 1px solid var(--color-borde); border-radius: var(--radio);
}
.campo input:focus, .campo select:focus, .campo textarea:focus {
  outline: 2px solid var(--color-primario); border-color: transparent;
}
.campo--horizontal { flex-direction: row; align-items: center; gap: 0.5rem; }
.campo--horizontal input { width: auto; }
.rejilla-dos { display: grid; gap: var(--espacio-2); grid-template-columns: 1fr; }
@media (min-width: 600px) { .rejilla-dos { grid-template-columns: 1fr 1fr; } }

/* ---------- Contadores y listas ---------- */
.contadores { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--espacio-1); }
.contador { text-align: center; padding: var(--espacio-2) 0.5rem; }
.contador__numero { font-size: 1.8rem; font-weight: 700; line-height: 1.1; }
.lista { display: flex; flex-direction: column; gap: var(--espacio-1); }
.encabezado-pagina { display: flex; justify-content: space-between; align-items: center; gap: var(--espacio-1); flex-wrap: wrap; }
.filtros { display: grid; gap: var(--espacio-1); grid-template-columns: 1fr; }
@media (min-width: 600px) { .filtros { grid-template-columns: 2fr 1fr 1fr; } }
.vacio { text-align: center; color: var(--color-texto-tenue); padding: var(--espacio-3); }

/* ---------- Detalle del caso ---------- */
.datos { display: grid; gap: 0.5rem; grid-template-columns: 1fr; }
@media (min-width: 600px) { .datos { grid-template-columns: 1fr 1fr; } }
.datos__titulo { font-size: 0.78rem; color: var(--color-texto-tenue); text-transform: uppercase; }
.acciones { display: flex; gap: var(--espacio-1); flex-wrap: wrap; }
.linea-tiempo { list-style: none; border-left: 2px solid var(--color-primario-claro); padding-left: var(--espacio-2); display: flex; flex-direction: column; gap: var(--espacio-2); }
.linea-tiempo__item { position: relative; }
.linea-tiempo__item::before {
  content: ''; position: absolute; left: calc(-1 * var(--espacio-2) - 6px); top: 0.4rem;
  width: 10px; height: 10px; border-radius: 50%; background: var(--color-primario);
}

/* ---------- Pantalla de ingreso ---------- */
.ingreso { min-height: 100vh; display: grid; place-items: center; padding: var(--espacio-2); }
.ingreso__tarjeta { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: var(--espacio-2); }
```

### `src/utilidades/fechas.js`

Funciones pequeñas para fechas. Cada una hace una sola cosa.

```js
// Funciones pequeñas para trabajar con fechas en formato "AAAA-MM-DD"

function aTextoISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function hoy() {
  return aTextoISO(new Date());
}

// sumarDias(3) -> dentro de 3 días | sumarDias(-2) -> hace 2 días
export function sumarDias(cantidadDias, fechaBase = hoy()) {
  const fecha = new Date(fechaBase + 'T00:00:00');
  fecha.setDate(fecha.getDate() + cantidadDias);
  return aTextoISO(fecha);
}

// Días que pasaron desde la fecha límite (positivo = atrasado)
export function diasDeAtraso(fechaLimite) {
  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diferencia = new Date(hoy() + 'T00:00:00') - new Date(fechaLimite + 'T00:00:00');
  return Math.round(diferencia / milisegundosPorDia);
}

export function formatearFecha(fechaISO) {
  return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
```

### `src/utilidades/permisos.js`

Reglas de "quién puede hacer qué". En el sistema real, el servidor aplica las mismas reglas.

```js
// Reglas de "quién puede qué". Esto es SOLO para la demostración:
// en el sistema real el servidor aplica estas mismas reglas.

const estadosEnTrabajo = ['abierto', 'en_proceso', 'en_espera'];

export function esJefe(usuario) {
  return usuario.rol === 'jefe_mantenimiento' || usuario.rol === 'jefe_seguridad';
}

// Cada rol ve distintos casos
export function obtenerCasosVisibles(casos, usuario) {
  if (esJefe(usuario)) return casos.filter((caso) => caso.area === usuario.area);
  if (usuario.rol === 'registro') return casos.filter((caso) => caso.registradoPor === usuario.id);
  return casos; // superusuario y administración ven todo
}

export function puedeAtenderCaso(usuario, caso) {
  return esJefe(usuario) && caso.area === usuario.area && estadosEnTrabajo.includes(caso.estado);
}

export function puedeConfirmarCaso(usuario, caso) {
  return Boolean(usuario.puedeConfirmar) && caso.estado === 'por_confirmar';
}

export function puedeAgregarSeguimiento(usuario) {
  return usuario.rol !== 'registro';
}

export function puedeVerConfiguracion(usuario) {
  return usuario.rol === 'superusuario';
}
```

### `src/datos/datosDemo.js`

Datos de ejemplo para probar sin backend. Más adelante se reemplazan por llamadas a la API.

```js
// =========================================================
// Datos de ejemplo para probar el diseño SIN backend.
// Cuando exista la API, estos datos se piden al servidor.
// =========================================================
import { sumarDias } from '../utilidades/fechas';

export const usuariosDemo = [
  { id: 1, nombre: 'Superusuario', rol: 'superusuario' },
  { id: 2, nombre: 'Ana (Administración)', rol: 'administracion', puedeConfirmar: true },
  { id: 3, nombre: 'Luis (Administración)', rol: 'administracion' },
  { id: 4, nombre: 'Jefe de Mantenimiento', rol: 'jefe_mantenimiento', area: 'Mantenimientos' },
  { id: 5, nombre: 'Jefe de Seguridad', rol: 'jefe_seguridad', area: 'Seguridad' },
  { id: 6, nombre: 'Recepción', rol: 'registro' },
];

export const etiquetasRol = {
  superusuario: 'Superusuario',
  administracion: 'Administración',
  jefe_mantenimiento: 'Jefe de mantenimiento',
  jefe_seguridad: 'Jefe de seguridad',
  registro: 'Registro',
};

// Cada estado tiene un nombre legible y un color de la paleta
export const estados = {
  abierto: { nombre: 'Abierto', color: 'var(--color-texto-suave)' },
  en_proceso: { nombre: 'En proceso', color: 'var(--color-info)' },
  en_espera: { nombre: 'En espera', color: 'var(--color-borde)' },
  por_confirmar: { nombre: 'Por confirmar', color: 'var(--color-secundario)' },
  cerrado: { nombre: 'Cerrado', color: 'var(--color-resuelto)' },
};

// Los plazos son configurables (pantalla Configuración)
export const prioridadesIniciales = [
  { id: 'urgente', nombre: 'Urgente', plazoDias: 1, color: 'var(--color-alerta)' },
  { id: 'alta', nombre: 'Alta', plazoDias: 3, color: 'var(--color-secundario)' },
  { id: 'media', nombre: 'Media', plazoDias: 5, color: 'var(--color-info)' },
  { id: 'baja', nombre: 'Baja', plazoDias: 5, color: 'var(--color-primario-claro)' },
];

export const areas = ['Administración', 'Mantenimientos', 'Seguridad'];
export const categorias = [
  'Alumbrado público', 'Fuga de agua', 'Vías y señalización', 'Áreas verdes y riego',
  'Limpieza y basura', 'Mascotas', 'Plagas', 'Seguridad y convivencia', 'Otros',
];
export const relacionesReportante = [
  { valor: 'propietario', nombre: 'Propietario' },
  { valor: 'inquilino', nombre: 'Inquilino' },
  { valor: 'visitante', nombre: 'Visitante / transeúnte' },
  { valor: 'personal_interno', nombre: 'Personal interno' },
  { valor: 'otro', nombre: 'Otro' },
];

export const callesDemo = [
  { nombre: 'Calle A', lotes: ['101', '102', '103'] },
  { nombre: 'Calle M', lotes: ['505.1A', '506', '507'] },
  { nombre: 'Calle T', lotes: ['866', '867', '868'] },
];

export const casosDemo = [
  {
    id: 1, codigo: 'REQ-001', fechaRecepcion: sumarDias(-9), registradoPor: 6,
    reportanteNombre: 'Sandra Pazmiño', reportanteContacto: '0994286523',
    reportanteRelacion: 'propietario', lote: '505.1A', calle: 'Calle M', ubicacionTexto: 'Parque frente a la embajada',
    latitud: '', longitud: '', categoria: 'Áreas verdes y riego', area: 'Mantenimientos', prioridad: 'media',
    descripcion: 'El parque está lleno de ramas y hojas, y los aspersores no funcionan.',
    estado: 'en_proceso', proximoSeguimiento: sumarDias(-3), adjuntos: [],
    seguimientos: [{ id: 1, fecha: sumarDias(-9), autor: 'Recepción', tipo: 'nota', nota: 'Reporte recibido por WhatsApp.' }],
  },
  {
    id: 2, codigo: 'REQ-002', fechaRecepcion: sumarDias(-2), registradoPor: 6,
    reportanteNombre: 'Juan Mosquera', reportanteContacto: '0995829961',
    reportanteRelacion: 'inquilino', lote: '866', calle: 'Calle T', ubicacionTexto: '',
    latitud: '-0.180653', longitud: '-78.467834', categoria: 'Alumbrado público', area: 'Administración', prioridad: 'alta',
    descripcion: 'Poste de alumbrado público apagado desde hace varias noches.',
    estado: 'abierto', proximoSeguimiento: sumarDias(1), adjuntos: [{ tipo: 'dano', nombre: 'poste.jpg' }],
    seguimientos: [],
  },
  {
    id: 3, codigo: 'REQ-003', fechaRecepcion: sumarDias(-4), registradoPor: 3,
    reportanteNombre: 'Centro de control', reportanteContacto: '',
    reportanteRelacion: 'personal_interno', lote: '', calle: '', ubicacionTexto: 'Redondel frente a la iglesia',
    latitud: '', longitud: '', categoria: 'Plagas', area: 'Mantenimientos', prioridad: 'urgente',
    descripcion: 'Se observa un panal de avispas en el redondel de la avenida A.',
    estado: 'por_confirmar', proximoSeguimiento: sumarDias(-1), adjuntos: [{ tipo: 'solucion', nombre: 'panal-retirado.jpg' }],
    seguimientos: [{ id: 1, fecha: sumarDias(-1), autor: 'Jefe de Mantenimiento', tipo: 'atendido', nota: 'Panal retirado por personal capacitado.' }],
  },
  {
    id: 4, codigo: 'REQ-004', fechaRecepcion: sumarDias(-1), registradoPor: 6,
    reportanteNombre: 'Paulina Ruales', reportanteContacto: '0992502313',
    reportanteRelacion: 'propietario', lote: '507', calle: 'Calle M', ubicacionTexto: '',
    latitud: '', longitud: '', categoria: 'Mascotas', area: 'Seguridad', prioridad: 'baja',
    descripcion: 'El paseo de perros genera conflictos entre vecinos en la tarde.',
    estado: 'abierto', proximoSeguimiento: sumarDias(4), adjuntos: [], seguimientos: [],
  },
  {
    id: 5, codigo: 'REQ-005', fechaRecepcion: sumarDias(-12), registradoPor: 3,
    reportanteNombre: 'Monica Landazuri', reportanteContacto: '0998730141',
    reportanteRelacion: 'propietario', lote: '867', calle: 'Calle T', ubicacionTexto: '',
    latitud: '', longitud: '', categoria: 'Áreas verdes y riego', area: 'Mantenimientos', prioridad: 'media',
    descripcion: 'Solicita podar los árboles de la calle T.',
    estado: 'cerrado', proximoSeguimiento: sumarDias(-8), adjuntos: [],
    seguimientos: [{ id: 1, fecha: sumarDias(-8), autor: 'Ana (Administración)', tipo: 'confirmacion', nota: 'Solución confirmada con la residente.' }],
  },
];

export const notificacionesDemo = [
  { id: 1, tipo: 'Seguimiento vencido', mensaje: 'REQ-001 lleva 3 días de atraso.', fecha: sumarDias(0), leida: false },
  { id: 2, tipo: 'Caso atendido', mensaje: 'REQ-003 fue marcado como atendido: falta confirmar.', fecha: sumarDias(-1), leida: false },
  { id: 3, tipo: 'Solicitud nueva', mensaje: 'Nueva solicitud REQ-004: paseo de perros.', fecha: sumarDias(-1), leida: true },
];
```

### `src/contextos/ContextoSesion.jsx`

Guarda quién inició sesión y lo comparte con toda la aplicación.

```jsx
import { createContext, useContext, useState } from 'react';

const ContextoSesion = createContext(null);

// Guarda quién inició sesión y lo comparte con toda la aplicación
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);

  function iniciarSesion(usuarioElegido) {
    setUsuario(usuarioElegido);
  }

  function cerrarSesion() {
    setUsuario(null);
  }

  return (
    <ContextoSesion.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoSesion.Provider>
  );
}

// Uso en cualquier componente:  const { usuario } = useSesion();
export function useSesion() {
  return useContext(ContextoSesion);
}
```

### `src/contextos/ContextoCasos.jsx`

Guarda los casos y las prioridades, y ofrece las acciones: crear caso, agregar seguimiento y cambiar plazos.

```jsx
import { createContext, useContext, useState } from 'react';
import { casosDemo, prioridadesIniciales } from '../datos/datosDemo';
import { hoy, sumarDias } from '../utilidades/fechas';

const ContextoCasos = createContext(null);

export function ProveedorCasos({ children }) {
  const [casos, setCasos] = useState(casosDemo);
  const [prioridades, setPrioridades] = useState(prioridadesIniciales);

  function buscarPrioridad(idPrioridad) {
    return prioridades.find((prioridad) => prioridad.id === idPrioridad);
  }

  // Crea un reporte nuevo. El código (REQ-006...) y la fecha son automáticos.
  function crearCaso(datosFormulario, usuario) {
    const nuevoId = Math.max(...casos.map((caso) => caso.id)) + 1;
    const plazoDias = buscarPrioridad(datosFormulario.prioridad).plazoDias;

    const nuevoCaso = {
      ...datosFormulario,
      id: nuevoId,
      codigo: `REQ-${String(nuevoId).padStart(3, '0')}`,
      fechaRecepcion: hoy(),
      registradoPor: usuario.id,
      estado: 'abierto',
      proximoSeguimiento: sumarDias(plazoDias),
      seguimientos: [],
    };
    setCasos([nuevoCaso, ...casos]);
    return nuevoCaso;
  }

  // Agrega una nota a la línea de tiempo y reinicia el plazo de seguimiento
  function agregarSeguimiento(idCaso, usuario, tipo, nota, nuevoEstado) {
    setCasos(casos.map((caso) => {
      if (caso.id !== idCaso) return caso;

      const estadoFinal = nuevoEstado || caso.estado;
      const plazoDias = buscarPrioridad(caso.prioridad).plazoDias;
      const nuevoSeguimiento = {
        id: caso.seguimientos.length + 1,
        fecha: hoy(),
        autor: usuario.nombre,
        tipo,
        nota,
      };
      return {
        ...caso,
        estado: estadoFinal,
        proximoSeguimiento: sumarDias(plazoDias),
        seguimientos: [nuevoSeguimiento, ...caso.seguimientos],
      };
    }));
  }

  function cambiarPlazoPrioridad(idPrioridad, nuevoPlazo) {
    setPrioridades(prioridades.map((prioridad) =>
      prioridad.id === idPrioridad ? { ...prioridad, plazoDias: nuevoPlazo } : prioridad
    ));
  }

  const valor = { casos, prioridades, buscarPrioridad, crearCaso, agregarSeguimiento, cambiarPlazoPrioridad };
  return <ContextoCasos.Provider value={valor}>{children}</ContextoCasos.Provider>;
}

export function useCasos() {
  return useContext(ContextoCasos);
}
```

### `src/componentes/Insignia.jsx`

Punto de color + texto. Se usa para estados y prioridades.

```jsx
// Un puntito de color con un texto. Sirve para estados y prioridades.
export default function Insignia({ texto, color }) {
  return (
    <span className="insignia">
      <span className="insignia__punto" style={{ background: color }} />
      {texto}
    </span>
  );
}
```

### `src/componentes/EncabezadoPagina.jsx`

Título de cada pantalla, con espacio para un botón a la derecha.

```jsx
// Título de cada pantalla, con un espacio opcional para un botón a la derecha
export default function EncabezadoPagina({ titulo, children }) {
  return (
    <div className="encabezado-pagina">
      <h1>{titulo}</h1>
      {children}
    </div>
  );
}
```

### `src/componentes/TarjetaCaso.jsx`

Resumen de un caso. El borde izquierdo toma el color de su prioridad y se pinta de rojo suave si el seguimiento está vencido.

```jsx
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import Insignia from './Insignia';
import { estados } from '../datos/datosDemo';
import { useCasos } from '../contextos/ContextoCasos';
import { diasDeAtraso } from '../utilidades/fechas';

// Resumen de un caso en la lista
export default function TarjetaCaso({ caso }) {
  const { buscarPrioridad } = useCasos();
  const prioridad = buscarPrioridad(caso.prioridad);
  const estado = estados[caso.estado];

  const diasAtraso = diasDeAtraso(caso.proximoSeguimiento);
  const estaAtrasado = caso.estado !== 'cerrado' && diasAtraso > 0;
  const ubicacion = caso.lote ? `Lote ${caso.lote} · ${caso.calle}` : caso.ubicacionTexto || 'Sin ubicación';

  return (
    <Link
      to={`/casos/${caso.id}`}
      className={`tarjeta tarjeta--enlace ${estaAtrasado ? 'tarjeta--vencida' : ''}`}
      style={{ borderLeftColor: prioridad.color }}
    >
      <div className="tarjeta__fila">
        <span className="tarjeta__codigo">{caso.codigo}</span>
        <Insignia texto={estado.nombre} color={estado.color} />
      </div>

      <p className="tarjeta__descripcion">{caso.descripcion}</p>

      <div className="tarjeta__fila texto-tenue">
        <span><MapPin size={14} /> {ubicacion}</span>
        {estaAtrasado ? (
          <span className="texto-alerta"><Clock size={14} /> {diasAtraso} día(s) de atraso</span>
        ) : (
          <Insignia texto={prioridad.nombre} color={prioridad.color} />
        )}
      </div>
    </Link>
  );
}
```

### `src/componentes/Navegacion.jsx`

Menú: **abajo** en el celular y **a la izquierda** en el computador (el cambio lo hace el CSS).

```jsx
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, Bell, Settings, Leaf } from 'lucide-react';
import { useSesion } from '../contextos/ContextoSesion';
import { puedeVerConfiguracion } from '../utilidades/permisos';

export default function Navegacion() {
  const { usuario } = useSesion();

  // Cada enlace: ruta, texto e icono
  const enlaces = [
    { ruta: '/', texto: 'Inicio', icono: <Home size={22} /> },
    { ruta: '/casos', texto: 'Casos', icono: <ClipboardList size={22} /> },
    { ruta: '/casos/nuevo', texto: 'Nuevo', icono: <PlusCircle size={22} /> },
    { ruta: '/notificaciones', texto: 'Avisos', icono: <Bell size={22} /> },
  ];
  if (puedeVerConfiguracion(usuario)) {
    enlaces.push({ ruta: '/configuracion', texto: 'Ajustes', icono: <Settings size={22} /> });
  }

  return (
    <nav className="navegacion">
      <div className="marca navegacion__marca"><Leaf size={22} /> El Condado</div>
      {enlaces.map((enlace) => (
        <NavLink
          key={enlace.ruta}
          to={enlace.ruta}
          end
          className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}
        >
          {enlace.icono}
          <span>{enlace.texto}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

### `src/componentes/DisenoPrincipal.jsx`

Marco común de todas las pantallas: navegación, cabecera y contenido.

```jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Leaf } from 'lucide-react';
import Navegacion from './Navegacion';
import { useSesion } from '../contextos/ContextoSesion';
import { etiquetasRol } from '../datos/datosDemo';

// Marco común de todas las pantallas: navegación + cabecera + contenido
export default function DisenoPrincipal() {
  const { usuario, cerrarSesion } = useSesion();
  const navegar = useNavigate();

  function salir() {
    cerrarSesion();
    navegar('/ingreso');
  }

  return (
    <div className="diseno">
      <Navegacion />
      <div className="diseno__principal">
        <header className="cabecera">
          <span className="marca"><Leaf size={22} /> El Condado</span>
          <div className="tarjeta__fila">
            <span className="texto-tenue">{usuario.nombre} · {etiquetasRol[usuario.rol]}</span>
            <button className="boton boton--contorno" onClick={salir} aria-label="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### `src/componentes/RutaProtegida.jsx`

Si no hay sesión iniciada, envía a la pantalla de ingreso.

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSesion } from '../contextos/ContextoSesion';

// Si no hay sesión, manda a la pantalla de ingreso
export default function RutaProtegida() {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/ingreso" replace />;
  return <Outlet />;
}
```

### `src/paginas/Ingreso.jsx`

Pantalla de ingreso en modo prueba: eliges un usuario para ver cómo se comporta cada rol.

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useSesion } from '../contextos/ContextoSesion';
import { usuariosDemo, etiquetasRol } from '../datos/datosDemo';

export default function Ingreso() {
  const { iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const [idUsuarioElegido, setIdUsuarioElegido] = useState(usuariosDemo[1].id);

  function entrar(evento) {
    evento.preventDefault();
    const usuarioElegido = usuariosDemo.find((usuario) => usuario.id === Number(idUsuarioElegido));
    iniciarSesion(usuarioElegido);
    navegar('/');
  }

  return (
    <div className="ingreso">
      <form className="tarjeta ingreso__tarjeta formulario" onSubmit={entrar}>
        <div className="marca"><Leaf size={26} /> Urbanización El Condado</div>
        <h1>Control de novedades</h1>

        {/* En el sistema real aquí van correo y contraseña */}
        <div className="campo">
          <label htmlFor="usuario">Entrar como (modo prueba)</label>
          <select id="usuario" value={idUsuarioElegido} onChange={(e) => setIdUsuarioElegido(e.target.value)}>
            {usuariosDemo.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre} — {etiquetasRol[usuario.rol]}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="boton boton--primario boton--completo">Entrar</button>
      </form>
    </div>
  );
}
```

### `src/paginas/Inicio.jsx`

Contadores y lista de **pendientes de seguimiento** (los más atrasados primero).

```jsx
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaCaso from '../componentes/TarjetaCaso';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { obtenerCasosVisibles } from '../utilidades/permisos';
import { diasDeAtraso } from '../utilidades/fechas';

export default function Inicio() {
  const { usuario } = useSesion();
  const { casos } = useCasos();

  const casosVisibles = obtenerCasosVisibles(casos, usuario);
  const casosActivos = casosVisibles.filter((caso) => caso.estado !== 'cerrado');

  const cantidadActivos = casosActivos.length;
  const cantidadPorConfirmar = casosActivos.filter((caso) => caso.estado === 'por_confirmar').length;
  const cantidadVencidos = casosActivos.filter((caso) => diasDeAtraso(caso.proximoSeguimiento) > 0).length;

  // Los más atrasados primero
  const pendientes = [...casosActivos].sort((a, b) => a.proximoSeguimiento.localeCompare(b.proximoSeguimiento));

  return (
    <>
      <EncabezadoPagina titulo={`Hola, ${usuario.nombre.split(' ')[0]}`}>
        <Link to="/casos/nuevo" className="boton boton--primario"><Plus size={18} /> Nuevo reporte</Link>
      </EncabezadoPagina>

      <section className="contadores">
        <div className="tarjeta contador">
          <div className="contador__numero">{cantidadActivos}</div>
          <span className="texto-tenue">Activos</span>
        </div>
        <div className="tarjeta contador">
          <div className="contador__numero" style={{ color: 'var(--color-info)' }}>{cantidadPorConfirmar}</div>
          <span className="texto-tenue">Por confirmar</span>
        </div>
        <div className="tarjeta contador">
          <div className="contador__numero" style={{ color: 'var(--color-alerta)' }}>{cantidadVencidos}</div>
          <span className="texto-tenue">Vencidos</span>
        </div>
      </section>

      <section>
        <h2>Pendientes de seguimiento</h2>
        <div className="lista">
          {pendientes.length === 0 && <p className="vacio">No hay casos pendientes 🎉</p>}
          {pendientes.map((caso) => <TarjetaCaso key={caso.id} caso={caso} />)}
        </div>
      </section>
    </>
  );
}
```

### `src/paginas/Casos.jsx`

Lista de casos con búsqueda y filtros por estado y prioridad.

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaCaso from '../componentes/TarjetaCaso';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { estados } from '../datos/datosDemo';
import { obtenerCasosVisibles } from '../utilidades/permisos';

export default function Casos() {
  const { usuario } = useSesion();
  const { casos, prioridades } = useCasos();

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');

  const casosVisibles = obtenerCasosVisibles(casos, usuario);

  // Aplica los tres filtros uno tras otro
  const casosFiltrados = casosVisibles.filter((caso) => {
    const textoCaso = `${caso.codigo} ${caso.reportanteNombre} ${caso.lote} ${caso.descripcion}`.toLowerCase();
    const coincideTexto = textoCaso.includes(textoBusqueda.toLowerCase());
    const coincideEstado = estadoFiltro === '' || caso.estado === estadoFiltro;
    const coincidePrioridad = prioridadFiltro === '' || caso.prioridad === prioridadFiltro;
    return coincideTexto && coincideEstado && coincidePrioridad;
  });

  return (
    <>
      <EncabezadoPagina titulo="Casos">
        <Link to="/casos/nuevo" className="boton boton--primario"><Plus size={18} /> Nuevo reporte</Link>
      </EncabezadoPagina>

      <div className="filtros">
        <input
          className="tarjeta" type="search" placeholder="Buscar por código, nombre, lote..."
          value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)}
        />
        <select className="tarjeta" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(estados).map(([clave, estado]) => (
            <option key={clave} value={clave}>{estado.nombre}</option>
          ))}
        </select>
        <select className="tarjeta" value={prioridadFiltro} onChange={(e) => setPrioridadFiltro(e.target.value)}>
          <option value="">Todas las prioridades</option>
          {prioridades.map((prioridad) => (
            <option key={prioridad.id} value={prioridad.id}>{prioridad.nombre}</option>
          ))}
        </select>
      </div>

      <div className="lista">
        {casosFiltrados.length === 0 && <p className="vacio">No se encontraron casos.</p>}
        {casosFiltrados.map((caso) => <TarjetaCaso key={caso.id} caso={caso} />)}
      </div>
    </>
  );
}
```

### `src/paginas/CasoNuevo.jsx`

Formulario de nuevo reporte. Incluye calle → lote, botón de GPS y archivos opcionales.

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { areas, categorias, relacionesReportante, callesDemo } from '../datos/datosDemo';

const formularioVacio = {
  reportanteNombre: '',
  reportanteContacto: '',
  reportanteRelacion: 'propietario',
  calle: '',
  lote: '',
  ubicacionTexto: '',
  latitud: '',
  longitud: '',
  categoria: 'Otros',
  area: 'Administración',
  prioridad: 'media',
  descripcion: '',
};

export default function CasoNuevo() {
  const { usuario } = useSesion();
  const { prioridades, crearCaso } = useCasos();
  const navegar = useNavigate();

  const [datosFormulario, setDatosFormulario] = useState(formularioVacio);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [archivoOficio, setArchivoOficio] = useState(null);
  const [mensajeGps, setMensajeGps] = useState('');

  const calleElegida = callesDemo.find((calle) => calle.nombre === datosFormulario.calle);
  const lotesDeLaCalle = calleElegida ? calleElegida.lotes : [];

  // Un solo manejador para todos los campos: usa el atributo "name" de cada uno
  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    const datosNuevos = { ...datosFormulario, [name]: value };
    if (name === 'calle') datosNuevos.lote = ''; // al cambiar de calle se borra el lote
    setDatosFormulario(datosNuevos);
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      setMensajeGps('Este navegador no permite usar el GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setDatosFormulario((anterior) => ({
          ...anterior,
          latitud: posicion.coords.latitude.toFixed(6),
          longitud: posicion.coords.longitude.toFixed(6),
        }));
        setMensajeGps('Ubicación capturada.');
      },
      () => setMensajeGps('No se pudo obtener la ubicación. Revisa el permiso y que la página use HTTPS.')
    );
  }

  function guardarReporte(evento) {
    evento.preventDefault();

    const adjuntos = [];
    if (archivoFoto) adjuntos.push({ tipo: 'dano', nombre: archivoFoto.name });
    if (archivoOficio) adjuntos.push({ tipo: 'oficio', nombre: archivoOficio.name });

    const casoCreado = crearCaso({ ...datosFormulario, adjuntos }, usuario);
    navegar(`/casos/${casoCreado.id}`);
  }

  return (
    <>
      <EncabezadoPagina titulo="Nuevo reporte" />

      <form className="tarjeta formulario" onSubmit={guardarReporte}>
        <h2>Quién reporta</h2>
        <div className="rejilla-dos">
          <div className="campo">
            <label htmlFor="reportanteNombre">Nombres y apellidos *</label>
            <input id="reportanteNombre" name="reportanteNombre" required
              value={datosFormulario.reportanteNombre} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="reportanteContacto">Contacto (teléfono)</label>
            <input id="reportanteContacto" name="reportanteContacto" inputMode="tel"
              value={datosFormulario.reportanteContacto} onChange={cambiarCampo} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="reportanteRelacion">Relación con la urbanización</label>
          <select id="reportanteRelacion" name="reportanteRelacion"
            value={datosFormulario.reportanteRelacion} onChange={cambiarCampo}>
            {relacionesReportante.map((relacion) => (
              <option key={relacion.valor} value={relacion.valor}>{relacion.nombre}</option>
            ))}
          </select>
        </div>

        <h2>Dónde ocurre</h2>
        <div className="rejilla-dos">
          <div className="campo">
            <label htmlFor="calle">Calle</label>
            <select id="calle" name="calle" value={datosFormulario.calle} onChange={cambiarCampo}>
              <option value="">— Sin calle —</option>
              {callesDemo.map((calle) => <option key={calle.nombre}>{calle.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="lote">Lote</label>
            <select id="lote" name="lote" value={datosFormulario.lote} onChange={cambiarCampo} disabled={!calleElegida}>
              <option value="">— Sin lote —</option>
              {lotesDeLaCalle.map((lote) => <option key={lote}>{lote}</option>)}
            </select>
          </div>
        </div>
        <div className="campo">
          <label htmlFor="ubicacionTexto">Referencia de ubicación</label>
          <input id="ubicacionTexto" name="ubicacionTexto" placeholder="Ej: frente a la iglesia"
            value={datosFormulario.ubicacionTexto} onChange={cambiarCampo} />
        </div>
        <div className="acciones">
          <button type="button" className="boton boton--contorno" onClick={usarMiUbicacion}>
            <LocateFixed size={18} /> Usar mi ubicación (GPS)
          </button>
          {datosFormulario.latitud && (
            <span className="texto-tenue">{datosFormulario.latitud}, {datosFormulario.longitud}</span>
          )}
        </div>
        {mensajeGps && <p className="texto-tenue">{mensajeGps}</p>}

        <h2>Qué pasó</h2>
        <div className="rejilla-dos">
          <div className="campo">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" name="categoria" value={datosFormulario.categoria} onChange={cambiarCampo}>
              {categorias.map((categoria) => <option key={categoria}>{categoria}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="area">Área que atiende</label>
            <select id="area" name="area" value={datosFormulario.area} onChange={cambiarCampo}>
              {areas.map((area) => <option key={area}>{area}</option>)}
            </select>
          </div>
        </div>
        <div className="campo">
          <label htmlFor="prioridad">Prioridad</label>
          <select id="prioridad" name="prioridad" value={datosFormulario.prioridad} onChange={cambiarCampo}>
            {prioridades.map((prioridad) => (
              <option key={prioridad.id} value={prioridad.id}>
                {prioridad.nombre} (seguimiento cada {prioridad.plazoDias} día/s)
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea id="descripcion" name="descripcion" rows="4" required
            value={datosFormulario.descripcion} onChange={cambiarCampo} />
        </div>

        <h2>Archivos (opcional)</h2>
        <div className="rejilla-dos">
          <div className="campo">
            <label htmlFor="foto">Foto del daño</label>
            <input id="foto" type="file" accept="image/*" onChange={(e) => setArchivoFoto(e.target.files[0])} />
          </div>
          <div className="campo">
            <label htmlFor="oficio">Oficio (PDF)</label>
            <input id="oficio" type="file" accept="application/pdf" onChange={(e) => setArchivoOficio(e.target.files[0])} />
          </div>
        </div>

        <button type="submit" className="boton boton--primario boton--completo">Guardar reporte</button>
      </form>
    </>
  );
}
```

### `src/paginas/CasoDetalle.jsx`

Detalle del caso con las acciones que corresponden a cada rol y el historial.

```jsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Paperclip, CheckCircle2, Undo2, Wrench, Send } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Insignia from '../componentes/Insignia';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { estados, relacionesReportante } from '../datos/datosDemo';
import { puedeAtenderCaso, puedeConfirmarCaso, puedeAgregarSeguimiento, obtenerCasosVisibles } from '../utilidades/permisos';
import { formatearFecha, diasDeAtraso } from '../utilidades/fechas';

export default function CasoDetalle() {
  const { idCaso } = useParams();
  const { usuario } = useSesion();
  const { casos, buscarPrioridad, agregarSeguimiento } = useCasos();
  const [textoNota, setTextoNota] = useState('');

  // Solo se puede abrir un caso que el usuario tiene permitido ver
  const casosVisibles = obtenerCasosVisibles(casos, usuario);
  const caso = casosVisibles.find((c) => c.id === Number(idCaso));
  if (!caso) return <p className="vacio">No se encontró el caso.</p>;

  const estado = estados[caso.estado];
  const prioridad = buscarPrioridad(caso.prioridad);
  const relacion = relacionesReportante.find((r) => r.valor === caso.reportanteRelacion);
  const estaAtrasado = caso.estado !== 'cerrado' && diasDeAtraso(caso.proximoSeguimiento) > 0;
  const telefonoWhatsapp = caso.reportanteContacto.replace(/^0/, '593');

  // ---------- Acciones ----------
  function guardarNota(evento) {
    evento.preventDefault();
    if (textoNota.trim() === '') return;
    agregarSeguimiento(caso.id, usuario, 'nota', textoNota);
    setTextoNota('');
  }

  function empezarATrabajar() {
    agregarSeguimiento(caso.id, usuario, 'nota', 'Se empezó a trabajar en el caso.', 'en_proceso');
  }

  function marcarComoAtendido() {
    const nota = textoNota.trim() || 'Trabajo realizado.';
    agregarSeguimiento(caso.id, usuario, 'atendido', nota, 'por_confirmar');
    setTextoNota('');
  }

  function confirmarSolucion() {
    const nota = textoNota.trim() || 'Solución confirmada.';
    agregarSeguimiento(caso.id, usuario, 'confirmacion', nota, 'cerrado');
    setTextoNota('');
  }

  function devolverCaso() {
    if (textoNota.trim() === '') {
      alert('Escribe en la nota qué falta por resolver.');
      return;
    }
    agregarSeguimiento(caso.id, usuario, 'devolucion', textoNota, 'en_proceso');
    setTextoNota('');
  }

  return (
    <>
      <Link to="/casos" className="texto-tenue"><ArrowLeft size={14} /> Volver a casos</Link>

      <section className="tarjeta">
        <div className="tarjeta__fila">
          <h1>{caso.codigo}</h1>
          <Insignia texto={estado.nombre} color={estado.color} />
        </div>
        <div className="tarjeta__fila texto-tenue">
          <span>Recibido el {formatearFecha(caso.fechaRecepcion)}</span>
          <Insignia texto={`Prioridad ${prioridad.nombre}`} color={prioridad.color} />
        </div>
        {estaAtrasado && (
          <p className="texto-alerta">Seguimiento vencido hace {diasDeAtraso(caso.proximoSeguimiento)} día(s)</p>
        )}
        <p style={{ marginTop: '0.75rem' }}>{caso.descripcion}</p>
      </section>

      <section className="tarjeta datos">
        <div>
          <div className="datos__titulo">Reportante</div>
          {caso.reportanteNombre} <span className="texto-tenue">({relacion?.nombre})</span>
        </div>
        <div>
          <div className="datos__titulo">Contacto</div>
          {caso.reportanteContacto ? (
            <span className="acciones">
              <a href={`tel:${caso.reportanteContacto}`}><Phone size={14} /> {caso.reportanteContacto}</a>
              <a href={`https://wa.me/${telefonoWhatsapp}`} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a>
            </span>
          ) : 'Sin contacto'}
        </div>
        <div>
          <div className="datos__titulo">Ubicación</div>
          <MapPin size={14} /> {caso.lote ? `Lote ${caso.lote} · ${caso.calle}` : 'Sin lote'}
          {caso.ubicacionTexto && <div className="texto-tenue">{caso.ubicacionTexto}</div>}
          {caso.latitud && (
            <a href={`https://www.google.com/maps?q=${caso.latitud},${caso.longitud}`} target="_blank" rel="noreferrer">
              Ver en el mapa
            </a>
          )}
        </div>
        <div>
          <div className="datos__titulo">Área y categoría</div>
          {caso.area} · {caso.categoria}
        </div>
        {caso.adjuntos.length > 0 && (
          <div>
            <div className="datos__titulo">Archivos</div>
            {caso.adjuntos.map((adjunto) => (
              <div key={adjunto.nombre}><Paperclip size={14} /> {adjunto.nombre} <span className="texto-tenue">({adjunto.tipo})</span></div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- Acciones según el rol ---------- */}
      {caso.estado !== 'cerrado' && puedeAgregarSeguimiento(usuario) && (
        <form className="tarjeta formulario" onSubmit={guardarNota}>
          <h2>Seguimiento</h2>
          <div className="campo">
            <textarea rows="2" placeholder="Escribe una nota..." value={textoNota} onChange={(e) => setTextoNota(e.target.value)} />
          </div>
          <div className="acciones">
            <button type="submit" className="boton boton--contorno"><Send size={16} /> Guardar nota</button>

            {puedeAtenderCaso(usuario, caso) && caso.estado === 'abierto' && (
              <button type="button" className="boton boton--contorno" onClick={empezarATrabajar}>
                <Wrench size={16} /> Empezar a trabajar
              </button>
            )}
            {puedeAtenderCaso(usuario, caso) && (
              <button type="button" className="boton boton--primario" onClick={marcarComoAtendido}>
                <CheckCircle2 size={16} /> Marcar como atendido
              </button>
            )}
            {puedeConfirmarCaso(usuario, caso) && (
              <>
                <button type="button" className="boton boton--primario" onClick={confirmarSolucion}>
                  <CheckCircle2 size={16} /> Confirmar solución
                </button>
                <button type="button" className="boton boton--alerta" onClick={devolverCaso}>
                  <Undo2 size={16} /> Devolver
                </button>
              </>
            )}
          </div>
        </form>
      )}

      <section>
        <h2>Historial</h2>
        {caso.seguimientos.length === 0 && <p className="texto-tenue">Aún no hay seguimientos.</p>}
        <ul className="linea-tiempo">
          {caso.seguimientos.map((seguimiento) => (
            <li key={seguimiento.id} className="linea-tiempo__item">
              <div>{seguimiento.nota}</div>
              <div className="texto-tenue">{seguimiento.autor} · {formatearFecha(seguimiento.fecha)}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

### `src/paginas/Notificaciones.jsx`

Pantalla de avisos.

```jsx
import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { notificacionesDemo } from '../datos/datosDemo';
import { formatearFecha } from '../utilidades/fechas';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState(notificacionesDemo);

  function marcarTodasLeidas() {
    setNotificaciones(notificaciones.map((notificacion) => ({ ...notificacion, leida: true })));
  }

  return (
    <>
      <EncabezadoPagina titulo="Avisos">
        <button className="boton boton--contorno" onClick={marcarTodasLeidas}>
          <CheckCheck size={18} /> Marcar todo como leído
        </button>
      </EncabezadoPagina>

      <div className="lista">
        {notificaciones.map((notificacion) => (
          <div
            key={notificacion.id}
            className="tarjeta tarjeta--enlace"
            style={{ borderLeftColor: notificacion.leida ? 'var(--color-borde)' : 'var(--color-primario)' }}
          >
            <div className="tarjeta__fila">
              <strong><Bell size={14} /> {notificacion.tipo}</strong>
              <span className="texto-tenue">{formatearFecha(notificacion.fecha)}</span>
            </div>
            <p>{notificacion.mensaje}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

### `src/paginas/Configuracion.jsx`

Solo para el superusuario: editar los plazos de seguimiento por prioridad.

```jsx
import { Navigate } from 'react-router-dom';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Insignia from '../componentes/Insignia';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { puedeVerConfiguracion } from '../utilidades/permisos';

// Pantalla solo para el superusuario
export default function Configuracion() {
  const { usuario } = useSesion();
  const { prioridades, cambiarPlazoPrioridad } = useCasos();

  if (!puedeVerConfiguracion(usuario)) return <Navigate to="/" replace />;

  return (
    <>
      <EncabezadoPagina titulo="Configuración" />

      <section className="tarjeta formulario">
        <h2>Prioridades y plazos de seguimiento</h2>
        <p className="texto-tenue">Cada cuántos días hay que dar seguimiento a un caso según su prioridad.</p>

        {prioridades.map((prioridad) => (
          <div key={prioridad.id} className="tarjeta__fila">
            <Insignia texto={prioridad.nombre} color={prioridad.color} />
            <div className="campo campo--horizontal">
              <input
                type="number" min="0" style={{ width: '5rem' }}
                value={prioridad.plazoDias}
                onChange={(e) => cambiarPlazoPrioridad(prioridad.id, Number(e.target.value))}
              />
              <span>día(s)</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
```

### `src/App.jsx`

Define todas las rutas de la aplicación.

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorSesion } from './contextos/ContextoSesion';
import { ProveedorCasos } from './contextos/ContextoCasos';
import RutaProtegida from './componentes/RutaProtegida';
import DisenoPrincipal from './componentes/DisenoPrincipal';
import Ingreso from './paginas/Ingreso';
import Inicio from './paginas/Inicio';
import Casos from './paginas/Casos';
import CasoNuevo from './paginas/CasoNuevo';
import CasoDetalle from './paginas/CasoDetalle';
import Notificaciones from './paginas/Notificaciones';
import Configuracion from './paginas/Configuracion';

export default function App() {
  return (
    <ProveedorSesion>
      <ProveedorCasos>
        <BrowserRouter>
          <Routes>
            <Route path="/ingreso" element={<Ingreso />} />

            <Route element={<RutaProtegida />}>
              <Route element={<DisenoPrincipal />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/casos" element={<Casos />} />
                <Route path="/casos/nuevo" element={<CasoNuevo />} />
                <Route path="/casos/:idCaso" element={<CasoDetalle />} />
                <Route path="/notificaciones" element={<Notificaciones />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProveedorCasos>
    </ProveedorSesion>
  );
}
```

### `src/main.jsx`

Punto de entrada. Reemplaza el contenido que trae Vite.

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './estilos/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 7. Cómo probarlo

Ejecuta `npm run dev` y abre la dirección que muestra la terminal. Para ver la versión de celular, abre las herramientas del navegador (F12) y activa el modo dispositivo.

| Entra como | Qué deberías ver |
|---|---|
| **Ana (Administración)** | Todos los casos. En **REQ-003** (*Por confirmar*) aparecen **Confirmar solución** y **Devolver**. |
| **Luis (Administración)** | Todos los casos, pero **sin** botón de confirmar. |
| **Jefe de Mantenimiento** | Solo los casos de su área. En **REQ-001** aparece **Marcar como atendido**. |
| **Jefe de Seguridad** | Solo los casos de Seguridad. |
| **Recepción** | Solo los casos que ella registró. No ve el seguimiento. |
| **Superusuario** | Todo, y el menú **Ajustes** para cambiar plazos. |

**Prueba sugerida de punta a punta:**
1. Entra como *Recepción* y crea un reporte nuevo.
2. Cierra sesión (icono de salida) y entra como *Jefe de Mantenimiento*; busca el caso y pulsa **Marcar como atendido**.
3. Entra como *Ana* y pulsa **Confirmar solución**. El caso pasa a *Cerrado* (azul).
4. Entra como *Superusuario*, cambia el plazo de *Media* a 2 días y crea otro caso para ver el cambio.

> El botón de **GPS** solo funciona si la página se abre con **HTTPS** o en `localhost`.

---

## 8. Pendiente para conectarlo al sistema real

- Reemplazar `datosDemo.js` por llamadas a la API (`fetch`) y el ingreso de prueba por correo y contraseña con token.
- Guardar de verdad las fotos y PDF (hoy solo se registra el nombre del archivo).
- Cargar calles y lotes desde la base de datos, con su pantalla de administración (CRUD).
- Notificaciones reales desde el servidor, con el contador en el menú.
- Los datos de este front **no se guardan**: al recargar la página vuelven a los de ejemplo.
- Los permisos de esta demo solo ocultan botones; la seguridad real debe aplicarla el servidor.
