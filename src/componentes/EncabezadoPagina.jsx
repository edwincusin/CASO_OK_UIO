// Título de cada pantalla, con un espacio opcional para un botón a la derecha
export default function EncabezadoPagina({ titulo, children }) {
  return (
    <div className="encabezado-pagina">
      <h1>{titulo}</h1>
      {children}
    </div>
  );
}
