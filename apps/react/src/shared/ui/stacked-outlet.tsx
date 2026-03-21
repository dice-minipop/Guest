import { useEffect, useRef } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";

import { TRANSITION_DIRECTION_KEY } from "@/shared/navigation/constants";

const TAB_ROOT_PATHS = new Set(["/space", "/announcement", "/reservation", "/mypage"]);

function isTabRootPath(path: string) {
  return TAB_ROOT_PATHS.has(path);
}

/**
 * Running-Rife 스타일 스택 뷰포트.
 * - 진입 시에만 애니메이션 (forward: 오른쪽에서, back: 왼쪽에서)
 * - history.back() 시 sessionStorage로 전환 방향 전달
 */
export function StackedOutlet() {
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  const locationState = location.state as
    | { transitionDirection?: "forward" | "back" | "none" }
    | undefined;
  const lastClearedPathRef = useRef<string | null>(null);

  const rawSession =
    typeof window !== "undefined" ? sessionStorage.getItem(TRANSITION_DIRECTION_KEY) : null;
  const sessionValue = rawSession === "forward" || rawSession === "back" ? rawSession : null;

  useEffect(() => {
    if (sessionValue && lastClearedPathRef.current !== pathname) {
      lastClearedPathRef.current = pathname;
      sessionStorage.removeItem(TRANSITION_DIRECTION_KEY);
    }
  }, [pathname, sessionValue]);

  const effectiveTransitionDirection = sessionValue ?? locationState?.transitionDirection;

  const animationClass =
    effectiveTransitionDirection === "back"
      ? "route-enter-back"
      : effectiveTransitionDirection === "forward"
        ? "route-enter-forward"
        : effectiveTransitionDirection === "none" || isTabRootPath(pathname)
          ? "route-enter-none"
          : "route-enter-forward";

  return (
    <div className="route-stack-viewport relative h-full w-full overflow-hidden">
      <div key={location.href} className={`route-stack-view ${animationClass}`}>
        <Outlet />
      </div>
    </div>
  );
}
