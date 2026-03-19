import { useEffect, useRef, useState } from "react";
import markerIconSvg from "@/assets/marker.svg?raw";
import { bridge } from "@/bridge";

const NMF_SCRIPT_ID = "naver-maps-script";
const SCRIPT_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";
const NAVER_MAPS_READY_TIMEOUT_MS = 10_000;
const NAVER_MAPS_READY_POLL_MS = 50;
const MAP_INIT_RETRY_DELAYS_MS = [0, 120, 300, 700];
const MARKER_STABILIZE_DELAYS_MS = [0, 120, 300, 700];

let naverMapsScriptPromise: Promise<void> | null = null;
const markerIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerIconSvg)}`;

function isNaverMapsReady(): boolean {
  return typeof naver !== "undefined" && typeof naver.maps !== "undefined";
}

function waitForNaverMapsReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const checkReady = () => {
      if (isNaverMapsReady()) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= NAVER_MAPS_READY_TIMEOUT_MS) {
        reject(new Error("NAVER_MAPS_READY_TIMEOUT"));
        return;
      }

      window.setTimeout(checkReady, NAVER_MAPS_READY_POLL_MS);
    };

    checkReady();
  });
}

function loadNaverMapsScript(clientId: string): Promise<void> {
  if (isNaverMapsReady()) {
    return Promise.resolve();
  }

  if (naverMapsScriptPromise) {
    return naverMapsScriptPromise;
  }

  naverMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const handleReady = () => {
      waitForNaverMapsReady().then(resolve).catch(reject);
    };

    const existingScript = document.getElementById(NMF_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      handleReady();
      return;
    }

    const script = document.createElement("script");
    script.id = NMF_SCRIPT_ID;
    script.src = `${SCRIPT_URL}?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = handleReady;
    script.onerror = () => reject(new Error("NAVER_MAPS_SCRIPT_LOAD_ERROR"));
    document.head.appendChild(script);
  }).catch((error) => {
    naverMapsScriptPromise = null;
    throw error;
  });

  return naverMapsScriptPromise;
}

interface NaverMapProps {
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
  /** 마커/지도 제목 (접근성) */
  title?: string;
  /** 지도 높이 (px). 미설정 시 부모 높이 100% (전체 화면용) */
  height?: number;
  /** 초기 줌 레벨 (기본 16) */
  zoom?: number;
  /** 확대/축소/이동 가능 여부 (기본 true, 썸네일용 false) */
  interactive?: boolean;
  /** 마커 스타일. auto는 WebView에서 기본 마커, 웹에서는 커스텀 마커 */
  markerStyle?: "auto" | "custom" | "default";
}

/**
 * 네이버 지도 컴포넌트
 * - VITE_NMFClientId로 지도 API 로드
 * - 위치에 마커 표시
 */
export function NaverMap({
  latitude,
  longitude,
  title = "위치",
  height,
  zoom = 16,
  interactive = true,
  markerStyle = "auto",
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_NMFClientId as string | undefined;
  const noClientId = !clientId;
  const isNativeWebView =
    typeof bridge?.isNativeMethodAvailable === "function" &&
    bridge.isNativeMethodAvailable("getBridgeVersion");
  const useCustomMarker =
    markerStyle === "custom" || (markerStyle === "auto" && !isNativeWebView);

  useEffect(() => {
    if (noClientId) return;
    let cancelled = false;

    loadNaverMapsScript(clientId)
      .then(() => {
        if (!cancelled) {
          setError(null);
          setScriptLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("지도 로드에 실패했습니다.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, noClientId]);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || !isNaverMapsReady()) return;

    const center = new naver.maps.LatLng(latitude, longitude);
    const mapElement = mapRef.current;
    let map: naver.maps.Map | null = null;
    let marker: naver.maps.Marker | null = null;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    const timeoutIds: number[] = [];

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        callback();
      }, delay);
      timeoutIds.push(timeoutId);
    };

    const createMarker = (targetMap: naver.maps.Map) =>
      new naver.maps.Marker({
        position: center,
        map: targetMap,
        title,
        ...(useCustomMarker
          ? {
              icon: {
                url: markerIconUrl,
                size: new naver.maps.Size(32, 32),
                origin: new naver.maps.Point(0, 0),
                anchor: new naver.maps.Point(16, 32),
              },
            }
          : {}),
      });

    const stabilizeMarker = () => {
      if (cancelled || !map || !marker) return;
      const mapsApi = naver.maps as typeof naver.maps & {
        Event?: {
          trigger: (target: naver.maps.Map, eventName: string) => void;
        };
      };
      mapsApi.Event?.trigger?.(map, "resize");
      map.setCenter(center);
      marker.setMap(null);
      marker = createMarker(map);
    };

    const createMapAndMarker = () => {
      map = new naver.maps.Map(mapElement, {
        center,
        zoom,
        zoomControl: interactive,
        zoomControlOptions: interactive ? { position: naver.maps.Position.TOP_RIGHT } : undefined,
        draggable: interactive,
        scrollWheel: interactive,
        pinchZoom: interactive,
      });

      marker = createMarker(map);

      MARKER_STABILIZE_DELAYS_MS.forEach((delay) => {
        scheduleTimeout(() => {
          stabilizeMarker();
        }, delay);
      });
    };

    const initializeMap = (attemptIndex: number) => {
      if (cancelled) return;

      const rect = mapElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        const nextDelay = MAP_INIT_RETRY_DELAYS_MS[attemptIndex + 1];
        if (nextDelay != null) {
          scheduleTimeout(() => initializeMap(attemptIndex + 1), nextDelay);
        }
        return;
      }

      try {
        if (marker) {
          marker.setMap(null);
          marker = null;
        }
        map = null;
        createMapAndMarker();
      } catch {
        const nextDelay = MAP_INIT_RETRY_DELAYS_MS[attemptIndex + 1];
        if (nextDelay != null) {
          scheduleTimeout(() => initializeMap(attemptIndex + 1), nextDelay);
        }
      }
    };

    initializeMap(0);

    resizeObserver = new ResizeObserver(() => {
      if (map && marker) {
        stabilizeMarker();
        return;
      }

      initializeMap(0);
    });
    resizeObserver.observe(mapElement);

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        scheduleTimeout(() => {
          if (map && marker) {
            stabilizeMarker();
            return;
          }

          initializeMap(0);
        }, 0);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "200px 0px 200px 0px",
      }
    );
    intersectionObserver.observe(mapElement);

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      marker?.setMap(null);
    };
  }, [scriptLoaded, latitude, longitude, title, zoom, interactive, useCustomMarker]);

  const fallbackStyle = height != null ? { height } : { height: "100%" };

  if (noClientId) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-bg-light-gray text-gray-semilight typo-caption1"
        style={fallbackStyle}
      >
        지도 API 키가 설정되지 않았습니다.
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-bg-light-gray text-gray-semilight typo-caption1"
        style={fallbackStyle}
      >
        {error}
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-bg-light-gray text-gray-semilight typo-caption1"
        style={fallbackStyle}
      >
        지도 불러오는 중...
      </div>
    );
  }

  const style = height != null ? { height } : { height: "100%" };

  return (
    <div
      ref={mapRef}
      className="w-full overflow-hidden rounded-lg border border-stroke-eee"
      style={style}
      aria-label={title}
    />
  );
}
