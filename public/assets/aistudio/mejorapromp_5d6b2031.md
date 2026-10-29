ROL Y NIVEL DE CÓDIGO
Actúa como desarrollador senior front-end, pero escribe código que un programador junior pueda leer y mantener:
- Nombres de clases y variables claros y en español.
- Archivos CSS organizados por secciones con comentarios cortos del tipo /* ===== BOTONES ===== */.
- Sin trucos complicados ni selectores profundos o frágiles. Una clase = una responsabilidad.
- Comentarios breves que expliquen el POR QUÉ de lo que no sea obvio.

ESTILOS: SOLO CSS3
- Todo con archivos .css propios y CSS3 puro: variables CSS, Flexbox, Grid, media queries, transiciones, @keyframes, gradientes, sombras, clamp(), aspect-ratio, :focus-visible, :has() solo si es opcional.
- PROHIBIDO Tailwind, Bootstrap, Material UI, styled-components, Sass u otro framework de estilos. No agregues librerías nuevas.
- Las librerías de iconos ya instaladas (lucide-react, react-icons) y motion pueden seguir como están. Prefiere animaciones con CSS.
- Convención de clases: .componente, .componente__elemento, .componente--variante (por ejemplo .tarjeta, .tarjeta__titulo, .boton--primario).
- Evita estilos en línea salvo valores dinámicos.

REGLAS DE ENTREGA
- NO cambies la lógica, los permisos por rol ni los datos. Solo estilos y el marcado (JSX) mínimo necesario para aplicarlos.
- Toda la interfaz sigue en español.
- Entrega la lista de archivos creados o modificados y cada archivo COMPLETO, sin "..." ni "resto igual".
- Termina con pasos cortos para probar a mano, incluyendo celular (360 px) y escritorio (1280 px).


Trabajas sobre el proyecto adjunto (React + Vite, estilos en src/estilos). Objetivo: crear la base visual moderna, arreglar el menú que se va con el scroll y renovar el login.

0) QUITAR TAILWIND
- Elimina "@import 'tailwindcss'" de src/index.css, el plugin tailwindcss() de vite.config.ts y los paquetes tailwindcss, @tailwindcss/vite y autoprefixer del package.json (no se usan clases de Tailwind en el JSX).
- Como Tailwind traía un reinicio de estilos, crea src/estilos/reset.css con un reset moderno propio: box-sizing: border-box en todo, márgenes en 0, img/svg/video con max-width: 100%, button/input/select/textarea con font: inherit, listas sin viñetas cuando corresponda, y html con -webkit-text-size-adjust: 100%.
- Quita también motion y react-icons del package.json si no se usan.

1) ORGANIZACIÓN DE CSS
Crea esta estructura y ordénala en src/index.css con @import, en este orden:
estilos/variables.css → reset.css → base.css → layout.css → componentes/*.css → paginas/*.css → animaciones.css
Mantén el contenido útil de global.css, repartido en esos archivos.

2) SISTEMA DE DISEÑO (variables.css)
Define variables para:
- Colores de marca: verde esmeralda oscuro, verde medio, verde claro, dorado (acento #facc15), y neutros (fondo, superficie, bordes, textos principal/secundario/tenue).
- Colores semánticos: éxito, advertencia, peligro e información, cada uno con tono fuerte y tono suave de fondo.
- Colores de estado de caso (en proceso, por confirmar, cerrado) y de prioridad (urgente, alta, media, baja).
- Escala de espacios (4, 8, 12, 16, 24, 32, 48), radios (6, 10, 16, 999), sombras (sm, md, lg y una de foco), tipografía con clamp() (fuente del sistema: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; sin fuentes externas), duraciones (150, 250, 400 ms) y curvas de easing.
- Anchos del menú (260 px) y alto de cabecera (64 px).

3) TIPOGRAFÍA Y LEGIBILIDAD
- Quita el MAYÚSCULAS global. Usa mayúsculas SOLO en etiquetas pequeñas, badges y botones cortos, con letter-spacing.
- Jerarquía clara: títulos de página, de sección, texto normal, texto de ayuda y etiquetas. Interlineado cómodo. Máximo ancho de lectura en párrafos.
- Contraste mínimo AA.

4) LAYOUT CON MENÚ FIJO (el problema principal)
- Estructura: .aplicacion con CSS Grid de dos columnas (menú | contenido), height: 100dvh y overflow: hidden. Solo .contenido-principal hace scroll (overflow-y: auto).
- El menú lateral NUNCA se mueve con el scroll de la página: ocupa el alto completo. Si tiene muchos enlaces, el scroll es interno solo en la lista de enlaces.
- Abajo, siempre visible: tarjeta de usuario con nombre, rol y botón "Salir".
- La cabecera superior es sticky dentro del contenido, con el nombre de la urbanización centrado, fondo con ligero desenfoque (backdrop-filter) y sombra al hacer scroll.
- Menú: logo arriba, enlaces con icono, estado activo con barra y fondo suave, hover animado, secciones separadas, y los enlaces solo para quien tenga permiso (no cambies permisos).
- Móvil (≤ 768 px): el menú se convierte en panel deslizante (transform: translateX) con fondo oscuro translúcido; botón hamburguesa en la cabecera, cierre al tocar fuera o al navegar, y bloqueo del scroll del fondo mientras está abierto. "Salir" visible dentro del panel y también como icono en la cabecera. Área táctil mínima de 44 px.
- Usa env(safe-area-inset-*) y 100dvh. La página nunca tiene scroll horizontal.

5) LOGIN ATRACTIVO
- Fondo con degradado verde oscuro y formas decorativas suaves animadas con CSS (movimiento lento y sutil).
- Tarjeta centrada con efecto de cristal suave, sombra y animación de entrada (fade + subida).
- Logo CASOOK arriba, y debajo estas dos líneas sin cambios:
  Cada caso bajo control.
  SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO
- Campos con icono, foco con anillo dorado, botón principal con degradado, hover y estado de carga con spinner CSS. Mensajes de error con animación corta (shake).
- Responsive desde 320 px.

CRITERIOS DE ACEPTACIÓN
- Sin Tailwind y la app compila.
- Al bajar en cualquier pantalla, el menú NO se mueve y la cabecera queda arriba.
- En el celular el menú se abre y cierra, y "Salir" siempre está a la vista.
- El login se ve moderno y es usable en 360 px.

Sobre el mismo proyecto, ya con el Prompt A aplicado, mejora todos los componentes y las pantallas. Crea los archivos en src/estilos/componentes/ y src/estilos/paginas/.

1) BOTONES (botones.css)
- Variantes: primario (degradado verde), secundario (borde), peligro, fantasma y de icono. Tamaños: pequeño, normal y grande. Altura mínima táctil de 44 px.
- Estados: hover con elevación, :active con ligero escalado hacia abajo, :focus-visible con anillo, :disabled atenuado y .boton--cargando con spinner CSS.
- Grupos de botones que se acomodan en móvil.

2) FORMULARIOS (formularios.css) — el punto más débil hoy
- Estructura vertical para cada campo: etiqueta arriba (pequeña, en negrita, color secundario), control, texto de ayuda y mensaje de error. Nunca la etiqueta pegada al lado del control.
- Input, select y textarea con alto uniforme, borde suave, radio, fondo claro, transición de color y anillo de foco dorado/verde. El textarea con min-height cómodo (120 px) y resize vertical.
- Estado de error (borde y mensaje en rojo) y estado válido.
- Campo de archivo estilizado: oculta visualmente el input nativo (de forma accesible) y muestra una zona de carga con icono, texto "Seleccionar o arrastrar archivo", el nombre del archivo elegido y una vista previa en miniatura si es imagen. Usa el <label> asociado al input.
- Checkbox y radio personalizados con CSS (appearance: none).
- Formularios en una columna en móvil y en dos o tres columnas en escritorio con Grid.

3) TARJETAS, BADGES Y KPI (tarjetas.css, badges.css)
- Tarjetas con sombra suave, borde fino, radio generoso y elevación al pasar el cursor. Cabecera de tarjeta con título e iconos.
- Badges de estado y de prioridad con los colores semánticos (fondo suave + texto fuerte + punto de color).
- Tarjetas KPI del Inicio con icono, número grande y etiqueta; la barra de progreso de etapas crece animada al cargar.

4) TABLAS Y LISTAS (tablas.css)
- Cabecera fija dentro del contenedor, filas con hover, líneas finas y espaciado cómodo. Texto largo con truncado controlado.
- En móvil (≤ 768 px) cada fila se convierte en una tarjeta apilada con la etiqueta de cada dato (usa data-label y ::before).
- Paginación con botones redondeados y estado activo.

5) PANTALLA DE DETALLE DEL CASO
- Cabecera con código del caso, badges de estado y prioridad, y los botones de acción (WhatsApp, imprimir PDF si existe) alineados y que se acomodan en móvil.
- Datos en una cuadrícula de dos columnas: cada dato con etiqueta pequeña en mayúsculas arriba y el valor en texto normal más grande debajo. Los botones de teléfono y WhatsApp como botones tipo pastilla.
- Evidencias: galería en Grid con miniaturas del mismo tamaño (aspect-ratio), zoom suave al pasar el cursor y, si la imagen no carga (onError), un recuadro de reemplazo con icono y el texto "Sin imagen" en lugar del texto roto.
- Bloques de acción ("Marcar como atendido", "Agregar nota"): tarjeta con acento de color, campos con la estructura del punto 2 y botón principal al final.
- Historial de seguimiento como línea de tiempo vertical (línea y puntos con CSS), con fecha y hora, autor y nota en tarjetas pequeñas.

6) MODALES, TOASTS Y VISOR DE FOTO
- Modal con fondo oscuro desenfocado, entrada con fade + escala y cierre con Escape y clic fuera. Visor de foto con fondo oscuro y controles claros.
- Toasts en la esquina (arriba a la derecha en escritorio, abajo en móvil): entran deslizando, tienen icono y barra de progreso de cierre, y salen con animación. Colores semánticos.

7) ANIMACIONES (animaciones.css)
- Entrada de página: fade + subida de 8 px en 300 ms.
- Listas y tarjetas con entrada escalonada usando la variable --i como animation-delay (por ejemplo calc(var(--i) * 40ms)).
- Skeleton con brillo (shimmer) para estados de carga y estados vacíos con icono y mensaje amable.
- Animar solo transform y opacity. Duraciones entre 150 y 400 ms.
- Respeta prefers-reduced-motion: reduce (desactiva o reduce las animaciones).

8) PANTALLAS RESTANTES
Aplica todo lo anterior a Inicio, Casos (filtros en una barra compacta o plegable), Nuevo caso (formulario por secciones), Reportes, Usuarios, Catálogos, Configuración y Mi Perfil, de forma consistente.

CRITERIOS DE ACEPTACIÓN
- Todos los campos de formulario se ven iguales y ordenados, con etiqueta arriba.
- El botón de archivo ya no es el del navegador.
- Una foto que no carga muestra un recuadro de reemplazo.
- Las tablas se ven bien en el celular como tarjetas.
- Hay animaciones suaves y se pueden desactivar con prefers-reduced-motion.
- No se usa ninguna librería de estilos y no cambió la lógica de la app.