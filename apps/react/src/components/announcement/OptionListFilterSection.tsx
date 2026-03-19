/** 정렬 섹션과 동일한 디자인: 제목+값 리스트, 단일 선택 */
const itemBaseClass = "w-full rounded-lg p-4 typo-subtitle2 text-left transition-colors";

function itemClass(selected: boolean) {
  return selected ? "bg-bg-light-gray text-dice-black" : "bg-white text-gray-medium";
}

export interface OptionListFilterSectionProps {
  options: { title: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function OptionListFilterSection({
  options,
  value,
  onChange,
}: OptionListFilterSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => (
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
