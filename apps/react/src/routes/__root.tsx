import { useEffect, useRef } from "react";
import { createRootRoute, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { bridge } from "@/bridge";
import { canUseMemberOnlyApi, getAccessToken } from "@/api/axios";
import { StackedOutlet } from "@/shared/ui/stacked-outlet";
import { TransitionViewport } from "@/shared/ui/transition-viewport";
import { getBottomSafeAreaPadding, getTopSafeAreaInset } from "@/utils/safeArea";

const BOTTOM_NAV_PATHS = ["/space", "/announcement", "/reservation", "/mypage"];
const PRE_AUTH_PATH_PREFIXES = ["/", "/login", "/signup"];

/** 상단 safe area를 검정으로 할 경로 (해당 경로 및 하위 경로 포함) */
const TOP_SAFE_AREA_BLACK_PREFIXES = ["/space", "/announcement"];

/** 상단 safe area를 검정으로 할 경로 (해당 경로만, 하위 경로 제외) */
const TOP_SAFE_AREA_BLACK_EXACT = ["/mypage", "/reservation"];

/** 검정 제외 경로 (prefix 매칭 후 여기 있으면 흰색) */
const TOP_SAFE_AREA_BLACK_EXCLUDE_PREFIXES = ["/space/search", "/announcement/search"];
/** 검정 제외 suffix 경로 (동적 상세 하위 페이지 등) */
const TOP_SAFE_AREA_WHITE_SUFFIXES = ["/population"];

function isTopSafeAreaBlack(pathname: string): boolean {
  if (TOP_SAFE_AREA_BLACK_EXACT.includes(pathname)) return true;
  const matched = TOP_SAFE_AREA_BLACK_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!matched) return false;
  if (TOP_SAFE_AREA_WHITE_SUFFIXES.some((suffix) => pathname.endsWith(suffix))) return false;
  return !TOP_SAFE_AREA_BLACK_EXCLUDE_PREFIXES.some(
    (ex) => pathname === ex || pathname.startsWith(ex + "/")
  );
}

function isPreAuthPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PRE_AUTH_PATH_PREFIXES.some((prefix) =>
    prefix === "/" ? false : pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBottomNav = BOTTOM_NAV_PATHS.includes(pathname);
  const shouldGuardAuthBack = showBottomNav && canUseMemberOnlyApi();
  const latestPathRef = useRef(pathname);
  const latestUrlRef = useRef("");
  const topSafeAreaColor = isTopSafeAreaBlack(pathname) ? "#000000" : "#FFFFFF";
  const topSafeAreaInset = getTopSafeAreaInset();
  const bottomNavPadding = getBottomSafeAreaPadding("12px");

  // Expo WebView 내부일 때 네이티브 상단 SafeArea 색상 동기화
  useEffect(() => {
    if (
      typeof bridge?.isNativeMethodAvailable === "function" &&
      bridge.isNativeMethodAvailable("setTopSafeAreaColor")
    ) {
      bridge.setTopSafeAreaColor(topSafeAreaColor).catch(() => {});
    }
  }, [topSafeAreaColor]);

  useEffect(() => {
    if (!shouldGuardAuthBack || typeof window === "undefined") return;

    latestPathRef.current = pathname;
    latestUrlRef.current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }, [pathname, shouldGuardAuthBack]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      if (!canUseMemberOnlyApi()) return;

      const previousPath = latestPathRef.current;
      const previousUrl = latestUrlRef.current;
      const nextPath = window.location.pathname;
      if (!BOTTOM_NAV_PATHS.includes(previousPath) || !isPreAuthPath(nextPath)) return;

      const nextState =
        window.history.state && typeof window.history.state === "object" ? window.history.state : {};

      window.history.pushState(nextState, "", previousUrl);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    <div className="min-h-screen w-full bg-bg-light-gray">
      {/* 상단 safe area만 채우는 영역 (페이지별 색상) */}
      <div
        aria-hidden
        style={{
          height: topSafeAreaInset,
          minHeight: topSafeAreaInset,
          backgroundColor: topSafeAreaColor,
        }}
      />
      <div className="no-bounce-scroll mx-auto flex h-screen w-full max-w-(--common-max-width) flex-col overflow-hidden bg-white">
        <main className="no-bounce-scroll relative min-h-0 w-full flex-1 overflow-hidden">
          <TransitionViewport>
            <StackedOutlet />
          </TransitionViewport>
        </main>
        {showBottomNav && (
          <div
            className="min-h-(--bottom-nav-h) shrink-0"
            style={{ paddingBottom: bottomNavPadding }}
            aria-hidden
          />
        )}
        {showBottomNav && <BottomNav bottomPadding={bottomNavPadding} />}
      </div>
      <Toaster position="bottom-center" richColors closeButton={false} />
    </div>
  );
}
