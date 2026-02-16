/**
 * 웹에서 전달한 AccessToken 보관.
 * FCM 토큰 서버 등록 시 Authorization 헤더에 사용합니다.
 */
let current: string | null = null;

export function getAccessToken(): string | null {
  return current;
}

export function setAccessToken(token: string | null): void {
  current = token;
}
