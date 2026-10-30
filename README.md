# CASOOK · Cada caso bajo control

Sistema interno de gestión y seguimiento de novedades para urbanizaciones.
Permite registrar casos, asignarlos al área responsable, darles seguimiento
hasta su cierre y generar reportes en PDF.

> **Estado actual:** solo front-end. Los datos son de demostración y viven en
> memoria. El backend se construirá aparte (ver [Integración con el backend](#integración-con-el-backend)).

---

## Tecnologías

| Herramienta | Uso |
| --- | --- |
| React 19 | Interfaz de usuario |
| Vite | Servidor de desarrollo y compilación |
| React Router | Navegación y rutas protegidas |
| jsPDF + jspdf-autotable | Reportes en PDF |
| lucide-react | Iconos |
| CSS3 puro | Estilos (sin Tailwind ni frameworks) |

---

## Requisitos

- Node.js 18 o superior
- npm (o bun, el repositorio incluye `bun.lock`)

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo (http://localhost:3000)
npm run dev

# 3. Compilar para producción
npm run build

# 4. Probar la compilación
npm run preview
```

---

## Funcionalidades

- **Flujo de casos:** `en_proceso → por_confirmar → cerrado`.
  Administración y Superusuario pueden **devolver a proceso** un caso con una nota obligatoria.
- **Fecha y hora** de apertura y cierre (zona horaria `America/Guayaquil`) y cálculo del **tiempo de resolución**.
- **Historial de seguimiento** con autor, fecha, hora y tiempo desde la apertura.
- **10 categorías** con asignación automática al área responsable (Mantenimiento, Seguridad o Administración).
- **Catálogos** de etapas, calles y lotes (formato `NUMERO.SUBLOTE`, por ejemplo `189.CASA1`) con borrado lógico y paginación.
- **Reportes en PDF:** reporte general y reporte de un solo caso (con fotos e historial).
- **Nombre de la urbanización configurable** (solo Superusuario).
- **Diseño responsive** con menú hamburguesa y botón de cerrar sesión siempre visible en móvil.
- **Notificaciones** y mensajes de confirmación (toasts).

## Roles y permisos

| Rol | Alcance |
| --- | --- |
| Superusuario | Acceso total: usuarios, catálogos, reportes, configuración |
| Operador Administración | Ve todos los casos; confirma cierres y devuelve a proceso |
| Operador Seguridad | Ve todos los casos; atiende los de su área |
| Mantenimiento | Solo ve y atiende los casos del área Mantenimiento |

Las reglas están centralizadas en `src/utilidades/permisos.js`.

## Usuarios de demostración

La contraseña inicial de cada usuario es igual a su cédula.

| Rol | Cédula |
| --- | --- |
| Superusuario | `1710034065` |
| Operador Administración | `1715632848` |
| Operador Seguridad | `1722839451` |
| Mantenimiento | `1713562914` |

> Solo para pruebas. No usar estas credenciales en producción.

---

## Estructura del proyecto

```
src/
├── App.tsx              # Rutas y proveedores globales
├── main.tsx             # Punto de entrada
├── componentes/         # Piezas reutilizables (menú, tarjetas, logo, paginador…)
├── contextos/           # Estado global (sesión, casos, catálogos, configuración…)
├── paginas/             # Pantallas (Ingreso, Inicio, Casos, Reportes, Usuarios…)
├── datos/               # Datos de demostración
├── utilidades/          # Permisos, fechas, validaciones, generador de PDF
└── estilos/             # CSS modular (variables, reset, componentes, páginas)
```

Los estilos siguen la convención `.componente`, `.componente__elemento`,
`.componente--variante` y las variables compartidas están en
`src/estilos/variables.css`.

---

## Integración con el backend

Para conectar un backend propio, los puntos a reemplazar son:

| Dónde | Qué hace hoy | Qué debe hacer con el backend |
| --- | --- | --- |
| `src/datos/datosDemo.js` | Datos iniciales en memoria | Eliminar y consumir la API |
| `src/contextos/ContextoSesion.jsx` | Compara contraseñas en texto plano | Login contra el servidor (token y contraseñas con hash) |
| `src/contextos/ContextoCasos.jsx` | Crea y modifica casos en memoria | Llamadas a la API de casos |
| `src/contextos/ContextoCatalogos.jsx` | Catálogos en memoria | Llamadas a la API de catálogos |
| `src/utilidades/permisos.js` | Permisos solo en el front | Repetir las mismas reglas en el servidor |

Recursos que el backend debería exponer: **autenticación, usuarios, casos
(con seguimientos y fotos), catálogos (categorías, etapas, calles, lotes,
prioridades) y configuración**.

---

## Pendientes conocidos

- Persistir casos, usuarios y catálogos (hoy solo el nombre de la urbanización se guarda en `localStorage`).
- Autenticación real y contraseñas con hash.
- Limpiar restos de la marca anterior (`LogoQuinde.jsx`, `metadata.json`).
- Quitar dependencias que no se usan en el front: `express`, `dotenv`, `tsx` y `@google/genai`.
- Permitir zoom en móvil (quitar `user-scalable=no` de `index.html`).
- Agregar pruebas para `permisos.js`, `fechas.js` y `validacionCedula.js`.

---

## Licencia

Proyecto académico. Define aquí la licencia que corresponda.
