import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { ReservationCard } from "../components/ReservationCard";
import { getReservationLists, queryKeys } from "../api";
import { getDummyReservationList } from "../api/reservation/dummy";
import type { ReservationItem } from "../api";

const TAB_STATUSES = [
  { key: "PENDING" as const, label: "대기중" },
  { key: "ACCEPT" as const, label: "예약 완료" },
  { key: "CANCEL" as const, label: "예약 취소" },
] as const;

type ReservationStatus = (typeof TAB_STATUSES)[number]["key"];

const PAGE_SIZE = 10;

export const Route = createFileRoute("/reservation")({
  component: ReservationLayout,
});

function ReservationLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/reservation";

  if (!isIndex) {
    return <Outlet />;
  }

  return <ReservationPage />;
}

function ReservationPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [activeStatus, setActiveStatus] = useState<ReservationStatus>("PENDING");

  const params = { status: activeStatus, size: PAGE_SIZE };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.reservation.list(params),
      queryFn: async ({ pageParam }) => {
        try {
          return await getReservationLists(activeStatus, undefined, pageParam, PAGE_SIZE);
        } catch {
          if (pageParam === 0) {
            return getDummyReservationList(activeStatus);
          }
          return {
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

  const content = (data?.pages.flatMap((p) => p.content) ?? []) as ReservationItem[];

  return (
    <div className="min-h-screen bg-white pb-64">
      <PageHeader variant="reservation" title="예약 관리" />

      <div className="sticky top-[81px] z-10 flex border-b border-neutral-200 bg-bg-light-gray dark:border-neutral-700 dark:bg-neutral-900">
        {TAB_STATUSES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveStatus(key)}
            className={`flex-1 py-3 typo-subtitle3 transition-colors ${
              activeStatus === key
                ? "border-b-2 border-dice-black text-dice-black"
                : "text-gray-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="pt-12 px-(--spacing-screen-x) py-4">
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
            해당 상태의 예약이 없습니다.
          </div>
        )}

        {!isLoading && !isError && content.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {content.map((item) => (
                <ReservationCard key={item.reservationId} item={item} />
              ))}
            </ul>
            <div ref={loadMoreRef} className="h-8 py-4" aria-hidden>
              {isFetchingNextPage && (
                <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
