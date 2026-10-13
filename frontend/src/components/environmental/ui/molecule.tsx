type MoleculeProps = {
  kind: "ch4" | "co2";
  className?: string;
};

/** Ball-and-stick molecule, drawn in code. */
export function Molecule({ kind, className }: MoleculeProps) {
  if (kind === "ch4") {
    const hydrogens = [
      [60, 16],
      [102, 72],
      [60, 104],
      [18, 72],
    ];
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden>
        {hydrogens.map(([x, y], i) => (
          <line
            key={i}
            x1="60"
            y1="62"
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
        {hydrogens.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="11" fill="white" stroke="currentColor" strokeWidth="2.5" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">
              H
            </text>
          </g>
        ))}
        <circle cx="60" cy="62" r="20" fill="currentColor" />
        <text x="60" y="68" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">
          C
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 70" className={className} aria-hidden>
      <line x1="30" y1="31" x2="130" y2="31" stroke="currentColor" strokeOpacity="0.35" strokeWidth="4" />
      <line x1="30" y1="39" x2="130" y2="39" stroke="currentColor" strokeOpacity="0.35" strokeWidth="4" />
      <circle cx="28" cy="35" r="20" fill="white" stroke="currentColor" strokeWidth="3" />
      <text x="28" y="41" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
        O
      </text>
      <circle cx="132" cy="35" r="20" fill="white" stroke="currentColor" strokeWidth="3" />
      <text x="132" y="41" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
        O
      </text>
      <circle cx="80" cy="35" r="17" fill="currentColor" />
      <text x="80" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill="white">
        C
      </text>
    </svg>
  );
}
