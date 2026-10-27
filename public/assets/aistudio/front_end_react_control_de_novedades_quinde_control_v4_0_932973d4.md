# Quinde Control · Sistema Interno de Gestión y Seguimiento — Urbanización El Condado (v4.0)

> **Nombre del Sistema:** QUINDE CONTROL  
> **Eslogan:** *Cada caso bajo control.*  
> **Pie de página:** SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO · Urbanización El Condado  

Guía y especificación integral para la construcción del **front-end** en **React 19 + Vite** del sistema de gestión de casos y reportes de la Urbanización El Condado. La versión 4.0 perfecciona el control de permisos por rol, la visibilidad de datos mock, la validación estricta de inputs con mensajes en línea, el autocompletado para miles de lotes, la paginación a 20 registros, el filtrado dinámico para Mantenimiento y una paleta visual renovada con acentos oscuros.

---

## 1. Requerimientos y Reglas de Negocio (Versión 4.0)

### 1.1 Identidad Visual y Branding (Quinde Control)
* **Login & Encabezado Principal:**
  * **Nombre:** QUINDE CONTROL
  * **Eslogan:** *Cada caso bajo control.*
* **Footer Institucional:**
  * `SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO — Urbanización El Condado`
* **Estilo Visual:** Se incorporan tonos oscuros (Verde Esmeralda Oscuro `#11321d` y Gris Antracita `#1f2937`) para aportar elegancia, contraste y tono profesional a las cabeceras, tarjetas KPI y paneles de navegación.

### 1.2 Visibilidad Restringida de Métricas Territoriales y Catálogos
* **Exclusividad Superusuario:** Las páginas de `Catálogos`, `Usuarios` y la sección de **Métricas Territoriales / Infraestructura** en el Dashboard son visibles **única y exclusivamente** para el rol `superusuario`.
* Para los roles `operador_administracion`, `operador_seguridad` y `mantenimiento`, dichas secciones se ocultan de la barra de navegación y sus rutas están protegidas contra acceso directo.

### 1.3 Corrección en Filtrado de Datos para Rol Mantenimiento
* El rol `mantenimiento` solo puede visualizar y gestionar los casos cuyo campo de área sea **MANTENIMIENTO**.
* Se ha corregido la lógica centralizada de filtrado (`filtrarCasosPorUsuario`) en el contexto para asegurar que los datos de prueba (mock) y los casos reales asignados a Mantenimiento aparezcan correctamente reflejados tanto en el Dashboard como en las pantallas de Lista y Detalle.

### 1.4 Validaciones Estrictas por Campo y Errores Inline
* **Campos Numéricos (Cédula y Teléfono):**
  * Filtran caracteres no numéricos al escribir (`/^\d*$/`).
  * No permiten ingresar letras ni símbolos.
  * Validación adicional del algoritmo **Módulo 10 de Cédula Ecuatoriana**.
* **Campos de Texto (Nombres y Apellidos):**
  * Filtran caracteres numéricos (`/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/`).
* **Mensajes de Error en Línea (Inline Validation):**
  * Cada campo del formulario muestra su alerta de error u obligatoriedad en color rojo justo **debajo del input** correspondiente.

### 1.5 Autocompletado de Lotes (3,000+ Registros)
* Componente **Autocomplete / Typeahead** para el campo *Lote del Residente*.
* Permite al usuario escribir (ej. `508` o `MZA-12`) y despliega dinámicamente coincidencias filtradas en tiempo real de un catálogo de más de 3,000 lotes registrados, evitando ralentizaciones o sobrecarga visual.

### 1.6 Paginación de Listas (Máximo 20 Registros)
* Todas las vistas en lista (Casos, Usuarios, Catálogos) implementan **paginación cliente/servidor de máximo 20 ítems por página**, con controles numéricos de navegación y resumen de registros visible.

---

## 2. Estructura del Proyecto

```text
src/
├── main.jsx
├── App.jsx
├── estilos/
│   ├── variables.css          ← Paleta actualizada con acentos oscuros
│   └── global.css             ← Mensajes de error inline y paginación
├── datos/
│   ├── lotesEcuador.js        ← Base de datos de 3000+ lotes
│   └── datosDemo.js            ← Mock data corregido y sincronizado
├── utilidades/
│   ├── fechas.js
│   ├── permisos.js            ← Control de acceso v4.0
│   ├── texto.js                ← Mayúsculas y formato WhatsApp
│   ├── validaciones.js        ← Regex numérico/texto + Cédula EC (Módulo 10)
│   └── generadorPdf.js
├── contextos/
│   ├── ContextoSesion.jsx
│   ├── ContextoCasos.jsx       ← Lógica de filtrado por rol corregida
│   ├── ContextoCatalogos.jsx
│   └── ContextoToast.jsx
├── componentes/
│   ├── Navegacion.jsx          ← Oculta rutas no permitidas
│   ├── AutocompleteLote.jsx    ← Búsqueda rápida en 3000+ lotes
│   ├── VistaPreviaImagen.jsx   ← Thumbnail + Modal expandible
│   ├── Paginador.jsx           ← Control de 20 registros por página
│   ├── PiePagina.jsx           ← Footer institucional Quinde Control
│   └── CampoEntrada.jsx        ← Input reutilizable con error inline
└── paginas/
    ├── Ingreso.jsx             ← Login Quinde Control con acentos oscuros
    ├── Inicio.jsx              ← Dashboard con visibilidad según rol
    ├── Casos.jsx               ← Lista paginada a 20 con filtro Mantenimiento
    ├── CasoNuevo.jsx           ← Validaciones inline + Autocomplete Lote
    ├── CasoDetalle.jsx
    ├── Reportes.jsx
    ├── Usuarios.jsx            ← Exclusivo Superusuario + Validaciones
    └── Catalogos.jsx           ← Exclusivo Superusuario
```

---

## 3. Código Fuente Principal (Versión 4.0)

### 3.1 Estilos con Tonos Oscuros (`src/estilos/variables.css`)

```css
:root {
  /* Paleta Verde Esmeralda Quinde */
  --color-primario: #11321d;        /* Verde Oscuro Elegante */
  --color-primario-hover: #1b4b2c;
  --color-secundario: #2a8c4b;      /* Verde Esmeralda */
  --color-acento-oscuro: #0f172a;   /* Azul/Gris Noche para paneles */

  /* Fondos y Superficies */
  --color-fondo: #f8fafc;
  --color-tarjeta: #ffffff;
  --color-borde: #e2e8f0;

  /* Textos y Estados */
  --color-texto: #0f172a;
  --color-texto-mutado: #64748b;
  --color-error: #dc2626;          /* Rojo para alertas inline */
  --color-exito: #16a34a;
  --color-advertencia: #d97706;

  /* Sombras */
  --sombra-tarjeta: 0 4px 6px -1px rgba(15, 23, 42, 0.08);
}
```

---

### 3.2 Lógica de Validaciones e Inputs (`src/utilidades/validaciones.js`)

```javascript
// Permite únicamente números (Cédula y Teléfono)
export function soloNumeros(valor) {
  return valor.replace(/\D/g, '');
}

// Permite únicamente letras y espacios (Nombres y Apellidos)
export function soloLetras(valor) {
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
}

// Algoritmo Módulo 10 para Cédula Ecuatoriana
export function validarCedulaEcuatoriana(cedula) {
  const c = String(cedula).trim();
  if (c.length !== 10 || !/^\d+$/.test(c)) return false;

  const prov = parseInt(c.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(c.substring(2, 3), 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(c.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(c.substring(i, i + 1), 10) * coeficientes[i];
    if (val >= 10) val -= 9;
    suma += val;
  }

  const modulo = (Math.ceil(suma / 10) * 10) - suma;
  const esperado = modulo === 10 ? 0 : modulo;

  return esperado === digitoVerificador;
}
```

---

### 3.3 Componente de Entrada con Alerta Inline (`src/componentes/CampoEntrada.jsx`)

```jsx
export default function CampoEntrada({
  label,
  tipo = 'text',
  valor,
  onChange,
  error,
  requerido = false,
  placeholder = '',
  maxlength
}) {
  return (
    <div className="campo-grupo">
      <label className="campo-label">
        {label} {requerido && <span className="campo-requerido">*</span>}
      </label>
      <input
        type={tipo}
        value={valor}
        onChange={onChange}
        maxLength={maxlength}
        placeholder={placeholder}
        className={`campo-input ${error ? 'campo-input--error' : ''}`}
      />
      {error && <span className="campo-mensaje-error">{error}</span>}
    </div>
  );
}
```

---

### 3.4 Autocompletado para 3,000+ Lotes (`src/componentes/AutocompleteLote.jsx`)

```jsx
import { useState, useMemo } from 'react';

export default function AutocompleteLote({ lotes, valorSeleccionado, alSeleccionar, error }) {
  const [busqueda, setBusqueda] = useState(valorSeleccionado || '');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  // Filtrado eficiente en tiempo real sobre los 3000+ lotes
  const lotesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const termino = busqueda.toUpperCase();
    return lotes
      .filter((l) => l.nombre.toUpperCase().includes(termino))
      .slice(0, 15); // Limitar a las primeras 15 coincidencias visuales
  }, [busqueda, lotes]);

  function manejarSeleccion(lote) {
    setBusqueda(lote.nombre.toUpperCase());
    alSeleccionar(lote.nombre.toUpperCase());
    setMostrarOpciones(false);
  }

  return (
    <div className="autocomplete-contenedor">
      <label className="campo-label">
        Lote del Residente <span className="campo-requerido">*</span>
      </label>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => {
          const val = e.target.value.toUpperCase();
          setBusqueda(val);
          alSeleccionar(val);
          setMostrarOpciones(true);
        }}
        onFocus={() => setMostrarOpciones(true)}
        placeholder="Escriba para buscar lote (ej. LOTE 508.6)..."
        className={`campo-input ${error ? 'campo-input--error' : ''}`}
      />
      {error && <span className="campo-mensaje-error">{error}</span>}

      {mostrarOpciones && lotesFiltrados.length > 0 && (
        <ul className="autocomplete-lista">
          {lotesFiltrados.map((lote) => (
            <li
              key={lote.id}
              className="autocomplete-item"
              onClick={() => manejarSeleccion(lote)}
            >
              <strong>{lote.nombre}</strong> — {lote.etapa || 'SIN ETAPA'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 3.5 Contexto de Casos con Filtrado por Rol Correjido (`src/contextos/ContextoCasos.jsx`)

```jsx
import { createContext, useContext, useState, useMemo } from 'react';
import { casosInicialesDemo } from '../datos/datosDemo';
import { useSesion } from './ContextoSesion';

const ContextoCasos = createContext(null);

export function ProveedorCasos({ children }) {
  const [casos, setCasos] = useState(casosInicialesDemo);
  const { usuario } = useSesion();

  // Filtrado que garantiza que el usuario MANTENIMIENTO vea sus casos
  const casosVisibles = useMemo(() => {
    if (!usuario) return [];

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
  }, [casos, usuario]);

  return (
    <ContextoCasos.Provider value={{ casos: casosVisibles, todosLosCasos: casos, setCasos }}>
      {children}
    </ContextoCasos.Provider>
  );
}

export const useCasos = () => useContext(ContextoCasos);
```

---

### 3.6 Paginador Genérico (Máximo 20 Registros) (`src/componentes/Paginador.jsx`)

```jsx
export default function Paginador({ paginaActual, totalPaginas, alCambiarPagina, totalRegistros }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="paginador-contenedor">
      <span className="paginador-info">
        Mostrando página {paginaActual} de {totalPaginas} ({totalRegistros} registros en total)
      </span>
      <div className="paginador-botones">
        <button
          className="boton boton--secundario"
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(paginaActual - 1)}
        >
          Anterior
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`boton-pagina ${num === paginaActual ? 'boton-pagina--activo' : ''}`}
            onClick={() => alCambiarPagina(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="boton boton--secundario"
          disabled={paginaActual === totalPaginas}
          onClick={() => alCambiarPagina(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

---

### 3.7 Pie de Página Institucional (`src/componentes/PiePagina.jsx`)

```jsx
export default function PiePagina() {
  return (
    <footer className="footer-institucional">
      <div className="footer-contenido">
        <p className="footer-titulo">QUINDE CONTROL</p>
        <p className="footer-subtitulo">SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO</p>
        <p className="footer-urbanizacion">Urbanización El Condado</p>
      </div>
    </footer>
  );
}
```

---

## 4. Esquema Prisma v4.0

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

enum RelacionReportante {
  PROPIETARIO
  INQUILINO
  VISITA
  PERSONAL_INTERNO
}

enum EstadoCaso {
  ABIERTO
  EN_PROCESO
  POR_CONFIRMAR
  CERRADO
}

model Lote {
  id     Int     @id @default(autoincrement())
  nombre String  @unique // ej: LOTE 508.6
  etapa  String  // ETAPA 1, ETAPA 2, ETAPA 3
  estado Boolean @default(true)
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

model Calle {
  id               Int     @id @default(autoincrement())
  nombre           String  @unique
  estado           Boolean @default(true)
  casosPrimarios   Caso[]  @relation("CallePrimaria")
  casosSecundarios Caso[]  @relation("CalleSecundaria")
}

model Area {
  id     Int     @id @default(autoincrement())
  nombre String  @unique
  estado Boolean @default(true)
  casos  Caso[]
}

model Categoria {
  id     Int     @id @default(autoincrement())
  nombre String  @unique
  estado Boolean @default(true)
  casos  Caso[]
}

model Caso {
  id                  Int                @id @default(autoincrement())
  codigo              String             @unique
  fechaRecepcion      DateTime           @default(now())
  
  // Datos del Reportante
  reportanteNombre    String
  reportanteContacto  String?
  reportanteLote      String             // Relación con catálogo de Lotes
  relacionReportante  RelacionReportante

  // Ubicación de la Novedad
  etapa               String             // ETAPA 1, ETAPA 2, ETAPA 3
  callePrimariaId     Int
  callePrimaria       Calle              @relation("CallePrimaria", fields: [callePrimariaId], references: [id])
  calleSecundariaId   Int?
  calleSecundaria     Calle?             @relation("CalleSecundaria", fields: [calleSecundariaId], references: [id])
  referenciaUbicacion String?
  
  descripcion         String
  prioridad           String
  estado              EstadoCaso         @default(ABIERTO)

  // Adjuntos (Opcionales)
  fotoInicial         String?
  fotoFinal           String?
  pdfInicial          String?

  // Relaciones
  usuarioId           Int
  usuario             Usuario            @relation("CreadorCaso", fields: [usuarioId], references: [id])
  categoriaId         Int
  categoria           Categoria          @relation(fields: [categoriaId], references: [id])
  areaId              Int
  area                Area               @relation(fields: [areaId], references: [id])
}
```