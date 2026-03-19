import type { Bridge, BridgeStore } from "@webview-bridge/types";

/**
 * 네이티브(Expo) ↔ 웹(React) 간 브릿지 메서드 시그니처.
 * Expo 앱에서 구현하고, React 앱에서 linkBridge<AppBridge>로 사용합니다.
 */
/** 네이티브에서 선택한 이미지 (웹에서 base64 → File 변환용) */
export interface PickedImage {
  base64: string;
  mimeType: string;
  fileName?: string;
}

export interface AppBridgeMethods extends Bridge {
  getMessage(): Promise<string>;
  sum(a: number, b: number): Promise<number>;
  openInAppBrowser(url: string): Promise<void>;
  openExternalUrl(primaryUrl: string, fallbackUrl?: string): Promise<void>;
  getBridgeVersion(): Promise<string>;
  /** 웹에서 현재 라우트에 따라 상단 SafeArea 배경색 전달 (#000000 | #FFFFFF) */
  setTopSafeAreaColor(color: string): Promise<void>;
  /** 웹에서 전달한 AccessToken 저장 (FCM 토큰 등록 등에 사용) */
  setAccessToken(accessToken: string): Promise<void>;
  /** AccessToken 삭제 (로그아웃 시 웹에서 호출) */
  clearAccessToken(): Promise<void>;
  /** 갤러리에서 이미지 선택 (권한 요청 포함). 취소 시 null */
  pickImageFromGallery(): Promise<PickedImage | null>;
  /** 카메라로 촬영 (권한 요청 포함). 취소 시 null */
  pickImageFromCamera(): Promise<PickedImage | null>;
}

export type AppBridge = BridgeStore<AppBridgeMethods>;
