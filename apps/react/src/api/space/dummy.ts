import type { SpaceDetailItem, SpaceItem } from "../../types/space";
import type { GetSpaceListsResponse, SpacePopulationAnalysisResponse } from "./response";

const IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop";

/** 백엔드 미연동 시 공간 목록 UI 확인용 더미 데이터 */
export const DUMMY_SPACE_LIST: GetSpaceListsResponse = {
  content: [
    {
      id: 1,
      name: "성수동 연무장길 갤러리 팝업 맷멀",
      address: "서울 성동구 연무장길 42",
      city: "서울",
      district: "성동구",
      imageUrl: IMG,
      pricePerDay: 150000,
      discountPrice: 120000,
      discountRate: 20,
      size: 50,
      square: 15,
      isActivated: true,
      isLiked: false,
      likeCount: 24,
      badge: "인기",
    },
    {
      id: 2,
      name: "합정 스튜디오 A",
      address: "서울 마포구 양화로 45",
      city: "서울",
      district: "마포구",
      imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=450&fit=crop",
      pricePerDay: 200000,
      discountPrice: 200000,
      discountRate: 0,
      size: 80,
      square: 24,
      isActivated: true,
      isLiked: true,
      likeCount: 31,
      badge: null,
    },
    {
      id: 3,
      name: "홍대 공유 오피스",
      address: "서울 마포구 와우산로 29",
      city: "서울",
      district: "마포구",
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=450&fit=crop",
      pricePerDay: 80000,
      discountPrice: 64000,
      discountRate: 20,
      size: 30,
      square: 9,
      isActivated: true,
      isLiked: false,
      likeCount: 12,
      badge: null,
    },
  ] as SpaceItem[],
  totalPages: 1,
  totalElements: 3,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

export const DUMMY_SPACE_POPULATION_ANALYSIS: SpacePopulationAnalysisResponse = {
  title: "전국 20대 여성 유동인구 상위 5%",
  description: "주로 사진 촬영 목적 방문이 많아요.",
  date: "2026-01-01",
  location: "성수 2동",
  locationCount: 120000,
  areaCount: 80000,
  nationalCount: 30000,
  targets: ["20대", "30대", "여성"],
  ageGroupsCountMan: [100, 150, 200, 250, 300, 350],
  ageGroupsCountWoman: [100, 150, 200, 250, 300, 350],
  dayOfWeekCount: [120, 130, 140, 150, 160, 170, 180],
};

/** 백엔드 미연동 시 공간 상세 UI 확인용 더미 데이터 */
export function getDummySpaceDetail(id: number): SpaceDetailItem {
  const base: SpaceDetailItem = {
    id,
    name: "성수동 연무장길 갤러리 팝업 맷멀",
    imageUrls: [IMG, IMG, IMG],
    openingTime: "09:00:00",
    closingTime: "22:00:00",
    size: 50,
    pricePerDay: 150000,
    discountRate: 20,
    discountPrice: 120000,
    details:
      "성수동 한적한 골목의 갤러리형 팝업 공간입니다. 전시, 촬영, 소규모 이벤트에 적합합니다.",
    description: "성수동 한적한 골목의 갤러리형 팝업 공간입니다.",
    city: "서울",
    district: "성동구",
    address: "서울 성동구 연무장길 42",
    detailAddress: "1층",
    contactNumber: "02-1234-5678",
    likeCount: 24,
    isLiked: false,
    messageRoomId: 1,
    isActivated: true,
    facilityInfos: [
      { name: "의자", number: 20 },
      { name: "테이블", number: 5 },
    ],
    nearestSubway: { lineNumber: "2", stationName: "뚝섬유원지", distance: 500 },
  };
  return { ...base, id };
}
