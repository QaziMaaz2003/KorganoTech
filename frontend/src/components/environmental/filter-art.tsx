type FilterArtProps = {
  kind: "hvac" | "pathogen" | "environmental";
};

/** Product illustrations drawn in SVG rather than product photography. */
export function FilterArt({ kind }: FilterArtProps) {
  if (kind === "hvac") {
    return (
      <svg viewBox="0 0 220 200" className="h-full w-auto" aria-hidden>
        <rect x="46" y="18" width="128" height="166" rx="6" fill="#0f3b44" />
        <rect x="56" y="30" width="108" height="142" fill="#f4f7f6" />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${58 + i * 10.6} 30 L${63.3 + i * 10.6} 172`}
            stroke="#b9c7c4"
            strokeWidth="1.4"
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${63.3 + i * 10.6} 30 L${58 + i * 10.6} 172`} stroke="#dbe4e2" strokeWidth="1.2" />
        ))}
        <rect x="66" y="112" width="88" height="40" rx="6" fill="#0f3b44" />
        <text x="110" y="129" textAnchor="middle" fontSize="9" fill="#7ed3a0" fontWeight="600" letterSpacing="1">
          KORGANOTECH
        </text>
        <text x="110" y="145" textAnchor="middle" fontSize="12" fill="white" fontWeight="700">
          MERV 13
        </text>
        <circle cx="72" cy="46" r="7" fill="#d9651b" />
        <circle cx="90" cy="46" r="7" fill="#d9651b" opacity="0.7" />
        {/* air particles */}
        <g className="transition-transform duration-700 group-hover:translate-x-6">
          {[40, 80, 120, 160].map((y, i) => (
            <circle key={y} cx={20 + (i % 2) * 8} cy={y} r="3" fill="#56696c" opacity="0.45" />
          ))}
        </g>
        <g className="opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          {[55, 100, 145].map((y) => (
            <path key={y} d={`M180 ${y} h24`} stroke="#7ed3a0" strokeWidth="3" strokeLinecap="round" />
          ))}
        </g>
      </svg>
    );
  }

  if (kind === "pathogen") {
    return (
      <svg viewBox="0 0 220 200" className="h-full w-auto" aria-hidden>
        {[0, 1, 2].map((i) => (
          <g
            key={i}
            className="transition-transform duration-500"
            style={{ transform: `translate(${i * 22}px, ${i * 10}px)` }}
          >
            <rect x="30" y="18" width="118" height="150" rx="5" fill="#c9965f" stroke="#a87945" strokeWidth="2" />
            <rect x="40" y="28" width="98" height="130" fill="#e7c9a2" />
            {Array.from({ length: 9 }, (_, k) => (
              <path key={k} d={`M${44 + k * 11} 28 L${49 + k * 11} 158`} stroke="#c9a47a" strokeWidth="1.5" />
            ))}
          </g>
        ))}
        {/* shield */}
        <g transform="translate(118 96)">
          <path
            d="M0 0 L34 10 V38 C34 58 18 70 0 76 C-18 70 -34 58 -34 38 V10 Z"
            fill="#0f3b44"
            stroke="white"
            strokeWidth="3"
            transform="translate(0 0)"
          />
          <g transform="translate(0 38)">
            <circle r="11" fill="#d9651b" />
            {Array.from({ length: 8 }, (_, k) => (
              <line
                key={k}
                x1="0"
                y1="-11"
                x2="0"
                y2="-17"
                stroke="#d9651b"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${k * 45})`}
              />
            ))}
            <line x1="-18" y1="18" x2="18" y2="-18" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 200" className="h-full w-auto" aria-hidden>
      <rect x="30" y="14" width="160" height="172" rx="8" fill="#efe6cf" stroke="#d8caa5" strokeWidth="2" />
      <rect x="44" y="28" width="132" height="144" rx="3" fill="#f8f6ef" />
      {/* fibrous media */}
      {Array.from({ length: 28 }, (_, i) => (
        <path
          key={i}
          d={`M${48 + ((i * 37) % 124)} ${32 + ((i * 53) % 132)} q 6 -4 12 0 t 12 0`}
          stroke="#c9d6d3"
          strokeWidth="1.4"
          fill="none"
        />
      ))}
      {/* grid */}
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <rect x={44 + k * 33 - 3} y="28" width="6" height="144" fill="#efe6cf" />
          <rect x="44" y={28 + k * 36 - 3} width="132" height="6" fill="#efe6cf" />
        </g>
      ))}
      <circle cx="110" cy="100" r="10" fill="#15262a" />
      <circle cx="110" cy="100" r="4" fill="#56696c" />
      {/* captured CO₂ */}
      <g className="transition-transform duration-700 group-hover:-translate-y-2">
        {[
          [70, 60],
          [150, 78],
          [80, 140],
          [142, 150],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="11" fill="#1f64c8" />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">
              CO₂
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
