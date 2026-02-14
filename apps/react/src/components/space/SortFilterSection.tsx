import { SORT_OPTIONS } from "./constants";

const itemBaseClass = "w-full rounded-lg p-16 typo-subtitle2 text-left transition-colors";

function itemClass(selected: boolean) {
  return selected ? "bg-bg-light-gray text-dice-black" : "bg-white text-gray-medium";
}

export interface SortFilterSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortFilterSection({ value, onChange }: SortFilterSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`${itemBaseClass} ${itemClass(value === opt.value)}`}
        >
          {opt.title}
        </button>
      ))}
    </div>
  );
}
