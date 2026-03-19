import FemaleIcon from "../../assets/icons/Target/female.svg?react";
import MaleIcon from "../../assets/icons/Target/male.svg?react";
import { dayOfWeekItems, purposeItems } from "../../data/filterItems";
import type { PopulationFilterState } from "./constants";

const TARGET_GENDERS = [
  { value: "여성", label: "여성", Icon: FemaleIcon },
  { value: "남성", label: "남성", Icon: MaleIcon },
] as const;

const TARGET_AGE_GROUPS = [
  { value: "10대이하", label: "10대이하" },
  { value: "20대", label: "20대" },
  { value: "30대", label: "30대" },
  { value: "40대", label: "40대" },
  { value: "50대", label: "50대" },
  { value: "60대이상", label: "60대이상" },
] as const;

function toggleChip(arr: string[], value: string): string[] {
  if (arr.includes(value)) return arr.filter((v) => v !== value);
  return [...arr, value];
}

export interface PopulationFilterSectionProps {
  value: PopulationFilterState;
  onChange: (next: PopulationFilterState) => void;
}

export function PopulationFilterSection({
  value: filterState,
  onChange,
}: PopulationFilterSectionProps) {
  const { targetGender, targetAgeGroup, busyDays, purposes } = filterState;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. 브랜드 타겟 성별 */}
      <div className="flex flex-col gap-3">
        <label className="typo-subtitle2 text-(--dice-black)">브랜드 타겟 성별</label>
        <div className="flex flex-wrap gap-2">
          {TARGET_GENDERS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({
                  ...filterState,
                  targetGender: toggleChip(targetGender, value),
                })
              }
              className={`flex items-center gap-0.5 rounded-full border px-3 py-1 typo-button1 transition-colors ${
                targetGender.includes(value)
                  ? "border-(--system-purple) bg-white text-(--system-purple)"
                  : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
              }`}
            >
              <Icon className="size-6 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 브랜드 타겟 연령대 */}
      <div className="flex flex-col gap-3">
        <label className="typo-subtitle2 text-(--dice-black)">브랜드 타겟 연령대</label>
        <div className="flex flex-wrap gap-1">
          {TARGET_AGE_GROUPS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({
                  ...filterState,
                  targetAgeGroup: toggleChip(targetAgeGroup, value),
                })
              }
              className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${
                targetAgeGroup.includes(value)
                  ? "border-(--system-purple) bg-white text-(--system-purple)"
                  : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 유동인구가 많은 요일 */}
      <div className="flex flex-col gap-3">
        <label className="typo-subtitle2 text-(--dice-black)">유동인구가 많은 요일</label>
        <div className="flex flex-wrap gap-1">
          {dayOfWeekItems.map(({ value, title }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({
                  ...filterState,
                  busyDays: toggleChip(busyDays, value),
                })
              }
              className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${
                busyDays.includes(value)
                  ? "border-(--system-purple) bg-white text-(--system-purple)"
                  : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 인기 방문 목적 */}
      <div className="flex flex-col gap-3">
        <label className="typo-subtitle2 text-(--dice-black)">인기 방문 목적</label>
        <div className="flex flex-wrap gap-1">
          {purposeItems.map(({ value, title }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange({
                  ...filterState,
                  purposes: toggleChip(purposes, value),
                })
              }
              className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${
                purposes.includes(value)
                  ? "border-(--system-purple) bg-white text-(--system-purple)"
                  : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
