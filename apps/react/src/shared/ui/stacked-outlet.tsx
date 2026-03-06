import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useRouter, useRouterState } from "@tanstack/react-router";

import { TRANSITION_DIRECTION_KEY } from "@/shared/navigation/constants";
import { StackedBackContext } from "@/shared/ui/use-stacked-back";

const TAB_ROOT_PATHS = new Set(["/space", "/announcement", "/reservation", "/mypage"]);

function isTabRootPath(path: string) {
  return TAB_ROOT_PATHS.has(path);
}

export function StackedOutlet() {
  const router = useRouter();
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  const locationState = location.state as { transitionDirection?: "forward" | "back" } | undefined;
  const [isExiting, setIsExiting] = useState(false);

  const rawSession =
    typeof window !== "undefined" ? sessionStorage.getItem(TRANSITION_DIRECTION_KEY) : null;
  const sessionValue = rawSession === "forward" || rawSession === "back" ? rawSession : null;
  const lastClearedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionValue && lastClearedPathRef.current !== pathname) {
      lastClearedPathRef.current = pathname;
      sessionStorage.removeItem(TRANSITION_DIRECTION_KEY);
    }
  }, [pathname, sessionValue]);

  const requestBack = useCallback(() => {
    if (window.history.length <= 1) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TRANSITION_DIRECTION_KEY, "back");
    }
    setIsExiting(true);
  }, []);

  const exitHandledRef = useRef(false);
  const handleExitAnimationEnd = useCallback(() => {
    if (exitHandledRef.current) return;
    exitHandledRef.current = true;
    setIsExiting(false);
    router.history.back();
  }, [router]);

  useEffect(() => {
    if (!isExiting) return;
    exitHandledRef.current = false;
    const id = setTimeout(handleExitAnimationEnd, 300);
    return () => clearTimeout(id);
  }, [isExiting, handleExitAnimationEnd]);

  const effectiveTransitionDirection = isExiting ? undefined : (sessionValue ?? locationState?.transitionDirection);
  const isBackFromStackedBack = sessionValue === "back";

  const animationClass = isExiting
    ? "route-exit-forward exiting"
    : isBackFromStackedBack
      ? "route-enter-none"
      : effectiveTransitionDirection === "back"
        ? "route-enter-back"
        : effectiveTransitionDirection === "forward"
        ? "route-enter-forward"
        : isTabRootPath(pathname)
          ? "route-enter-none"
          : "route-enter-forward";

  return (
    <StackedBackContext.Provider value={{ requestBack }}>
      <div className="route-stack-viewport relative h-full w-full overflow-hidden">
        <div
          key={location.href}
          className={`route-stack-view ${animationClass}`}
          onAnimationEnd={
            isExiting
              ? (e) => {
                  if (e.target === e.currentTarget && e.animationName) {
                    handleExitAnimationEnd();
                  }
                }
              : undefined
          }
        >
          <Outlet />
        </div>
      </div>
    </StackedBackContext.Provider>
  );
}
