/**
 * 네이버 지도 API v3 전역 타입 선언
 * @see https://navermaps.github.io/maps.js.ncp/docs/
 */
declare namespace naver {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: Record<string, unknown>;
      draggable?: boolean;
      scrollWheel?: boolean;
      pinchZoom?: boolean;
    }

    class Map {
      constructor(mapDiv: string | HTMLElement, mapOptions?: MapOptions);
      setCenter(center: LatLng): void;
      setZoom(zoom: number): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface ImageIcon {
      url: string;
      size?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: string | ImageIcon;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    const Position: {
      TOP_LEFT: unknown;
      TOP_CENTER: unknown;
      TOP_RIGHT: unknown;
      LEFT_CENTER: unknown;
      CENTER: unknown;
      RIGHT_CENTER: unknown;
      BOTTOM_LEFT: unknown;
      BOTTOM_CENTER: unknown;
      BOTTOM_RIGHT: unknown;
    };
  }
}
