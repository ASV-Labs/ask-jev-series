export function ButlerMark({ className, title = "The butler" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <path d="M10 64c0-9 5.5-14.5 13-16.5l9 6 9-6c7.5 2 13 7.5 13 16.5z" fill="var(--butler-coat, #2b3242)" />
      <path d="M23 47.5 32 53.5l9-6 3 1.4-12 13-12-13z" fill="var(--butler-shirt, #fdfdfd)" />
      <path d="M26.5 46.2 32 53l-5 3.6-3.6-8z" fill="var(--butler-shirt, #fdfdfd)" />
      <path d="M37.5 46.2 32 53l5 3.6 3.6-8z" fill="var(--butler-shirt, #fdfdfd)" />
      <path
        d="M32 52.4c-1.9-2.4-4.6-3.6-6.4-3.2-.5 2 .1 4.7 1.4 6.6 1.9.5 3.9-.9 5-1.8z"
        fill="var(--butler-tie, #b0202f)"
      />
      <path
        d="M32 52.4c1.9-2.4 4.6-3.6 6.4-3.2.5 2-.1 4.7-1.4 6.6-1.9.5-3.9-.9-5-1.8z"
        fill="var(--butler-tie, #b0202f)"
      />
      <circle cx="32" cy="53.2" r="1.5" fill="var(--butler-tie-knot, #8c1826)" />
      <path d="M27.5 38h9v9.5l-4.5 3-4.5-3z" fill="var(--butler-skin-shade, #e0ad86)" />
      <ellipse cx="18.6" cy="27" rx="2.6" ry="3.4" fill="var(--butler-skin, #f0c39b)" />
      <ellipse cx="45.4" cy="27" rx="2.6" ry="3.4" fill="var(--butler-skin, #f0c39b)" />
      <path
        d="M32 9c8.2 0 13.4 5.4 13.4 13.6 0 9.4-5.6 18.2-13.4 18.2S18.6 32 18.6 22.6C18.6 14.4 23.8 9 32 9z"
        fill="var(--butler-skin, #f0c39b)"
      />
      <path
        d="M32 8c8.6 0 13.8 5.2 13.8 12.8 0 1.6-.2 2.8-.6 3.9-.5-3.3-1.5-5.6-3.2-7.2-4.2 2.4-13.6 3.1-19.3.6-1.7 1.4-3 3.6-3.6 6.6-.5-1.2-.9-2.5-.9-4C18.2 13.2 23.4 8 32 8z"
        fill="var(--butler-hair, #33291f)"
      />
      <path d="M23.6 22.4c1.8-1.1 4-1.1 5.6-.1" stroke="var(--butler-hair, #33291f)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M34.8 22.3c1.6-1 3.8-1 5.6.1" stroke="var(--butler-hair, #33291f)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="37.6" cy="26.2" r="4.6" fill="var(--butler-glass, #cfe4f2)" fillOpacity="0.32" />
      <circle cx="26.4" cy="26.2" r="1.5" fill="#26201a" />
      <circle cx="37.6" cy="26.2" r="1.6" fill="#26201a" />
      <circle cx="37.6" cy="26.2" r="4.6" fill="none" stroke="var(--butler-brass, #caa14a)" strokeWidth="1.3" />
      <path d="M41.8 28.4c1.4 2.2 1.9 4.4 1.7 6.6" stroke="var(--butler-brass, #caa14a)" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M31.4 27.4c-.5 1.6-.4 2.6.9 3" stroke="var(--butler-skin-shade, #dba87f)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path
        d="M32 33.6c-1.6-1.9-4.4-2.8-6.6-2-2.2.8-2.9 2.6-2.2 3.4.8.9 2.2.2 3.3-.3 1.7-.8 3.7-.6 5.5.7 1.8-1.3 3.8-1.5 5.5-.7 1.1.5 2.5 1.2 3.3.3.7-.8 0-2.6-2.2-3.4-2.2-.8-5 .1-6.6 2z"
        fill="var(--butler-hair, #33291f)"
      />
      <path d="M29.4 37.2c1.6 1.1 3.6 1.1 5.2 0" stroke="#9a5f4c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
