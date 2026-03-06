import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTabScrollStorage } from "@/hooks/useTabScrollStorage";
import { getReservationScrollKey } from "@/lib/scrollStorage";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageHeader } from "@/components/PageHeader";
import { ReservationCard } from "@/components/ReservationCard";
import { getReservationLists, queryKeys } from "@/api";
import { canUseMemberOnlyApi } from "@/api/axios";
import { getDummyReservationList } from "@/api/reservation/dummy";
import type { ReservationItem } from "@/api";

const TAB_STATUSES = [
  { key: "PENDING" as const, label: "대기중" },
  { key: "ACCEPT" as const, label: "예약 완료" },
  { key: "CANCEL" as const, label: "예약 취소" },
] as const;

type ReservationStatus = (typeof TAB_STATUSES)[number]["key"];

const PAGE_SIZE = 10;
const EMPTY_MESSAGE_BY_STATUS: Record<ReservationStatus, string> = {
  PENDING: "대기중인 예약이 없습니다",
  ACCEPT: "완료된 예약이 없습니다",
  CANCEL: "취소된 예약이 없습니다",
};

export const Route = createFileRoute("/reservation/")({
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [activeStatus, setActiveStatus] = useState<ReservationStatus>("PENDING");
  const isMemberOnlyAllowed = canUseMemberOnlyApi();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const params = { status: activeStatus, size: PAGE_SIZE };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
  } = useInfiniteQuery({
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
    enabled: isMemberOnlyAllowed,
  });

  useTabScrollStorage({
    storageKey: getReservationScrollKey(activeStatus),
    scrollContainerRef,
    restoreDeps: [isFetched, activeStatus],
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
  const emptyMessage = EMPTY_MESSAGE_BY_STATUS[activeStatus];

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden bg-white"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div className="pb-64">
        <PageHeader variant="reservation" title="예약 관리" />

        {isMemberOnlyAllowed ? (
          <>
            <div className="sticky top-[81px] z-10 flex border-b border-neutral-200 bg-bg-light-gray">
              {TAB_STATUSES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveStatus(key)}
                  className={`relative flex-1 py-3 typo-subtitle3 transition-colors ${
                    activeStatus === key ? "text-dice-black" : "text-gray-medium"
                  }`}
                >
                  {label}
                  {activeStatus === key && (
                    <motion.span
                      layoutId="reservation-tab-indicator"
                      className="absolute right-0 bottom-0 left-0 h-[2px] bg-dice-black"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                      }
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-12 px-(--spacing-screen-x) py-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStatus}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -12 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                  }
                >
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
                    <div className="flex min-h-[calc(100dvh-220px)] items-center justify-center text-center text-sm text-neutral-500">
                      {emptyMessage}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="px-(--spacing-screen-x) py-32 text-center">
            <p className="typo-subtitle3 text-gray-deep">예약 목록은 로그인 후 이용할 수 있어요.</p>
            <Link
              to="/login"
              className="mt-16 inline-flex items-center justify-center rounded-lg bg-dice-black px-20 py-12 typo-button1 text-white"
            >
              로그인 하러가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
