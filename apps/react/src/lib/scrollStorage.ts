const SPACE_SCROLL_STORAGE_KEY = "space-scroll-top";
const SPACE_DETAIL_SCROLL_STORAGE_KEY_PREFIX = "space-detail-scroll-top:";
const SPACE_DETAIL_SCROLL_RESTORE_KEY_PREFIX = "space-detail-scroll-restore:";
const ANNOUNCEMENT_SCROLL_STORAGE_KEY = "announcement-scroll-top";
const RESERVATION_SCROLL_STORAGE_KEY_PREFIX = "reservation-scroll-top:";
const MYPAGE_SCROLL_STORAGE_KEY = "mypage-scroll-top";

export { SPACE_SCROLL_STORAGE_KEY, ANNOUNCEMENT_SCROLL_STORAGE_KEY, MYPAGE_SCROLL_STORAGE_KEY };

export function getSpaceDetailScrollKey(id: string | number) {
  return `${SPACE_DETAIL_SCROLL_STORAGE_KEY_PREFIX}${id}`;
}

function getSpaceDetailScrollRestoreKey(id: string | number) {
  return `${SPACE_DETAIL_SCROLL_RESTORE_KEY_PREFIX}${id}`;
}

export function markSpaceDetailScrollRestore(id: string | number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(getSpaceDetailScrollRestoreKey(id), "1");
}

export function consumeSpaceDetailScrollRestore(id: string | number) {
  if (typeof window === "undefined") return false;

  const key = getSpaceDetailScrollRestoreKey(id);
  const shouldRestore = window.sessionStorage.getItem(key) === "1";
  window.sessionStorage.removeItem(key);
  return shouldRestore;
}

export function getReservationScrollKey(status: string) {
  return `${RESERVATION_SCROLL_STORAGE_KEY_PREFIX}${status}`;
}

/** 로그아웃 시 저장된 스크롤 값을 모두 초기화 */
export function clearScrollStorage(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(SPACE_SCROLL_STORAGE_KEY);
  window.sessionStorage.removeItem(ANNOUNCEMENT_SCROLL_STORAGE_KEY);
  window.sessionStorage.removeItem(MYPAGE_SCROLL_STORAGE_KEY);

  const keysToRemove: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const key = window.sessionStorage.key(i);
    if (
      key?.startsWith(RESERVATION_SCROLL_STORAGE_KEY_PREFIX) ||
      key?.startsWith(SPACE_DETAIL_SCROLL_STORAGE_KEY_PREFIX) ||
      key?.startsWith(SPACE_DETAIL_SCROLL_RESTORE_KEY_PREFIX)
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
}
