/**
 * FarmX AI brand mark, drawn inline as SVG so it renders on ANY host
 * across preview and production hosts without depending on a file path.
 */
export function FarmAiLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="FarmX AI"
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <circle cx="32" cy="32" r="31" fill="currentColor" opacity="0.1" />
      <circle
        cx="32"
        cy="32"
        r="30.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* stem */}
      <path d="M32 48V26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* leaves */}
      <path d="M32 32c-8 0-13-4-13-11 7 0 13 4 13 11Z" fill="currentColor" opacity="0.85" />
      <path d="M32 28c0-8 5-13 13-13 0 7-5 13-13 13Z" fill="currentColor" />
      {/* circuit nodes */}
      <path
        d="M32 38h9M32 43h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="43" cy="38" r="2.6" fill="currentColor" />
      <circle cx="22" cy="43" r="2.6" fill="currentColor" />
      <circle cx="32" cy="22" r="2.6" fill="currentColor" />
    </svg>
  );
}
