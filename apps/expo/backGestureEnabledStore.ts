/**
 * 웹에서 호출한 "제스처 뒤로가기 허용 여부".
 * 탭 루트(space, announcement, reservation, mypage)에서는 false, 하위 경로에서만 true.
 */
const DEFAULT = false;

let current = DEFAULT;
const listeners = new Set<() => void>();

export function getBackGestureEnabled(): boolean {
  return current;
}

export function setBackGestureEnabled(enabled: boolean): void {
  if (current === enabled) return;
  current = enabled;
  listeners.forEach((l) => l());
}

export function subscribeBackGestureEnabled(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
