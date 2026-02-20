"use client";

interface MascotProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  animate?: boolean;
}

export default function Mascot({ size = "md", message, animate = true }: MascotProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizes[size]} relative ${animate ? "animate-pulse-soft" : ""}`}
      >
        {/* Owl mascot SVG */}
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <circle cx="60" cy="65" r="45" fill="#3B82F6" />
          <circle cx="60" cy="65" r="42" fill="#60A5FA" />

          {/* Belly */}
          <ellipse cx="60" cy="78" rx="25" ry="22" fill="#DBEAFE" />

          {/* Eyes - white */}
          <circle cx="42" cy="52" r="16" fill="white" />
          <circle cx="78" cy="52" r="16" fill="white" />

          {/* Eyes - iris */}
          <circle cx="44" cy="52" r="10" fill="#1E293B" />
          <circle cx="76" cy="52" r="10" fill="#1E293B" />

          {/* Eyes - pupil highlight */}
          <circle cx="47" cy="49" r="3.5" fill="white" />
          <circle cx="79" cy="49" r="3.5" fill="white" />

          {/* Beak */}
          <path d="M54 62 L60 70 L66 62" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />

          {/* Eyebrows (gives a curious look) */}
          <path d="M28 40 Q35 33 50 38" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M92 40 Q85 33 70 38" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Ears/tufts */}
          <path d="M25 30 L32 45 L20 42Z" fill="#3B82F6" />
          <path d="M95 30 L88 45 L100 42Z" fill="#3B82F6" />

          {/* Magnifying glass */}
          <circle cx="98" cy="90" r="12" stroke="#F59E0B" strokeWidth="4" fill="none" />
          <line x1="107" y1="99" x2="116" y2="108" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="98" cy="90" r="8" fill="#FEF3C7" fillOpacity="0.3" />

          {/* Wing hint */}
          <path d="M16 65 Q10 75 18 88" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M104 65 Q110 75 102 88" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      {message && (
        <div className="bg-white rounded-2xl px-4 py-2 shadow-md text-sm text-center max-w-[250px] relative border border-blue-100">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-blue-100 rotate-45" />
          <p className="relative text-[var(--color-navy)] font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}
