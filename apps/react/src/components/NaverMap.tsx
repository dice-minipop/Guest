import { useEffect, useRef, useState } from "react";
import markerIconUrl from "@/assets/marker.svg?url";

const NMF_SCRIPT_ID = "naver-maps-script";
const SCRIPT_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";

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
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_NMFClientId as string | undefined;
  const noClientId = !clientId;

  useEffect(() => {
    if (noClientId) return;

    if (document.getElementById(NMF_SCRIPT_ID)) {
      queueMicrotask(() => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = NMF_SCRIPT_ID;
    script.src = `${SCRIPT_URL}?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setError("지도 로드에 실패했습니다.");
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(NMF_SCRIPT_ID);
      if (el) el.remove();
    };
  }, [clientId, noClientId]);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || typeof naver === "undefined") return;

    const center = new naver.maps.LatLng(latitude, longitude);
    const map = new naver.maps.Map(mapRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      zoomControlOptions: interactive ? { position: naver.maps.Position.TOP_RIGHT } : undefined,
      draggable: interactive,
      scrollWheel: interactive,
      pinchZoom: interactive,
    });

    new naver.maps.Marker({
      position: center,
      map,
      title,
      icon: {
        url: markerIconUrl,
        size: new naver.maps.Size(32, 32),
        origin: new naver.maps.Point(0, 0),
        anchor: new naver.maps.Point(16, 32),
      },
    });

    return () => {
      // 지도 인스턴스 정리
    };
  }, [scriptLoaded, latitude, longitude, title, zoom, interactive]);

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
