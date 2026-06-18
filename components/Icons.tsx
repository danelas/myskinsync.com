// Small inline SVG icon set — replaces emojis for a more premium, consistent look.
// UI icons use currentColor (stroke). Product-type icons are simple bottle
// silhouettes used in the placeholder thumbnail.

type P = { className?: string };
const base = (className = "h-6 w-6") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function SunIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function SparkleIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9 12 3Z" />
      <path d="M19 14l.7 1.9 1.9.7-1.9.7L19 19.2 18.3 17.3 16.4 16.6 18.3 15.9 19 14Z" />
    </svg>
  );
}

export function ClipboardIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4a3 3 0 0 1 6 0M9 11l1.5 1.5L13 10M9 16h5" />
    </svg>
  );
}

export function RoutineIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1.3" />
      <circle cx="4" cy="12" r="1.3" />
      <circle cx="4" cy="18" r="1.3" />
    </svg>
  );
}

export function BagIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function MailIcon({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

// ---- Product-type silhouettes (for the placeholder thumbnail) ----
function Dropper({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M9 9h6v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V9Z" />
      <path d="M10 9V5h4v4M12 2v3" />
    </svg>
  );
}
function Jar({ className }: P) {
  return (
    <svg {...base(className)}>
      <rect x="6" y="9" width="12" height="11" rx="2" />
      <path d="M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function Bottle({ className }: P) {
  return (
    <svg {...base(className)}>
      <path d="M9 8h6v11a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8Z" />
      <path d="M10 8V5h4v3M10 5V3h4v2" />
    </svg>
  );
}

export function ProductTypeIcon({ step, className }: { step: string; className?: string }) {
  if (step === "treatment") return <Dropper className={className} />;
  if (step === "moisturizer") return <Jar className={className} />;
  if (step === "spf") return <SunIcon className={className} />;
  return <Bottle className={className} />; // cleanser, exfoliant
}
