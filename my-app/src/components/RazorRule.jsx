const RazorRule = ({ className = 'w-44' }) => (
  <svg
    viewBox="0 0 200 16"
    fill="none"
    aria-hidden="true"
    className={`text-amber ${className}`}
  >
    <path
      d="M30 8 H200"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.5"
    />
    <path
      d="M16 3 H152 L158 6 L152 9 H16 C9 9 7 7 7 6 C7 5 9 3 16 3 Z"
      fill="currentColor"
    />
    <circle cx="13" cy="6" r="1.4" fill="var(--color-ink)" />
    <circle cx="13" cy="6" r="2.2" fill="none" stroke="currentColor" />
  </svg>
);

export default RazorRule;