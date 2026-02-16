import type { GetReservationListsResponse, ReservationItem } from "./response";

const SPACE_IMG =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop";

function baseItem(overrides: Partial<ReservationItem> & { status: string }): ReservationItem {
  return {
    reservationId: 1,
    messageRoomId: 1,
    spaceName: "성수동 갤러리 팝업 맷멀",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    message: "팝업 진행 일정 문의드립니다.",
    status: overrides.status,
    city: "서울",
    district: "성동구",
    capacity: 30,
    size: 50,
    totalPrice: 360000,
    spaceImage: SPACE_IMG,
    ...overrides,
  };
}

function toPage(content: ReservationItem[], page = 0, size = 10): GetReservationListsResponse {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    size,
    number: page,
    first: true,
    last: true,
  };
}

/** 백엔드 호출 실패 시 대기중(PENDING) 목록 UI 확인용 더미 */
export const DUMMY_RESERVATION_LIST_PENDING: GetReservationListsResponse = toPage([
  baseItem({
    reservationId: 101,
    spaceName: "성수동 갤러리 팝업 맷멀",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    message: "팝업 진행 일정 문의드립니다.",
    status: "PENDING",
    city: "서울",
    district: "성동구",
    totalPrice: 360000,
    spaceImage: SPACE_IMG,
  }),
  baseItem({
    reservationId: 102,
    messageRoomId: 2,
    spaceName: "합정 스튜디오 A",
    startDate: "2025-03-10",
    endDate: "2025-03-12",
    message: "촬영 일정으로 예약 요청드립니다.",
    status: "PENDING",
    city: "서울",
    district: "마포구",
    totalPrice: 600000,
    spaceImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=450&fit=crop",
  }),
  baseItem({
    reservationId: 103,
    messageRoomId: 3,
    spaceName: "홍대 공유 오피스",
    startDate: "2025-03-15",
    endDate: "2025-03-16",
    message: "데이패스 이용 희망합니다.",
    status: "PENDING",
    city: "서울",
    district: "마포구",
    totalPrice: 80000,
    spaceImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=450&fit=crop",
  }),
]);

/** 백엔드 호출 실패 시 예약 완료(ACCEPT) 목록 UI 확인용 더미 */
export const DUMMY_RESERVATION_LIST_ACCEPT: GetReservationListsResponse = toPage([
  baseItem({
    reservationId: 201,
    messageRoomId: 4,
    spaceName: "성수동 갤러리 팝업 맷멀",
    startDate: "2025-02-20",
    endDate: "2025-02-22",
    message: "팝업 진행 일정 문의드립니다.",
    status: "ACCEPT",
    city: "서울",
    district: "성동구",
    totalPrice: 360000,
    spaceImage: SPACE_IMG,
  }),
  baseItem({
    reservationId: 202,
    messageRoomId: 5,
    spaceName: "이태원 라운지 B",
    startDate: "2025-02-25",
    endDate: "2025-02-26",
    message: "브랜드 팝업 예약 완료 요청드립니다.",
    status: "ACCEPT",
    city: "서울",
    district: "용산구",
    totalPrice: 450000,
    spaceImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=450&fit=crop",
  }),
]);

/** 백엔드 호출 실패 시 예약 취소(CANCEL) 목록 UI 확인용 더미 */
export const DUMMY_RESERVATION_LIST_CANCEL: GetReservationListsResponse = toPage([
  baseItem({
    reservationId: 301,
    messageRoomId: 6,
    spaceName: "합정 스튜디오 A",
    startDate: "2025-02-01",
    endDate: "2025-02-03",
    message: "일정 변경으로 취소 요청드립니다.",
    status: "CANCEL",
    city: "서울",
    district: "마포구",
    totalPrice: 600000,
    spaceImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=450&fit=crop",
  }),
  baseItem({
    reservationId: 302,
    messageRoomId: 7,
    spaceName: "강남 쇼룸 C",
    startDate: "2025-02-05",
    endDate: "2025-02-07",
    message: "호스트 사정으로 취소되었습니다.",
    status: "CANCEL",
    city: "서울",
    district: "강남구",
    totalPrice: 800000,
    spaceImage: "https://images.unsplash.com/photo-1497366811353-6870744d2b16?w=800&h=450&fit=crop",
  }),
]);

const DUMMY_BY_STATUS: Record<string, GetReservationListsResponse> = {
  PENDING: DUMMY_RESERVATION_LIST_PENDING,
  ACCEPT: DUMMY_RESERVATION_LIST_ACCEPT,
  CANCEL: DUMMY_RESERVATION_LIST_CANCEL,
};

/** 상태별 더미 목록 반환 (API 실패 시 사용) */
export function getDummyReservationList(status: string): GetReservationListsResponse {
  return (
    DUMMY_BY_STATUS[status] ?? toPage([baseItem({ status, reservationId: 0, messageRoomId: 0 })])
  );
}
