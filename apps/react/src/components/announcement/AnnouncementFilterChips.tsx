import ArrowDownIcon from "../../assets/icons/Arrow/down.svg?react";
import { ANNOUNCEMENT_FILTER_CHIPS } from "./constants";
import type { AnnouncementFilterChipKey, AnnouncementFilterSummary } from "./constants";

export interface AnnouncementFilterChipsProps {
  filterSummary: AnnouncementFilterSummary;
  onOpenFilter: (sectionKey: AnnouncementFilterChipKey) => void;
}

function hasSavedValue(
  key: AnnouncementFilterChipKey,
  summary: AnnouncementFilterSummary
): boolean {
  switch (key) {
    case "region":
      return summary.regionLabel.length > 0;
    case "target":
      return summary.targetLabel.length > 0;
    case "status":
      return summary.statusLabel.length > 0;
    case "sort":
      return summary.sortLabel.length > 0;
    default:
      return false;
  }
}

function getChipLabel(
  key: AnnouncementFilterChipKey,
  label: string,
  summary: AnnouncementFilterSummary
): string {
  switch (key) {
    case "region":
      return summary.regionLabel || label;
    case "target":
      return summary.targetLabel || label;
    case "status":
      return summary.statusLabel || label;
    case "sort":
      return summary.sortLabel || label;
    default:
      return label;
  }
}

export function AnnouncementFilterChips({
  filterSummary,
  onOpenFilter,
}: AnnouncementFilterChipsProps) {
  return (
    <div className="mb-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full flex-nowrap gap-0.5">
        {ANNOUNCEMENT_FILTER_CHIPS.map(({ key, label }) => {
          const isActive = hasSavedValue(key, filterSummary);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onOpenFilter(key)}
              className={`flex flex-row items-center gap-0.5 rounded-full border pl-3 pr-2 py-[5.5px] typo-button1 transition-colors ${
                isActive
                  ? "border-transparent bg-dice-black text-dice-white hover:bg-dice-black/90"
                  : "border-(--stroke-eee) bg-bg-light-gray text-(--gray-deep) hover:bg-neutral-50"
              }`}
            >
              {getChipLabel(key, label, filterSummary)}
              <ArrowDownIcon className="size-4 shrink-0" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
