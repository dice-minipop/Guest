import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { getLikedSpaceLists, getLikedAnnouncementLists, queryKeys } from "@/api";
import { canUseMemberOnlyApi } from "@/api/axios";
import type { AnnouncementItem, LikedAnnouncement } from "@/api";
import { SpaceCard } from "@/components/SpaceCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { SpaceItem } from "@/types/space";
import { backWithHistory } from "@/shared/navigation/back";

const PAGE_SIZE = 10;

type Tab = "space" | "announcement";

export const Route = createFileRoute("/liked/")({
  component: LikedPage,
});

function LikedPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("space");
  const loadMoreSpaceRef = useRef<HTMLDivElement>(null);
  const loadMoreAnnouncementRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const isMemberOnlyAllowed = canUseMemberOnlyApi();

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(el.offsetHeight);
    });
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [tab]);

  const likedSpaces = useInfiniteQuery({
    queryKey: queryKeys.guest.likedSpaces({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getLikedSpaceLists(pageParam as number, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = (lastPage.number ?? 0) + 1;
      return next < (lastPage.totalPages ?? 0) ? next : undefined;
    },
    enabled: isMemberOnlyAllowed,
  });

  const likedAnnouncements = useInfiniteQuery({
    queryKey: queryKeys.guest.likedAnnouncements({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getLikedAnnouncementLists(pageParam as number, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = (lastPage.number ?? 0) + 1;
      return next < (lastPage.totalPages ?? 0) ? next : undefined;
    },
    enabled: isMemberOnlyAllowed,
  });

  const spaceContent = (likedSpaces.data?.pages.flatMap((p) => p.content) ?? []) as SpaceItem[];
  const announcementContent = (likedAnnouncements.data?.pages.flatMap((p) => p.content) ??
    []) as LikedAnnouncement[];

  const {
    fetchNextPage: fetchNextSpaces,
    hasNextPage: hasNextSpaces,
    isFetchingNextPage: isFetchingNextSpaces,
  } = likedSpaces;
  const {
    fetchNextPage: fetchNextAnnouncements,
    hasNextPage: hasNextAnnouncements,
    isFetchingNextPage: isFetchingNextAnnouncements,
  } = likedAnnouncements;

  useEffect(() => {
    if (tab !== "space") return;
    const el = loadMoreSpaceRef.current;
    if (!el || !hasNextSpaces || isFetchingNextSpaces) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextSpaces();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tab, hasNextSpaces, isFetchingNextSpaces, fetchNextSpaces]);

  useEffect(() => {
    if (tab !== "announcement") return;
    const el = loadMoreAnnouncementRef.current;
    if (!el || !hasNextAnnouncements || isFetchingNextAnnouncements) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextAnnouncements();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tab, hasNextAnnouncements, isFetchingNextAnnouncements, fetchNextAnnouncements]);

  const isSpaceLoading = likedSpaces.isLoading;
  const isAnnouncementLoading = likedAnnouncements.isLoading;
  const isSpaceError = likedSpaces.isError;
  const isAnnouncementError = likedAnnouncements.isError;

  return (
    <div className="min-h-screen bg-dice-white">
      <header
        ref={headerRef}
        className="fixed top-0 left-1/2 z-10 w-full max-w-(--common-max-width) -translate-x-1/2 bg-dice-white"
        style={{
          paddingTop: "max(var(--spacing-12), env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--spacing-12)",
          paddingLeft: "3px",
          paddingRight: "3px",
        }}
      >
        <div className="relative flex min-h-[44px] w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="w-[48px] h-[48px] flex shrink-0 items-center justify-center typo-subtitle1 text-white transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="뒤로가기"
          >
            <ArrowRightIcon className="size-24" aria-hidden />
          </button>

          <div className="absolute left-0 right-0 flex justify-center px-[10px] pointer-events-none">
            <div className="relative flex w-full max-w-[160px] pointer-events-auto rounded-full border border-neutral-600 bg-neutral-800 p-1">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-[left] duration-200 ease-out"
                style={{
                  left: tab === "space" ? "4px" : "calc(50% + 2px)",
                }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setTab("space")}
                className={`relative z-10 flex flex-1 items-center justify-center rounded-full py-2.5 typo-button1 transition-colors duration-200 ease-out ${
                  tab === "space" ? "text-black" : "text-white"
                }`}
              >
                찜한공간
              </button>
              <button
                type="button"
                onClick={() => setTab("announcement")}
                className={`relative z-10 flex flex-1 items-center justify-center rounded-full py-2.5 typo-button1 transition-colors duration-200 ease-out ${
                  tab === "announcement" ? "text-black" : "text-white"
                }`}
              >
                찜한공고
              </button>
            </div>
          </div>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>
      <div aria-hidden style={{ minHeight: headerHeight || 56 }} />

      <div
        className="px-(--spacing-screen-x) py-6"
        style={{ paddingBottom: "var(--spacing-scroll-end, 24px)" }}
      >
        {tab === "space" && (
          <>
            {!isMemberOnlyAllowed && (
              <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                회원 전용 기능입니다. 로그인 후 이용해 주세요.
              </div>
            )}
            {isSpaceLoading && (
              <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                목록을 불러오는 중...
              </div>
            )}
            {isSpaceError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 typo-body2 text-red-700">
                {likedSpaces.error instanceof Error
                  ? likedSpaces.error.message
                  : "찜한 공간 목록을 불러오지 못했습니다."}
              </div>
            )}
            {isMemberOnlyAllowed &&
              !isSpaceLoading &&
              !isSpaceError &&
              spaceContent.length === 0 && (
                <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                  찜한 공간이 없습니다.
                </div>
              )}
            {isMemberOnlyAllowed && !isSpaceLoading && !isSpaceError && spaceContent.length > 0 && (
              <ul className="flex flex-col gap-4">
                {spaceContent.map((item) => (
                  <SpaceCard key={item.id} item={item} />
                ))}
              </ul>
            )}
            {isMemberOnlyAllowed && tab === "space" && spaceContent.length > 0 && (
              <div ref={loadMoreSpaceRef} className="h-8 py-4" aria-hidden>
                {isFetchingNextSpaces && (
                  <p className="text-center typo-body2 text-(--gray-deep)">더 불러오는 중...</p>
                )}
              </div>
            )}
          </>
        )}

        {tab === "announcement" && (
          <>
            {!isMemberOnlyAllowed && (
              <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                회원 전용 기능입니다. 로그인 후 이용해 주세요.
              </div>
            )}
            {isAnnouncementLoading && (
              <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                목록을 불러오는 중...
              </div>
            )}
            {isAnnouncementError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 typo-body2 text-red-700">
                {likedAnnouncements.error instanceof Error
                  ? likedAnnouncements.error.message
                  : "찜한 공고 목록을 불러오지 못했습니다."}
              </div>
            )}
            {isMemberOnlyAllowed &&
              !isAnnouncementLoading &&
              !isAnnouncementError &&
              announcementContent.length === 0 && (
                <div className="py-12 text-center typo-body2 text-(--gray-deep)">
                  찜한 공고가 없습니다.
                </div>
              )}
            {isMemberOnlyAllowed &&
              !isAnnouncementLoading &&
              !isAnnouncementError &&
              announcementContent.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {announcementContent.map((item) => (
                    <AnnouncementCard key={item.id} item={item as AnnouncementItem} />
                  ))}
                </ul>
              )}
            {isMemberOnlyAllowed && tab === "announcement" && announcementContent.length > 0 && (
              <div ref={loadMoreAnnouncementRef} className="h-8 py-4" aria-hidden>
                {isFetchingNextAnnouncements && (
                  <p className="text-center typo-body2 text-(--gray-deep)">더 불러오는 중...</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
