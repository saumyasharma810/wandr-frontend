import { VibeTag, VIBE_CONFIG } from "../lib/mock-data";

export default function VibeChip({ vibe }: { vibe: VibeTag }) {
  const cfg = VIBE_CONFIG[vibe];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderRadius: "9999px",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
