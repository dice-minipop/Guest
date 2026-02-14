import { useEffect, useRef, useState } from "react";
import XIcon from "../../assets/icons/x.svg?react";
import { RegionFilterSection } from "../space/RegionFilterSection";
import {
  ANNOUNCEMENT_CHIP_KEY_TO_SECTION_INDEX,
  ANNOUNCEMENT_FILTER_TABS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TARGET_OPTIONS,
} from "./constants";
import type { AnnouncementFilterChipKey } from "./constants";
import { OptionListFilterSection } from "./OptionListFilterSection";

const SECTION_CLASS = "scroll-mt-2 py-24 px-5";

export interface AnnouncementFilterSheetContentProps {
  sheetCity: string;
  sheetDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  sheetTarget: string;
  onTargetChange: (value: string) => void;
  sheetStatus: string;
  onStatusChange: (value: string) => void;
  sheetSortBy: string;
  onSortChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
  initialScrollSectionKey?: AnnouncementFilterChipKey | null;
}

export function AnnouncementFilterSheetContent({
  sheetCity,
  sheetDistrict,
  onCityChange,
  onDistrictChange,
  sheetTarget,
  onTargetChange,
  sheetStatus,
  onStatusChange,
  sheetSortBy,
  onSortChange,
  onApply,
  onCancel,
  onReset,
  initialScrollSectionKey,
}: AnnouncementFilterSheetContentProps) {
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
    const index = ANNOUNCEMENT_CHIP_KEY_TO_SECTION_INDEX[initialScrollSectionKey];
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
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-white pl-5 pr-[3px] py-2 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max flex-nowrap gap-4">
              {ANNOUNCEMENT_FILTER_TABS.map((tab, index) => {
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
            className={SECTION_CLASS}
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
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">지원대상</h3>
            <OptionListFilterSection
              options={TARGET_OPTIONS}
              value={sheetTarget}
              onChange={onTargetChange}
            />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[2] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">모집상태</h3>
            <OptionListFilterSection
              options={STATUS_OPTIONS}
              value={sheetStatus}
              onChange={onStatusChange}
            />
          </section>

          <div className="h-8 bg-bg-light-gray" />

          <section
            ref={(el) => {
              sectionRefs.current[3] = el;
            }}
            className={SECTION_CLASS}
          >
            <h3 className="typo-caption1 mb-3 text-gray-dark dark:text-white">정렬</h3>
            <OptionListFilterSection
              options={SORT_OPTIONS}
              value={sheetSortBy}
              onChange={onSortChange}
            />
          </section>

          <div className="h-[140px]" />
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
          className="flex-1 rounded-lg bg-dice-black p-16 typo-button1 text-dice-white dark:bg-dice-blue"
        >
          필터 결과 보기
        </button>
      </div>
    </div>
  );
}
