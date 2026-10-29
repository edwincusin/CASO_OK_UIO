ROL Y NIVEL DE CÓDIGO
Actúa como desarrollador senior de React, pero escribe código que un programador junior pueda leer y mantener:
- Nombres claros y en español para variables, funciones y componentes del dominio (por ejemplo: calcularDuracion, casosFiltrados, nombreUrbanizacion).
- Funciones pequeñas que hacen una sola cosa. Evita ternarios anidados, "one-liners" complicados y abstracciones innecesarias.
- Comentarios breves en español que expliquen el POR QUÉ de lo que no sea obvio, y un comentario corto al inicio de cada archivo nuevo que diga para qué sirve.
- Valida entradas y maneja errores con mensajes claros para el usuario.
- Mantén la estructura de carpetas actual (contextos, paginas, componentes, utilidades, datos, estilos) y reutiliza lo que ya existe antes de crear algo nuevo.
- No agregues librerías nuevas. Las ya instaladas (React, React Router, jsPDF, jspdf-autotable, lucide-react) pueden seguir usándose.

ESTILOS: SOLO CSS3
- Todos los estilos van en archivos .css propios, usando CSS3 puro: variables CSS (custom properties), Flexbox, Grid, media queries, transiciones, animaciones con @keyframes y gradientes.
- PROHIBIDO usar Tailwind, Bootstrap, Material UI, styled-components, Sass u otra librería o framework de estilos.
- Usa nombres de clase descriptivos en español con convención simple (por ejemplo: .tarjeta, .tarjeta__titulo, .boton--primario).
- Reutiliza las variables de src/estilos/variables.css y añade las nuevas ahí. Evita estilos en línea salvo que el valor sea dinámico.
- Diseño mobile-first.

REGLAS DE ENTREGA
- No cambies lo que no se pide. Conserva los permisos por rol y el estilo visual existente.
- Toda la interfaz en español.
- Al terminar, entrega: (1) la lista de archivos creados o modificados y (2) cada archivo COMPLETO, sin usar "..." ni "resto igual".
- Termina con una lista corta de pasos para probar los cambios a mano.

Fase 1 · Datos y flujo de casos

Trabajas sobre el proyecto adjunto (React + Vite; contextos en src/contextos, páginas en src/paginas, utilidades en src/utilidades, datos de demostración en src/datos). Haz SOLO los cambios descritos.

0) REVISIÓN DE ESTILOS
- Revisa si el proyecto usa clases de Tailwind en el JSX o tiene Tailwind en package.json, vite.config o postcss. Si se usa, convierte esas clases a clases CSS propias y elimina la dependencia. Si no se usa, elimina la dependencia y su configuración.

1) ESTADOS DEL CASO
- Elimina el estado "abierto". Un caso nuevo nace directamente en "en_proceso".
- Flujo: en_proceso → por_confirmar → cerrado. Quien hoy puede pasar a por_confirmar y confirmar el cierre conserva ese permiso.
- Mejora: Superusuario y Administración pueden "Devolver a proceso" un caso que esté en por_confirmar, con una nota obligatoria que explique el motivo.
- Migración: todo caso con estado "abierto" (incluidos los datos de demostración) pasa a "en_proceso". Actualiza etiquetas, colores, filtros, métricas del Inicio (casos activos = en_proceso + por_confirmar), reportes y toda lógica que mencione "abierto".

2) FECHA Y HORA
- Al crear un caso guarda fechaHoraApertura (formato ISO), usando la zona horaria America/Guayaquil. Muéstrala como dd/mm/aaaa HH:mm (24 horas).
- Al cerrar el caso guarda fechaHoraCierre automáticamente.
- En src/utilidades/fechas.js crea calcularDuracion(inicio, fin) y formatearDuracion(milisegundos), con salidas como "2 d 5 h 30 min", "5 h 20 min" o "35 min". Si el caso sigue sin cerrar, muestra "En curso: X" con el tiempo transcurrido hasta ahora.
- Historial de seguimiento: cada nota guarda fechaHora (ISO) y autor, y se muestra con fecha y hora, "tiempo desde la apertura" y "tiempo desde la nota anterior". Si una nota antigua no tiene hora, muestra solo la fecha.
- Muestra el tiempo de resolución en la pantalla de detalle del caso.

3) CATEGORÍAS (reemplaza todo el catálogo actual)
01 Mantenimiento e infraestructura — Vías, aceras, parques, luminarias y redes propias.
02 Seguridad y vigilancia — Incidentes, guardias, cámaras y control de accesos.
03 Administración y trámites — Oficios, documentos, quejas y gestiones institucionales.
04 Limpieza y residuos — Basura, escombros, sumideros y saneamiento.
05 Mascotas y control de plagas — Tenencia responsable, animales extraviados y plagas.
06 Vialidad y señalización — Tránsito, señalización y evaluación de reductores.
07 Servicios básicos y redes — Agua, alcantarillado, riego y otras instalaciones.
08 Áreas comunales y convivencia — Canchas, parques, ruido y uso de instalaciones.
09 Obras y proyectos — Nuevas obras, mejoras y solicitudes de inversión.
10 Otros requerimientos — Casos que no encajen en las categorías anteriores.
- Muéstralas como "01 · Mantenimiento e infraestructura", con la descripción como texto de ayuda en el selector.
- Migra los casos existentes: alumbrado→01, fuga de agua→07, vías y señalización→06, áreas verdes y riego→07, limpieza y basura→04, mascotas→05, plagas→05, seguridad y convivencia→02.
- Revisa cómo el código relaciona categoría con área responsable y conserva esa lógica. Valor inicial sugerido: 01, 04, 06 y 07 → Mantenimiento; 02 → Seguridad; 03, 05, 08, 09 y 10 → Administración. El Superusuario puede cambiarlo en Catálogos.

4) ETAPAS, LOTES Y CALLES
- La etapa pasa a ser un catálogo independiente. Los lotes ya NO están asociados a una etapa: elimina ese campo del modelo de lote y del autocompletado. En el formulario de nuevo caso, etapa, calle y lote son tres selectores separados.
- Lotes: el desplegable muestra SOLO el código. Nomenclatura NUMERO.SUBLOTE; ejemplos válidos: 12.3, 520.0, 189.CASA1, 185.SUITE2. Validación con la expresión /^\d+\.[A-Z0-9]+$/ (convierte a mayúsculas antes de validar). Orden natural: por número y luego por sublote. Reemplaza lotesEcuador.js por unos 40 lotes de ejemplo con esa nomenclatura. En Catálogos agrega "Agregar varios (uno por línea)" que valide e informe los errores y los duplicados.
- Calles: catálogo inicial con las letras A a la Z, más los ejemplos PASAJE 1, PASAJE 3 y AV. COCO. El Superusuario puede agregar más. Validación: mayúsculas, letras, números, puntos y espacios.
- Catálogos conserva el borrado lógico y la paginación.

CRITERIOS DE ACEPTACIÓN
- La app compila sin errores y no queda ninguna referencia a "abierto".
- Un caso nuevo aparece "en proceso" con fecha y hora de apertura.
- Al cerrarlo se calcula el tiempo de resolución.
- Las 10 categorías aparecen en formularios, filtros y reportes.
- Los lotes se ven como "189.CASA1".


Fase 2 · Marca, urbanización y responsive

Sobre el mismo proyecto, ya con la Fase 1, haz lo siguiente.

1) MARCA CASOOK (solo CSS3)
- Crea src/componentes/LogoCasoOK.jsx con la prop size = 'sm' | 'md' | 'lg', y sus estilos en src/estilos/logo.css.
- Diseño: "CASO" en blanco o verde claro y "OK" dentro de una pastilla redondeada ámbar (#facc15) con degradado, un pequeño check hecho con CSS (o un SVG en línea muy simple), peso 900, espaciado entre letras y sombra suave. Usa la paleta actual (verde esmeralda oscuro y acento dorado). Debe verse como un logo y no como texto plano.
- Reemplaza LogoQuinde y todos los textos "Quinde Control" por CASOOK en el login, el menú o navbar, el pie de página, los subtítulos de las páginas, los toasts, index.html y metadata.json.
- En el login mantén exactamente estas dos líneas, sin el nombre de la urbanización en ellas:
  Cada caso bajo control.
  SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO

2) NOMBRE DE LA URBANIZACIÓN CONFIGURABLE
- Crea src/contextos/ContextoConfiguracion.jsx con nombreUrbanizacion. Persiste en localStorage dentro de try/catch (solución temporal hasta tener backend). Valor inicial: "Nombre de la Urbanización".
- Nueva página /configuracion, visible y accesible SOLO para Superusuario (actualiza permisos.js, la ruta protegida y el menú). Campo "Nombre de la urbanización" (obligatorio, de 3 a 60 caracteres), vista previa en vivo y botón guardar con toast de confirmación.
- Muestra el nombre de forma atractiva y centrada en la cabecera de todas las pantallas autenticadas: tipografía grande en mayúsculas con espaciado, degradado dorado y líneas decorativas a los lados, todo con CSS3. Debe verse bien en celular. En el login muéstralo también, encima del formulario.
- Reemplaza todos los textos fijos "El Quinde" y "El Condado" por este valor: Inicio, ModalVisorFoto, texto.js (mensaje de WhatsApp), PiePagina y generadorPdf.

3) RESPONSIVE (solo CSS3)
- Bug actual: en el navegador del celular desaparece el botón de Cerrar sesión. Revisa Navegacion.jsx y estilos/global.css.
- Solución: en pantallas de 768 px o menos, menú tipo hamburguesa con un panel lateral que incluya todos los enlaces y, al final y siempre visible, el botón "Cerrar sesión". Además, un icono de salir visible en la cabecera móvil.
- Usa 100dvh y env(safe-area-inset-*) para que las barras del navegador móvil no tapen el contenido. Botones y áreas táctiles de mínimo 44 px. Formularios en una sola columna. Tablas con scroll horizontal contenido o vista de tarjetas. La página nunca debe tener scroll horizontal.
- Revisa los anchos de 360, 390, 768 y 1024 px.

CRITERIOS DE ACEPTACIÓN
- El logo CASOOK se ve en el login y en el menú.
- El Superusuario cambia el nombre de la urbanización y se refleja en la cabecera, el pie y el mensaje de WhatsApp.
- En un celular de 360 px siempre se ve el botón de cerrar sesión y no hay scroll horizontal.


Fase 3 · Reportes en PDF

Sobre el mismo proyecto, mejora los reportes en PDF con jsPDF y autoTable (no agregues librerías nuevas).

1) REPORTE GENERAL (utilidades/generadorPdf.js)
- Encabezado con CASOOK y el nombre de la urbanización tomado del ContextoConfiguracion.
- Agrega las columnas: Apertura (fecha y hora), Cierre (fecha y hora, o "—" si no está cerrado) y Tiempo de resolución (o "En curso: X"). Usa orientación horizontal si hace falta para que quepan.
- Usa las 10 categorías nuevas con su código. Quita cualquier referencia al estado "abierto".
- Al final, un resumen: total de casos, cerrados, en proceso, por confirmar y tiempo promedio de resolución de los casos cerrados.
- Nombre del archivo: CasoOK_Reporte_<fecha>.pdf.

2) PDF DE UN SOLO CASO
- En la pantalla de detalle del caso (CasoDetalle.jsx), junto al botón "Copiar para WhatsApp", agrega un botón "Imprimir PDF" con el mismo estilo y que no rompa el diseño en móvil.
- Crea exportarCasoAPDF(caso), que imprime el caso tal como está en ese momento, en A4 vertical y bien organizado:
  a) Encabezado: CASOOK, nombre de la urbanización, título "REPORTE DE CASO", código, y fecha y hora de generación con el usuario que lo genera.
  b) Datos del caso: estado, prioridad, categoría, área responsable, etapa, calle, lote y creador.
  c) Tiempos: apertura, cierre y tiempo de resolución (o "En curso: X").
  d) Descripción.
  e) Fotos en miniatura, con salto de página controlado. Si una imagen no carga, continúa sin romper el PDF.
  f) Historial en tabla: fecha y hora, autor, nota y tiempo desde la apertura.
  g) Pie con numeración de páginas.
- Nombre del archivo: CasoOK_<codigo>_<fecha>.pdf.

CRITERIOS DE ACEPTACIÓN
- El PDF general muestra apertura, cierre y tiempo de resolución de cada caso.
- El botón "Imprimir PDF" genera el reporte de ese caso con su historial y sus fotos.
- El nombre de la urbanización aparece en ambos reportes.