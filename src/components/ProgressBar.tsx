"use client";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  color = "#3B82F6",
  height = "h-2",
  showLabel = false,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            Progression
          </span>
          <span className="text-xs font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      )}
      <div className={`${height} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
