/** Brand mark — a hydration droplet — plus the wordmark. */
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2c0 0-7.5 8.4-7.5 13.2A7.5 7.5 0 0 0 12 22a7.5 7.5 0 0 0 7.5-6.8C19.5 10.4 12 2 12 2Z"
        fill="#C97D60"
      />
      <path
        d="M9.2 13.5a2.8 2.8 0 0 0 2.4 3.7"
        fill="none"
        stroke="#FBF7F2"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-6 w-6" />
      <span className="font-display font-semibold text-xl tracking-tight">
        My<span className="text-clay">Skin</span>Sync
      </span>
    </span>
  );
}
