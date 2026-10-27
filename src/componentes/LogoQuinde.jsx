export default function LogoQuinde({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Quinde (Colibrí)"
    >
      <defs>
        {/* Gradiente Esmeralda Brillante */}
        <linearGradient id="gradQuindeCuerpo" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Gradiente Alas */}
        <linearGradient id="gradQuindeAla" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Gradiente Cola */}
        <linearGradient id="gradQuindeCola" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>

      {/* Pico largo y estilizado del Quinde */}
      <path
        d="M58 35 L96 28 C97 27.8 96.5 28.6 94 29.5 L59 38 Z"
        fill="#facc15"
      />

      {/* Cabeza del Quinde */}
      <ellipse cx="53" cy="37" rx="8" ry="7" fill="url(#gradQuindeCuerpo)" />
      {/* Ojo */}
      <circle cx="56" cy="36" r="1.8" fill="#ffffff" />
      <circle cx="56.5" cy="35.8" r="0.9" fill="#0f172a" />

      {/* Ala trasera */}
      <path
        d="M48 39 C46 22 36 6 22 2 C26 12 36 26 42 37 Z"
        fill="url(#gradQuindeAla)"
        opacity="0.85"
      />

      {/* Ala frontal extendida en vuelo ágil */}
      <path
        d="M47 43 C42 24 28 6 12 3 C16 16 30 33 39 45 Z"
        fill="url(#gradQuindeAla)"
      />
      {/* Plumas secundarias del ala */}
      <path
        d="M40 45 C35 32 24 18 16 12 C21 24 32 37 36 47 Z"
        fill="#34d399"
        opacity="0.6"
      />

      {/* Cuerpo grácil del colibrí */}
      <path
        d="M53 42 C51 52 44 62 36 68 C38 60 42 50 46 43 Z"
        fill="url(#gradQuindeCuerpo)"
      />
      <path
        d="M55 38 C56 46 51 56 41 64 C38 60 45 48 50 41 Z"
        fill="#10b981"
      />

      {/* Pechuga brillante */}
      <ellipse cx="48" cy="46" rx="5" ry="7" fill="#86efac" opacity="0.4" />

      {/* Cola bífida / timoneras largas del Quinde andino */}
      <path
        d="M36 67 C30 78 20 88 6 97 C18 90 28 80 34 70 Z"
        fill="url(#gradQuindeCola)"
      />
      <path
        d="M37 68 C33 79 26 90 14 98 C24 90 32 81 35 71 Z"
        fill="#facc15"
        opacity="0.9"
      />
      <path
        d="M38 67 C36 78 32 89 24 97 C30 89 36 79 36 70 Z"
        fill="url(#gradQuindeCola)"
      />
    </svg>
  );
}
