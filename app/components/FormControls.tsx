"use client";

export function inputStyle(focused: boolean): React.CSSProperties {
  return {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${focused ? "#C4773B" : "#E8E2D9"}`,
    borderRadius: "4px",
    color: "#2C2825",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: "1rem",
    outline: "none",
    boxShadow: focused ? "0 0 0 3px #F0E6D8" : "none",
    width: "100%",
    padding: "10px 14px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };
}

export function ChipSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: selected ? "#F0E6D8" : "#F2EFE9",
              border: `1px solid ${selected ? "#C4773B" : "#E8E2D9"}`,
              borderRadius: "9999px",
              color: selected ? "#C4773B" : "#2C2825",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const COMPANION_OPTIONS = [
  { label: "Solo", value: "solo" as const },
  { label: "Couple", value: "couple" as const },
  { label: "Group", value: "group" as const },
  { label: "Family", value: "family" as const },
];

export const BUDGET_OPTIONS = [
  { label: "Budget", value: "backpacker" as const },
  { label: "Mid-range", value: "mid" as const },
  { label: "Luxury", value: "luxury" as const },
];
