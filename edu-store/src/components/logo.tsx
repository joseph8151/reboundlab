export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#B8365E" />
      <path d="M9 9.5h9.5a4.5 4.5 0 0 1 0 9H9z" fill="#fff" opacity=".95" />
      <path d="M9 18.5h11a4.5 4.5 0 0 1 0 9H9z" fill="#E3B94F" />
      <path d="m12.5 14 1.6 1.6 3.2-3.2" stroke="#B8365E" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
