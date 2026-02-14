/** 공고 필터 탭 (바텀시트 상단) */
export const ANNOUNCEMENT_FILTER_TABS: { id: string; label: string }[] = [
  { id: "region", label: "지역" },
  { id: "target", label: "지원대상" },
  { id: "status", label: "모집상태" },
  { id: "sort", label: "정렬" },
];

export type AnnouncementFilterChipKey = "region" | "target" | "status" | "sort";

export const ANNOUNCEMENT_FILTER_CHIPS: {
  key: AnnouncementFilterChipKey;
  label: string;
}[] = [
  { key: "region", label: "지역" },
  { key: "target", label: "지원대상" },
  { key: "status", label: "모집상태" },
  { key: "sort", label: "정렬" },
];

/** 칩 key → 바텀시트 섹션 인덱스 */
export const ANNOUNCEMENT_CHIP_KEY_TO_SECTION_INDEX: Record<AnnouncementFilterChipKey, number> = {
  region: 0,
  target: 1,
  status: 2,
  sort: 3,
};

import {
  announcementSortByItems,
  statusItems,
  targetsItems,
} from "../../data/announcementFilterItems";

/** 지원대상 옵션 (정렬 섹션과 동일한 리스트 디자인) */
export const TARGET_OPTIONS = targetsItems;

/** 모집상태 옵션 */
export const STATUS_OPTIONS = statusItems;

/** 정렬 옵션 */
export const SORT_OPTIONS = announcementSortByItems;

/** 칩에 표시할 적용된 필터 요약 */
export interface AnnouncementFilterSummary {
  regionLabel: string;
  targetLabel: string;
  statusLabel: string;
  sortLabel: string;
}

export function getAnnouncementFilterSummary(
  region: { city: string; district: string },
  target: string,
  status: string,
  sortBy: string
): AnnouncementFilterSummary {
  const targetOption = TARGET_OPTIONS.find((o) => o.value === target);
  const statusOption = STATUS_OPTIONS.find((o) => o.value === status);
  const sortOption = SORT_OPTIONS.find((o) => o.value === sortBy);
  return {
    regionLabel:
      !region.city || region.city === "전국"
        ? ""
        : region.district
          ? `${region.city} ${region.district}`
          : region.city,
    targetLabel: target && target !== "전체" ? (targetOption?.title ?? "") : "",
    statusLabel: statusOption?.title ?? "",
    sortLabel: sortOption?.title ?? "",
  };
}
