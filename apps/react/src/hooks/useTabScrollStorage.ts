import type { RefObject } from "react";
import { useEffect, useRef } from "react";

function getRouteStackView(): HTMLElement | null {
  return document.querySelector(".route-stack-view");
}

type UseTabScrollStorageOptions = {
  storageKey: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  /** 스크롤 복원 시점. 데이터 로드 후 복원하려면 true가 되는 deps 전달 (예: isFetched) */
  restoreDeps?: unknown[];
  /** true일 때만 저장된 스크롤을 복원 */
  restoreEnabled?: boolean;
};

export function useTabScrollStorage({
  storageKey,
  scrollContainerRef,
  restoreDeps = [],
  restoreEnabled = true,
}: UseTabScrollStorageOptions) {
  const restoreTargetScrollTopRef = useRef<number | null>(null);
  const isRestoringScrollRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!restoreEnabled) {
      const scrollContainerElement = scrollContainerRef.current;
      const routeStackElement = getRouteStackView();
      window.sessionStorage.removeItem(storageKey);
      restoreTargetScrollTopRef.current = null;
      isRestoringScrollRef.current = false;
      requestAnimationFrame(() => {
        scrollContainerElement?.scrollTo({ top: 0, behavior: "auto" });
        routeStackElement?.scrollTo({ top: 0, behavior: "auto" });
      });
      return;
    }
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved == null) return;
    const nextScrollTop = Number(saved);
    restoreTargetScrollTopRef.current = Number.isFinite(nextScrollTop)
      ? Math.max(0, nextScrollTop)
      : null;
    isRestoringScrollRef.current = restoreTargetScrollTopRef.current != null;
  }, [storageKey, restoreEnabled]);

  useEffect(() => {
    const targetScrollTop = restoreTargetScrollTopRef.current;
    if (targetScrollTop == null) return;

    let timeoutId: number | null = null;
    let isCancelled = false;
    let retryCount = 0;

    const restoreScroll = () => {
      if (isCancelled) return;

      const scrollContainerElement = scrollContainerRef.current;
      const routeStackElement = getRouteStackView();
      scrollContainerElement?.scrollTo({ top: targetScrollTop, behavior: "auto" });
      routeStackElement?.scrollTo({ top: targetScrollTop, behavior: "auto" });

      const currentScrollTop = Math.max(
        scrollContainerElement?.scrollTop ?? 0,
        routeStackElement?.scrollTop ?? 0
      );

      if (Math.abs(currentScrollTop - targetScrollTop) <= 1) {
        restoreTargetScrollTopRef.current = null;
        isRestoringScrollRef.current = false;
        return;
      }

      if (retryCount >= 20) {
        isRestoringScrollRef.current = false;
        return;
      }

      retryCount += 1;
      timeoutId = window.setTimeout(() => {
        requestAnimationFrame(restoreScroll);
      }, 50);
    };

    requestAnimationFrame(restoreScroll);

    return () => {
      isCancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restoreDeps는 호출자가 데이터 로드 시점 제어용
  }, [storageKey, ...(restoreDeps ?? [])]);

  useEffect(() => {
    const scrollContainerElement = scrollContainerRef.current;
    const routeStackElement = getRouteStackView();
    if (!scrollContainerElement && !routeStackElement) return;

    let rafId: number | null = null;
    const persistScrollTop = () => {
      if (typeof window === "undefined") return;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = Math.max(
          scrollContainerElement?.scrollTop ?? 0,
          routeStackElement?.scrollTop ?? 0
        );
        const previousRaw = window.sessionStorage.getItem(storageKey);
        const previousScrollTop = previousRaw == null ? 0 : Number(previousRaw);
        if (
          isRestoringScrollRef.current &&
          scrollTop === 0 &&
          Number.isFinite(previousScrollTop) &&
          previousScrollTop > 0
        ) {
          return;
        }
        window.sessionStorage.setItem(storageKey, String(scrollTop));
      });
    };

    scrollContainerElement?.addEventListener("scroll", persistScrollTop, { passive: true });
    routeStackElement?.addEventListener("scroll", persistScrollTop, { passive: true });

    return () => {
      scrollContainerElement?.removeEventListener("scroll", persistScrollTop);
      routeStackElement?.removeEventListener("scroll", persistScrollTop);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [storageKey, scrollContainerRef]);
}
