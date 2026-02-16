import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { PageHeader } from "../components/PageHeader";
import { AnnouncementCard } from "../components/AnnouncementCard";
import {
  AnnouncementFilterChips,
  AnnouncementFilterSheetContent,
  getAnnouncementFilterSummary,
  type AnnouncementFilterChipKey,
} from "../components/announcement";
import { getAnnouncementLists, queryKeys } from "../api";
import { DUMMY_ANNOUNCEMENT_LIST } from "../api/announcement/dummy";
import type { AnnouncementItem } from "../api";

type RegionFilter = { city: string; district: string };

const DEFAULT_REGION: RegionFilter = { city: "", district: "" };
const DEFAULT_TARGET = "전체";
const DEFAULT_STATUS = "";
const DEFAULT_SORT = "";
const PAGE_SIZE = 10;

export const Route = createFileRoute("/announcement")({
  component: AnnouncementLayout,
});

function AnnouncementLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetailPage = pathname !== "/announcement" && pathname.startsWith("/announcement/");

  if (isDetailPage) {
    return <Outlet />;
  }
  return <AnnouncementPage />;
}

function AnnouncementPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(DEFAULT_REGION);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [sheetCity, setSheetCity] = useState("");
  const [sheetDistrict, setSheetDistrict] = useState("");
  const [sheetTarget, setSheetTarget] = useState(DEFAULT_TARGET);
  const [sheetStatus, setSheetStatus] = useState(DEFAULT_STATUS);
  const [sheetSortBy, setSheetSortBy] = useState(DEFAULT_SORT);
  const [initialScrollSectionKey, setInitialScrollSectionKey] =
    useState<AnnouncementFilterChipKey | null>(null);

  const filterPayload = {
    city: regionFilter.city || "",
    district: regionFilter.district || "",
    targets: target && target !== "전체" ? [target] : [],
    status: status || "",
    sortBy: sortBy || undefined,
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.announcement.list({ size: PAGE_SIZE }, filterPayload),
      queryFn: async ({ pageParam }) => {
        try {
          return await getAnnouncementLists({ page: pageParam, size: PAGE_SIZE }, filterPayload);
        } catch {
          return pageParam === 0
            ? DUMMY_ANNOUNCEMENT_LIST
            : {
                content: [],
                totalPages: 0,
                totalElements: 0,
                size: PAGE_SIZE,
                number: pageParam,
                first: false,
                last: true,
              };
        }
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const next = (lastPage.number ?? 0) + 1;
        return next < (lastPage.totalPages ?? 0) ? next : undefined;
      },
    });

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const content = (data?.pages.flatMap((p) => p.content) ?? []) as AnnouncementItem[];

  const openFilterSheet = (sectionKey?: AnnouncementFilterChipKey) => {
    setSheetCity(regionFilter.city || "전국");
    setSheetDistrict(regionFilter.district);
    setSheetTarget(target);
    setSheetStatus(status);
    setSheetSortBy(sortBy);
    setInitialScrollSectionKey(sectionKey ?? null);
    setFilterSheetOpen(true);
  };

  const applyFilter = () => {
    setRegionFilter(
      sheetCity === "전국" ? DEFAULT_REGION : { city: sheetCity, district: sheetDistrict }
    );
    setTarget(sheetTarget);
    setStatus(sheetStatus);
    setSortBy(sheetSortBy);
    setFilterSheetOpen(false);
  };

  const resetSheetFilter = () => {
    setSheetCity("전국");
    setSheetDistrict("");
    setSheetTarget(DEFAULT_TARGET);
    setSheetStatus(DEFAULT_STATUS);
    setSheetSortBy(DEFAULT_SORT);
  };

  const filterSummary = getAnnouncementFilterSummary(regionFilter, target, status, sortBy);

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden bg-white"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div className="pb-64">
        <PageHeader
          variant="announcement"
          title="팝업 지원 공고"
          searchTo="/announcement/search"
          searchPlaceholder="원하시는 지역, 모집처, 지원 내용을 검색해보세요"
        />

        <div className="px-(--spacing-screen-x) py-12">
          <AnnouncementFilterChips filterSummary={filterSummary} onOpenFilter={openFilterSheet} />

          {isLoading && (
            <div className="py-12 text-center text-sm text-neutral-500">목록을 불러오는 중...</div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error instanceof Error ? error.message : "목록을 불러오지 못했습니다."}
            </div>
          )}

          {!isLoading && !isError && content.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              조회된 공고가 없습니다.
            </div>
          )}

          {!isLoading && !isError && content.length > 0 && (
            <>
              <ul className="flex flex-col gap-3">
                {content.map((item) => (
                  <AnnouncementCard key={item.id} item={item} />
                ))}
              </ul>
              <div ref={loadMoreRef} className="h-8 py-4" aria-hidden>
                {isFetchingNextPage && (
                  <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p>
                )}
              </div>
            </>
          )}

          <BottomSheet
            open={filterSheetOpen}
            onClose={() => setFilterSheetOpen(false)}
            dismissible={false}
            sheetTitle="필터"
            sheetDescription="필터 옵션 선택"
            content={
              <AnnouncementFilterSheetContent
                sheetCity={sheetCity}
                sheetDistrict={sheetDistrict}
                onCityChange={(city) => {
                  setSheetCity(city);
                  setSheetDistrict("");
                }}
                onDistrictChange={setSheetDistrict}
                sheetTarget={sheetTarget}
                onTargetChange={setSheetTarget}
                sheetStatus={sheetStatus}
                onStatusChange={setSheetStatus}
                sheetSortBy={sheetSortBy}
                onSortChange={setSheetSortBy}
                onApply={applyFilter}
                onCancel={() => setFilterSheetOpen(false)}
                onReset={resetSheetFilter}
                initialScrollSectionKey={initialScrollSectionKey}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
