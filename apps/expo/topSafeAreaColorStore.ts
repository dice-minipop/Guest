/**
 * 웹에서 호출한 상단 SafeArea 색상.
 * bridge.setTopSafeAreaColor()가 이 값을 갱신하고, Index 화면이 구독해 UI에 반영합니다.
 */
const DEFAULT_COLOR = "#FFFFFF";

let currentColor = DEFAULT_COLOR;
const listeners = new Set<() => void>();

export function getTopSafeAreaColor(): string {
  return currentColor;
}

export function setTopSafeAreaColor(color: string): void {
  if (currentColor === color) return;
  currentColor = color;
  listeners.forEach((l) => l());
}

export function subscribeTopSafeAreaColor(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
