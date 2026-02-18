import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { PageHeader } from "../components/PageHeader";
import { SpaceCard } from "../components/SpaceCard";
import {
  DEFAULT_POPULATION_FILTER,
  getAppliedFilterSummary,
  PRICE_DEFAULT,
  SIZE_DEFAULT,
  SpaceFilterChips,
  SpaceFilterSheetContent,
  type FilterChipKey,
  type PopulationFilterState,
} from "../components/space";
import { getFilteredSpaceLists, queryKeys } from "../api";
import { DUMMY_SPACE_LIST } from "../api/space/dummy";
import type { SpaceItem } from "../types/space";

/** 적용된 지역 필터 (API용). city 없으면 district도 사용 안 함 */
type RegionFilter = { city: string; district: string };

const DEFAULT_REGION: RegionFilter = { city: "", district: "" };
const DEFAULT_SORT = "";
const PAGE_SIZE = 10;

export const Route = createFileRoute("/space")({
  component: SpaceLayout,
});

function SpaceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetailPage = pathname !== "/space" && pathname.startsWith("/space/");

  if (isDetailPage) {
    return <Outlet />;
  }
  return <SpacePage />;
}

function SpacePage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>(DEFAULT_REGION);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [populationFilter, setPopulationFilter] =
    useState<PopulationFilterState>(DEFAULT_POPULATION_FILTER);
  const [priceRange, setPriceRange] = useState<[number, number]>(PRICE_DEFAULT);
  const [sizeRange, setSizeRange] = useState<[number, number]>(SIZE_DEFAULT);
  /** 바텀시트 내부용 draft (닫아도 유지, 열 때 applied로 동기화) */
  const [sheetCity, setSheetCity] = useState("");
  const [sheetDistrict, setSheetDistrict] = useState("");
  const [sheetSortBy, setSheetSortBy] = useState(DEFAULT_SORT);
  const [sheetPopulation, setSheetPopulation] =
    useState<PopulationFilterState>(DEFAULT_POPULATION_FILTER);
  const [sheetPrice, setSheetPrice] = useState<[number, number]>(PRICE_DEFAULT);
  const [sheetSize, setSheetSize] = useState<[number, number]>(SIZE_DEFAULT);
  const [initialScrollSectionKey, setInitialScrollSectionKey] = useState<FilterChipKey | null>(
    null
  );

  const filterPayload = {
    ...(regionFilter.city !== ""
      ? { city: regionFilter.city, district: regionFilter.district }
      : {}),
    sortBy,
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.space.list({ size: PAGE_SIZE }, filterPayload),
      queryFn: async ({ pageParam }) => {
        try {
          return await getFilteredSpaceLists({ page: pageParam, size: PAGE_SIZE }, filterPayload);
        } catch {
          return pageParam === 0
            ? DUMMY_SPACE_LIST
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

  const content = (data?.pages.flatMap((p) => p.content) ?? []) as SpaceItem[];

  const openFilterSheet = (sectionKey?: FilterChipKey) => {
    setSheetCity(regionFilter.city || "전국");
    setSheetDistrict(regionFilter.district);
    setSheetSortBy(sortBy);
    setSheetPopulation(populationFilter);
    setSheetPrice(priceRange);
    setSheetSize(sizeRange);
    setInitialScrollSectionKey(sectionKey ?? null);
    setFilterSheetOpen(true);
  };

  const applyFilter = () => {
    setRegionFilter(
      sheetCity === "전국" ? DEFAULT_REGION : { city: sheetCity, district: sheetDistrict }
    );
    setSortBy(sheetSortBy);
    setPopulationFilter(sheetPopulation);
    setPriceRange(sheetPrice);
    setSizeRange(sheetSize);
    setFilterSheetOpen(false);
  };

  const resetSheetFilter = () => {
    setSheetCity("전국");
    setSheetDistrict("");
    setSheetSortBy(DEFAULT_SORT);
    setSheetPopulation(DEFAULT_POPULATION_FILTER);
    setSheetPrice(PRICE_DEFAULT);
    setSheetSize(SIZE_DEFAULT);
  };

  const filterSummary = getAppliedFilterSummary(
    regionFilter,
    populationFilter,
    priceRange,
    sizeRange,
    sortBy
  );

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden bg-white"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div className="pb-64">
        <PageHeader
          variant="space"
          title="팝업 공간"
          searchTo="/space/search"
          searchPlaceholder="찾는 지역이나 지하철역으로 검색해보세요"
        />

        <div className="py-12">
          <div className="px-(--spacing-screen-x)">
            <h2 className="typo-subtitle2 mb-16 text-dice-black">다이스 추천 팝업 공간</h2>
          </div>
          <div className="pl-(--spacing-screen-x)">
            <SpaceFilterChips filterSummary={filterSummary} onOpenFilter={openFilterSheet} />
          </div>

          <div className="px-(--spacing-screen-x)">
            {isLoading && (
              <div className="py-12 text-center text-sm text-neutral-500">
                목록을 불러오는 중...
              </div>
            )}

            {isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error instanceof Error ? error.message : "목록을 불러오지 못했습니다."}
              </div>
            )}

            {!isLoading && !isError && content.length === 0 && (
              <div className="py-12 text-center text-sm text-neutral-500">
                조회된 공간이 없습니다.
              </div>
            )}

            {!isLoading && !isError && content.length > 0 && (
              <div className="py-2">
                <ul className="flex flex-col gap-16">
                  {content.map((item) => (
                    <SpaceCard key={item.id} item={item} />
                  ))}
                </ul>
                <div ref={loadMoreRef} className="h-8 py-4" aria-hidden>
                  {isFetchingNextPage && (
                    <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p>
                  )}
                </div>
              </div>
            )}

            <BottomSheet
              open={filterSheetOpen}
              onClose={() => setFilterSheetOpen(false)}
              dismissible={false}
              sheetTitle="필터"
              sheetDescription="필터 옵션 선택"
              content={
                <SpaceFilterSheetContent
                  sheetCity={sheetCity}
                  sheetDistrict={sheetDistrict}
                  onCityChange={(city) => {
                    setSheetCity(city);
                    setSheetDistrict("");
                  }}
                  onDistrictChange={setSheetDistrict}
                  sheetSortBy={sheetSortBy}
                  onSortChange={setSheetSortBy}
                  population={sheetPopulation}
                  onPopulationChange={setSheetPopulation}
                  price={sheetPrice}
                  onPriceChange={setSheetPrice}
                  size={sheetSize}
                  onSizeChange={setSheetSize}
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
    </div>
  );
}
