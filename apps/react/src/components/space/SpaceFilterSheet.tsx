import { useEffect, useRef, useState } from "react";
import XIcon from "../../assets/icons/x.svg?react";
import { PopulationFilterSection } from "./PopulationFilterSection";
import { PriceFilterSection } from "./PriceFilterSection";
import { RegionFilterSection } from "./RegionFilterSection";
import { SizeFilterSection } from "./SizeFilterSection";
import { SortFilterSection } from "./SortFilterSection";
import { CHIP_KEY_TO_SECTION_INDEX, FILTER_TABS } from "./constants";
import type { FilterChipKey, PopulationFilterState } from "./constants";

const SECTION_CLASS = "scroll-mt-2 py-24 px-5";

export interface SpaceFilterSheetContentProps {
  sheetCity: string;
  sheetDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  sheetSortBy: string;
  onSortChange: (value: string) => void;
  population: PopulationFilterState;
  onPopulationChange: (next: PopulationFilterState) => void;
  price: [number, number];
  onPriceChange: (value: [number, number]) => void;
  size: [number, number];
  onSizeChange: (value: [number, number]) => void;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
  /** 칩 클릭으로 열었을 때 이 섹션으로 스크롤 */
  initialScrollSectionKey?: FilterChipKey | null;
}

export function SpaceFilterSheetContent({
  sheetCity,
  sheetDistrict,
  onCityChange,
  onDistrictChange,
  sheetSortBy,
  onSortChange,
  population,
  onPopulationChange,
  price,
  onPriceChange,
  size,
  onSizeChange,
  onApply,
  onCancel,
  onReset,
  initialScrollSectionKey,
}: SpaceFilterSheetContentProps) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const scrollToSection = (index: number) => {
    setActiveTabIndex(index);
    const el = sectionRefs.current[index];
    const container = scrollContainerRef.current;
    if (!el || !container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const targetScroll = Math.min(Math.max(0, el.offsetTop - 60), maxScroll);
    container.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  useEffect(() => {
    if (initialScrollSectionKey == null) return;
    const index = CHIP_KEY_TO_SECTION_INDEX[initialScrollSectionKey];
    const t = setTimeout(() => scrollToSection(index), 100);
    return () => clearTimeout(t);
  }, [initialScrollSectionKey]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const headerOffset = 60;
      let current = 0;
      for (let i = 0; i < sectionRefs.current.length; i++) {
        const el = sectionRefs.current[i];
        if (el && el.offsetTop <= scrollTop + headerOffset) current = i;
      }
      setActiveTabIndex(current);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex max-h-[85vh] flex-col overflow-hidden">
      {/* 스크롤 영역: 탭(고정) + 섹션들. 탭은 이 컨테이너 안에서 sticky로 상단 고정 */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-white pl-5 pr-[3px] py-2 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none">
            <div className="flex w-max flex-nowrap gap-4">
              {FILTER_TABS.map((tab, index) => {
                const isActive = activeTabIndex === index;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(index)}
                    className={`typo-subtitle1 text-left shrink-0 rounded-full pr-8 py-8 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      isActive
                        ? "text-(--dice-black) dark:text-white"
                        : "text-(--gray-light) dark:text-neutral-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="필터 닫기"
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-(--gray-deep) transition-colors hover:bg-neutral-100 hover:text-(--dice-black) dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <XIcon className="size-24" aria-hidden />
          </button>
        </div>

        <div className="pb-[120px]">
          <section
            ref={(el) => {
              sectionRefs.current[0] = el;
            }}
            className={`${SECTION_CLASS}`}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">지역</h3>
            <RegionFilterSection
              sheetCity={sheetCity}
              sheetDistrict={sheetDistrict}
              onCityChange={onCityChange}
              onDistrictChange={onDistrictChange}
            />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[1] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">유동인구</h3>
            <PopulationFilterSection value={population} onChange={onPopulationChange} />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[2] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">가격</h3>
            <PriceFilterSection value={price} onChange={onPriceChange} />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[3] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">공간크기</h3>
            <SizeFilterSection value={size} onChange={onSizeChange} />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[4] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">정렬</h3>
            <SortFilterSection value={sheetSortBy} onChange={onSortChange} />
          </section>

          <div className="h-[120px]" />
        </div>
      </div>

      <div className="flex shrink-0 gap-12 border-t border-neutral-200 px-5 py-16 dark:border-neutral-700">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-stroke-eee p-16 typo-button1 text-dice-black dark:border-stroke-eee dark:text-gray-deep"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-dice-black p-16 typo-button1 text-white dark:bg-dice-blue"
        >
          필터 결과 보기
        </button>
      </div>
    </div>
  );
}
