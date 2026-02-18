import { regionItems } from "../../data/regionItems";

const cityChipBaseClass = "rounded-full border px-12 py-[5.5px] typo-button1 transition-colors";

function cityChipClass(selected: boolean) {
  return selected
    ? "border-stroke-dice-black bg-dice-black text-dice-white"
    : "border-stroke-eee bg-white text-gray-deep hover:border-(--gray-light) hover:bg-neutral-50";
}

const districtChipClass = (selected: boolean) =>
  selected
    ? "border-(--system-purple) bg-white text-(--system-purple)"
    : "border-(--gray-light) bg-white text-(--gray-dark) hover:border-(--gray-deep)";

export interface RegionFilterSectionProps {
  sheetCity: string;
  sheetDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
}

export function RegionFilterSection({
  sheetCity,
  sheetDistrict,
  onCityChange,
  onDistrictChange,
}: RegionFilterSectionProps) {
  const selectedRegion = regionItems.find((r) => r.title === sheetCity);
  const districtOptions = selectedRegion?.item ?? [];

  return (
    <div className="flex flex-col gap-24">
      {/* 시·도 칩: 2줄 고정, 가로 스크롤 */}
      <div className="overflow-x-auto py-1 scrollbar-none">
        <div
          className="grid w-max gap-2"
          style={{
            gridTemplateRows: "repeat(2, auto)",
            gridAutoFlow: "column",
          }}
        >
          {regionItems.map((r) => (
            <button
              key={r.title}
              type="button"
              onClick={() => onCityChange(r.title)}
              className={`shrink-0 ${cityChipBaseClass} ${cityChipClass(sheetCity === r.title)}`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </div>

      {districtOptions.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-8 bg-bg-light-gray p-16 rounded-lg">
          {districtOptions.map((name) => {
            const value = name === "전체" ? "" : name;
            const selected = sheetDistrict === value;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onDistrictChange(value)}
                className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${districtChipClass(selected)}`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
