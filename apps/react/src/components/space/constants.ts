export const FILTER_TABS: { id: string; label: string }[] = [
  { id: "region", label: "지역" },
  { id: "population", label: "유동인구" },
  { id: "price", label: "가격" },
  { id: "size", label: "공간크기" },
  { id: "sort", label: "정렬" },
];

export type FilterChipKey = "region" | "population" | "price" | "size" | "sort";

export const FILTER_CHIPS: { key: FilterChipKey; label: string }[] = [
  { key: "region", label: "지역" },
  { key: "population", label: "유동인구" },
  { key: "price", label: "가격" },
  { key: "size", label: "공간크기" },
  { key: "sort", label: "정렬" },
];

/** 칩 key → 바텀시트 섹션 인덱스 (sort → 정렬 섹션) */
export const CHIP_KEY_TO_SECTION_INDEX: Record<FilterChipKey, number> = {
  region: 0,
  population: 1,
  price: 2,
  size: 3,
  sort: 4,
};

export const SORT_OPTIONS: { title: string; value: string }[] = [
  { title: "인기 순", value: "likeCount" },
  { title: "최신 순", value: "latest" },
  { title: "낮은 가격 순", value: "priceAsc" },
  { title: "높은 가격 순", value: "priceDesc" },
];

/** 유동인구 필터 (바텀시트용) */
export interface PopulationFilterState {
  targetGender: string[];
  targetAgeGroup: string[];
  busyDays: string[];
  purposes: string[];
}

export const DEFAULT_POPULATION_FILTER: PopulationFilterState = {
  targetGender: [],
  targetAgeGroup: [],
  busyDays: [],
  purposes: [],
};

export const PRICE_DEFAULT: [number, number] = [0, 1_000_000];
export const SIZE_DEFAULT: [number, number] = [0, 150];

/** 칩에 표시할 적용된 필터 요약 */
export interface AppliedFilterSummary {
  regionLabel: string;
  populationLabel: string;
  priceLabel: string;
  sizeLabel: string;
  sortLabel: string;
}

function formatPriceLabel(value: [number, number]): string {
  if (value[0] === 0 && value[1] >= 1_000_000) return "";
  const toMan = (v: number) => (v >= 1_000_000 ? "100만" : `${Math.round(v / 10_000)}만`);
  return `${toMan(value[0])}~${toMan(value[1])}원`;
}

function formatSizeLabel(value: [number, number]): string {
  if (value[0] === 0 && value[1] === 150) return "";
  return `${value[0]}~${value[1]}평`;
}

export function getAppliedFilterSummary(
  region: { city: string; district: string },
  population: PopulationFilterState,
  price: [number, number],
  size: [number, number],
  sortBy: string
): AppliedFilterSummary {
  const totalPopulation =
    population.targetGender.length +
    population.targetAgeGroup.length +
    population.busyDays.length +
    population.purposes.length;
  const sortOption = SORT_OPTIONS.find((o) => o.value === sortBy);
  return {
    regionLabel:
      !region.city || region.city === "전국"
        ? ""
        : region.district
          ? `${region.city} ${region.district}`
          : region.city,
    populationLabel: totalPopulation > 0 ? `${totalPopulation}개 선택` : "",
    priceLabel: formatPriceLabel(price),
    sizeLabel: formatSizeLabel(size),
    sortLabel: sortOption?.title ?? "",
  };
}
