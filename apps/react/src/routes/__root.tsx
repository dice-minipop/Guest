import { useEffect } from "react";
import { createRootRoute, useRouterState } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { bridge } from "@/bridge";
import { getAccessToken } from "@/api/axios";
import { NavigationTransitionProvider } from "@/shared/navigation/transition";
import { StackedOutlet } from "@/shared/ui/stacked-outlet";
import { TransitionViewport } from "@/shared/ui/transition-viewport";

const BOTTOM_NAV_PATHS = ["/space", "/announcement", "/reservation", "/mypage"];

/** 상단 safe area를 검정으로 할 경로 (해당 경로 및 하위 경로 포함) */
const TOP_SAFE_AREA_BLACK_PREFIXES = ["/space", "/announcement"];

/** 상단 safe area를 검정으로 할 경로 (해당 경로만, 하위 경로 제외) */
const TOP_SAFE_AREA_BLACK_EXACT = ["/mypage", "/reservation"];

/** 검정 제외 경로 (prefix 매칭 후 여기 있으면 흰색) */
const TOP_SAFE_AREA_BLACK_EXCLUDE_PREFIXES = ["/space/search", "/announcement/search"];

function isTopSafeAreaBlack(pathname: string): boolean {
  if (TOP_SAFE_AREA_BLACK_EXACT.includes(pathname)) return true;
  const matched = TOP_SAFE_AREA_BLACK_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!matched) return false;
  return !TOP_SAFE_AREA_BLACK_EXCLUDE_PREFIXES.some(
    (ex) => pathname === ex || pathname.startsWith(ex + "/")
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBottomNav = BOTTOM_NAV_PATHS.includes(pathname);
  const topSafeAreaColor = isTopSafeAreaBlack(pathname) ? "#000000" : "#FFFFFF";

  // Expo WebView 내부일 때 네이티브 상단 SafeArea 색상 동기화
  useEffect(() => {
    if (
      typeof bridge?.isNativeMethodAvailable === "function" &&
      bridge.isNativeMethodAvailable("setTopSafeAreaColor")
    ) {
      bridge.setTopSafeAreaColor(topSafeAreaColor).catch(() => {});
    }
  }, [topSafeAreaColor]);

  // 앱에 AccessToken 동기화 (FCM 토큰 등록 등에 사용)
  useEffect(() => {
    if (
      typeof bridge?.isNativeMethodAvailable !== "function" ||
      !bridge.isNativeMethodAvailable("setAccessToken")
    ) {
      return;
    }
    const sync = () => {
      const token = getAccessToken();
      if (token) bridge.setAccessToken(token).catch(() => {});
    };
    sync();
    const clear = () => {
      if (
        typeof bridge?.isNativeMethodAvailable === "function" &&
        bridge.isNativeMethodAvailable("clearAccessToken")
      ) {
        bridge.clearAccessToken().catch(() => {});
      }
    };
    window.addEventListener("auth-token-synced", sync);
    window.addEventListener("auth-token-cleared", clear);
    return () => {
      window.removeEventListener("auth-token-synced", sync);
      window.removeEventListener("auth-token-cleared", clear);
    };
  }, []);

  return (
    <>
      {/* 상단 safe area만 채우는 영역 (페이지별 색상) */}
      <div
        aria-hidden
        style={{
          height: "env(safe-area-inset-top, 0px)",
          minHeight: "env(safe-area-inset-top, 0px)",
          backgroundColor: topSafeAreaColor,
        }}
      />
      <div className="no-bounce-scroll flex h-screen w-full flex-col overflow-hidden">
        <main className="no-bounce-scroll relative min-h-0 w-full flex-1 overflow-hidden">
          <NavigationTransitionProvider>
            <TransitionViewport>
              <StackedOutlet />
            </TransitionViewport>
          </NavigationTransitionProvider>
        </main>
        {showBottomNav && (
          <div
            className="min-h-(--bottom-nav-h) shrink-0"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
            aria-hidden
          />
        )}
        {showBottomNav && <BottomNav />}
      </div>
    </>
  );
}
