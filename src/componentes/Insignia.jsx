// Un puntito de color con un texto. Sirve para estados y prioridades.
export default function Insignia({ texto, color }) {
  return (
    <span className="insignia">
      <span className="insignia__punto" style={{ background: color }} />
      {texto}
    </span>
  );
}
