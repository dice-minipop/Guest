import { FILTER_CHIPS } from "./constants";
import type { AppliedFilterSummary, FilterChipKey } from "./constants";
import ArrowDownIcon from "../../assets/icons/Arrow/down.svg?react";

export interface SpaceFilterChipsProps {
  filterSummary: AppliedFilterSummary;
  onOpenFilter: (sectionKey: FilterChipKey) => void;
}

function hasSavedValue(key: FilterChipKey, summary: AppliedFilterSummary): boolean {
  switch (key) {
    case "region":
      return summary.regionLabel.length > 0;
    case "population":
      return summary.populationLabel.length > 0;
    case "price":
      return summary.priceLabel.length > 0;
    case "size":
      return summary.sizeLabel.length > 0;
    case "sort":
      return summary.sortLabel.length > 0;
    default:
      return false;
  }
}

function getChipLabel(key: FilterChipKey, label: string, summary: AppliedFilterSummary): string {
  switch (key) {
    case "region":
      return summary.regionLabel || label;
    case "population":
      return summary.populationLabel || label;
    case "price":
      return summary.priceLabel || label;
    case "size":
      return summary.sizeLabel || label;
    case "sort":
      return summary.sortLabel || label;
    default:
      return label;
  }
}

export function SpaceFilterChips({ filterSummary, onOpenFilter }: SpaceFilterChipsProps) {
  return (
    <div className="mb-16 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full flex-nowrap gap-2">
        {FILTER_CHIPS.map(({ key, label }) => {
          const isActive = hasSavedValue(key, filterSummary);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onOpenFilter(key)}
              className={`flex flex-row items-center gap-2 rounded-full border pl-12 pr-8 py-[5.5px] typo-button1 transition-colors ${
                isActive
                  ? "border-transparent bg-dice-black text-dice-white hover:bg-dice-black/90 dark:bg-dice-black dark:text-dice-white dark:hover:bg-dice-black/90"
                  : "border-(--stroke-eee) bg-bg-light-gray text-(--gray-deep) hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {getChipLabel(key, label, filterSummary)}
              <ArrowDownIcon className="size-16 shrink-0" aria-hidden />
            </button>
          );
        })}

        <div className="w-5 h-5" />
      </div>
    </div>
  );
}
