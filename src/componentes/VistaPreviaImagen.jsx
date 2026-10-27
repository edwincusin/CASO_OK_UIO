import { useState, useMemo } from 'react';
import { Eye, X, Image as ImageIcon } from 'lucide-react';
import ModalVisorFoto from './ModalVisorFoto';

export default function VistaPreviaImagen({ archivo, urlExistente, alEliminar, titulo = 'FOTO' }) {
  const [visorAbierto, setVisorAbierto] = useState(false);

  // Determinar la fuente de la imagen (Blob local o URL/nombre existente)
  const urlImagen = useMemo(() => {
    if (archivo instanceof Blob || archivo instanceof File) {
      return URL.createObjectURL(archivo);
    }
    return urlExistente || null;
  }, [archivo, urlExistente]);

  if (!urlImagen) {
    return (
      <div className="panel-miniatura panel-miniatura--vacio">
        <ImageIcon size={22} className="texto-tenue" />
        <span style={{ fontSize: '0.72rem' }}>SIN {titulo.toUpperCase()}</span>
      </div>
    );
  }

  const esArchivoReal =
    urlImagen.startsWith('blob:') ||
    urlImagen.startsWith('data:') ||
    urlImagen.startsWith('http') ||
    urlImagen.startsWith('/');

  return (
    <>
      <div className="panel-miniatura">
        {esArchivoReal ? (
          <img
            src={urlImagen}
            alt={titulo}
            className="panel-miniatura__img"
            onClick={() => setVisorAbierto(true)}
            title="Clic para ampliar imagen"
          />
        ) : (
          <div
            className="panel-miniatura__img panel-miniatura__placeholder"
            onClick={() => setVisorAbierto(true)}
            title="Clic para ver detalle de la foto"
          >
            <ImageIcon size={20} />
            <span style={{ fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>
              {urlImagen}
            </span>
          </div>
        )}

        <div className="panel-miniatura__acciones">
          <button
            type="button"
            className="boton-icono"
            onClick={() => setVisorAbierto(true)}
            title="Ver imagen en tamaño completo"
          >
            <Eye size={13} />
          </button>
          {alEliminar && (
            <button
              type="button"
              className="boton-icono boton-icono--alerta"
              onClick={alEliminar}
              title="Quitar foto"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {visorAbierto && (
        <ModalVisorFoto
          url={urlImagen}
          titulo={titulo}
          alCerrar={() => setVisorAbierto(false)}
        />
      )}
    </>
  );
}
