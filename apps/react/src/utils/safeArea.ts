import { isAndroid } from "@/utils/platform";

export function getTopSafeAreaInset(): string {
  return isAndroid() ? "0px" : "env(safe-area-inset-top, 0px)";
}

export function getBottomSafeAreaInset(): string {
  return isAndroid() ? "0px" : "env(safe-area-inset-bottom, 0px)";
}

export function getBottomSafeAreaPadding(minPadding: string): string {
  return isAndroid() ? minPadding : `max(${minPadding}, env(safe-area-inset-bottom, 0px))`;
}

export function getBottomSafeAreaSpacer(baseHeight: string): string {
  return isAndroid() ? baseHeight : `calc(${baseHeight} + env(safe-area-inset-bottom, 0px))`;
}

export function getTopSafeAreaPadding(minPadding: string): string {
  return isAndroid() ? minPadding : `max(${minPadding}, env(safe-area-inset-top, 0px))`;
}
