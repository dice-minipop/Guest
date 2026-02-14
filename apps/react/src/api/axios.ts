import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

const createBaseClient = () =>
  axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

/** 인증 필요 요청용 (Authorization 헤더 자동 첨부) */
export const apiClient = createBaseClient();

/** 비인증 요청용 (로그인, 회원가입, 이메일/휴대폰 검증 등) */
export const guestApiClient = createBaseClient();

// 토큰 헬퍼
function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.access);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.refresh);
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEYS.access, accessToken);
  localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
}

/** 액세스/리프레시 토큰 모두 삭제 (로그아웃·세션 만료 시) */
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

/** 재발급 API 응답 (서버에 따라 루트 또는 token 래핑) */
type ReissuePayload =
  | { accessToken: string; refreshToken: string }
  | { token: { accessToken: string; refreshToken: string } };

function normalizeReissueResponse(data: ReissuePayload): {
  accessToken: string;
  refreshToken: string;
} {
  if ("token" in data && data.token) {
    return data.token;
  }
  return data as { accessToken: string; refreshToken: string };
}

/** 401 시 또는 앱 로드 시 refreshToken으로 재발급 요청 (Authorization 헤더 없이 호출) */
async function reissueWithRefreshToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log("[auth] reissue: refreshToken 없음");
    throw new Error("NO_REFRESH_TOKEN");
  }
  console.log("[auth] reissue: POST /v1/auth/reissue 요청");
  const { data } = await guestApiClient.post<ReissuePayload>("/v1/auth/reissue", { refreshToken });
  console.log("[auth] reissue: 응답 raw", data);
  return normalizeReissueResponse(data);
}

/**
 * 앱 로드 시 호출. refreshToken이 있으면 재발급 후 새 토큰 저장.
 * 재발급 실패 시 토큰 삭제 후 /login으로 이동.
 * @returns 재발급을 시도해 성공했으면 true, refreshToken 없으면 false (실패 시 redirect로 resolve 안 함)
 */
export function refreshTokensOnLoad(): Promise<boolean> {
  console.log("[auth] refreshTokensOnLoad: 시작", {
    hasRefresh: !!getRefreshToken(),
    hasAccess: !!getAccessToken(),
  });
  if (!getRefreshToken()) {
    console.log("[auth] refreshTokensOnLoad: refreshToken 없음 → 스킵");
    return Promise.resolve(false);
  }
  return reissueWithRefreshToken()
    .then((res) => {
      setTokens(res.accessToken, res.refreshToken);
      console.log("[auth] refreshTokensOnLoad: 재발급 성공, 토큰 저장됨");
      return true;
    })
    .catch((e) => {
      console.log("[auth] refreshTokensOnLoad: 재발급 실패 → /login 이동", e);
      clearTokens();
      window.location.href = "/login";
      return false;
    });
}

/** 재발급 진행 중인 Promise (동시 401 시 한 번만 재발급 호출) */
let refreshPromise: Promise<string> | null = null;

// apiClient: 요청 인터셉터 — 토큰 첨부
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 시 토큰 재발급 후 재시도, 실패 시 로그인 페이지로
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const url = config?.url ?? error.config?.url;

    if (status === 401) {
      console.log("[auth] 401 수신", { url, _retry: config._retry });
    }

    if (status !== 401 || config._retry) {
      if (status === 401) {
        console.log("[auth] 401 처리: 재시도 아님 → clearTokens 후 reject");
        clearTokens();
      }
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.log("[auth] 401: refreshToken 없음 → /login 이동");
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        console.log("[auth] 401: 재발급 시작 (새 요청)");
        refreshPromise = reissueWithRefreshToken().then(
          (res) => {
            setTokens(res.accessToken, res.refreshToken);
            console.log("[auth] 401: 재발급 성공 → 원래 요청 재시도");
            return res.accessToken;
          },
          (e) => {
            refreshPromise = null;
            console.log("[auth] 401: 재발급 실패 → /login 이동", e);
            clearTokens();
            window.location.href = "/login";
            throw e;
          }
        );
      } else {
        console.log("[auth] 401: 이미 재발급 중 → 대기 후 재시도");
      }

      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      config._retry = true;
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient.request(config);
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

export default apiClient;
