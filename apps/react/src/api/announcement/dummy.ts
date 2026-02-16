import type { GetAnnouncementDetailDataResponse, GetAnnouncementListsResponse } from "./response";

const now = new Date();
const start = new Date(now);
start.setDate(start.getDate() + 7);
const end = new Date(start);
end.setDate(end.getDate() + 30);

function iso(d: Date) {
  return d.toISOString();
}

/** 백엔드 미연동 시 공고 목록 UI 확인용 더미 데이터 */
export const DUMMY_ANNOUNCEMENT_LIST: GetAnnouncementListsResponse = {
  content: [
    {
      id: 1,
      title: "성수 팝업 스토어 일일 대여 모집",
      city: "서울",
      district: "성동구",
      hostName: "갤러리 맷멀",
      target: "브랜드",
      recruitmentStartAt: iso(start),
      recruitmentEndAt: iso(end),
      likeCount: 18,
      isLiked: false,
      status: "RECRUITING",
    },
    {
      id: 2,
      title: "합정 스튜디오 촬영 공간 단기 임대",
      city: "서울",
      district: "마포구",
      hostName: "스튜디오 A",
      target: "촬영팀",
      recruitmentStartAt: iso(start),
      recruitmentEndAt: iso(end),
      likeCount: 42,
      isLiked: true,
      status: "RECRUITING",
    },
    {
      id: 3,
      title: "홍대 공유 오피스 데이패스 모집",
      city: "서울",
      district: "마포구",
      hostName: "코워킹 스페이스",
      target: "전체",
      recruitmentStartAt: iso(start),
      recruitmentEndAt: iso(end),
      likeCount: 8,
      isLiked: false,
      status: "RECRUITING",
    },
  ],
  totalPages: 1,
  totalElements: 3,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

/** 백엔드 미연동 시 공고 상세 UI 확인용 더미 데이터 */
export function getDummyAnnouncementDetail(id: number): GetAnnouncementDetailDataResponse {
  return {
    id,
    title: "성수 팝업 스토어 일일 대여 모집",
    city: "서울",
    district: "성동구",
    address: "서울 성동구 연무장길 42",
    hostName: "갤러리 맷멀",
    target: "브랜드",
    imageUrls: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop",
    ],
    recruitmentStartAt: iso(start),
    recruitmentEndAt: iso(end),
    details:
      "성수동 한적한 골목의 갤러리형 팝업 공간을 일일 대여합니다. 전시, 팝업 스토어, 촬영 등에 활용 가능합니다.",
    contactNumber: "02-1234-5678",
    websiteUrl: "https://example.com",
    isLiked: false,
    likeCount: 18,
    status: "RECRUITING",
  };
}
