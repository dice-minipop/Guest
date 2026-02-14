/** 공간 목록 조회 응답 아이템 */
export interface SpaceItem {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  imageUrl: string | null;
  pricePerDay: number;
  discountPrice: number;
  discountRate: number;
  size: number;
  /** 면적(평) */
  square: number;
  isActivated: boolean;
  isLiked: boolean;
  likeCount: number;
  badge: string | null;
  description?: string;
  logoUrl?: string;
  imageUrls?: string[];
  [key: string]: unknown;
}

/** 공간 필터 (목록 POST body) */
export interface SpaceFilterDTO {
  city: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  maxCapacity: number;
  sortBy: string;
}

/** 공간 상세 시설·집기 한 항목 (FacilityInfoDto) */
export interface FacilityInfoItem {
  /** API/하이픈 키 (key 또는 name으로 내려올 수 있음) */
  key?: string;
  name?: string;
  number: number;
  description?: string;
}

/** SpaceInfoDtoV2 - 가장 가까운 역 */
export interface NearestSubwayDto {
  lineNumber?: string | number;
  stationName?: string;
  distance?: number;
}

/** SpaceInfoDtoV2 - 분석(타깃) 정보 (선택 사용) */
export interface AnalysisPersonDto {
  [key: string]: unknown;
}

/**
 * 공간 상세 조회 응답 (SpaceInfoDtoV2 기준)
 * - Java primitive (int, long) → 필수 number
 * - Java wrapper / Entity 필드 → nullable → optional
 */
export interface SpaceDetailItem {
  id: number;
  name: string;

  /** nullable */
  nearestSubway?: NearestSubwayDto | null;
  /** nullable */
  analysis?: AnalysisPersonDto | null;

  /** nullable */
  imageUrls?: string[] | null;
  /** HH:mm:ss */
  openingTime?: string | null;
  /** HH:mm:ss */
  closingTime?: string | null;

  size: number;
  /** nullable */
  tags?: string[] | null;

  pricePerDay: number;
  discountRate: number;
  discountPrice: number;

  /** 공간 상세 소개. nullable (DTO: details) */
  details?: string | null;
  /** 프론트 호환용 (details와 동일 값 매핑 가능) */
  description?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  detailAddress?: string | null;
  contactNumber?: string | null;
  notices?: string[] | null;

  likeCount: number;
  isLiked: boolean;
  messageRoomId?: number | null;
  isActivated?: boolean | null;
  facilityInfos?: FacilityInfoItem[] | null;

  /** DTO에는 없음. API/프론트 호환용 */
  logoUrl?: string | null;
  capacity?: number | null;
  homepageUrl?: string | null;
}
