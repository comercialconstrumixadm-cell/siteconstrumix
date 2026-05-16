interface BrandLogoProps {
  size?: number;
  color?: string;
}

export default function BrandLogo({ size = 46, color = 'inherit' }: BrandLogoProps) {
  return (
    <div className="brand">
      <div className="brand-mark" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M4 14L16 5l12 9v13H4z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M11 27V18h4v9M19 27V21h4v6" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="brand-name" style={{ color }}>
        <span className="top">Comercial</span>
        <span className="big">Construmix</span>
      </div>
    </div>
  );
}
