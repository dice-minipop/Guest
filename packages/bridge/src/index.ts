import type { Bridge, BridgeStore } from "@webview-bridge/types";

/**
 * 네이티브(Expo) ↔ 웹(React) 간 브릿지 메서드 시그니처.
 * Expo 앱에서 구현하고, React 앱에서 linkBridge<AppBridge>로 사용합니다.
 */
export interface AppBridgeMethods extends Bridge {
  getMessage(): Promise<string>;
  sum(a: number, b: number): Promise<number>;
  openInAppBrowser(url: string): Promise<void>;
  getBridgeVersion(): Promise<string>;
  /** 웹에서 현재 라우트에 따라 상단 SafeArea 배경색 전달 (#000000 | #FFFFFF) */
  setTopSafeAreaColor(color: string): Promise<void>;
  /** 웹에서 현재 라우트에 따라 제스처 뒤로가기 허용 (탭 루트에서는 false) */
  setBackGestureEnabled(enabled: boolean): Promise<void>;
}

export type AppBridge = BridgeStore<AppBridgeMethods>;
