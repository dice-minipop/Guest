import type { GetMessageDetailDataResponse, MessageRoom } from "./response";

/** 백엔드 미연동 시 쪽지방 목록 UI 확인용 더미 데이터 */
export const DUMMY_MESSAGE_ROOMS: MessageRoom[] = [
  {
    id: 1,
    spaceName: "성수 카페 레트로",
    spaceImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop",
    lastMessage: "예약 가능한 날짜 알려주시면 바로 확인해 드릴게요.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
  },
  {
    id: 2,
    spaceName: "합정 스튜디오 A",
    spaceImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop",
    lastMessage: "네, 다음 주 월요일 오후 2시로 예약 완료했습니다.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 0,
  },
  {
    id: 3,
    spaceName: "홍대 공유 오피스",
    spaceImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop",
    lastMessage: "문의 주셔서 감사합니다. 보증금은 입장 시 받고 있습니다.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 1,
  },
];

/** 백엔드 미연동 시 쪽지방 상세(채팅) UI 확인용 더미 데이터 */
export function getDummyMessageDetail(roomId: number): GetMessageDetailDataResponse {
  const now = Date.now();
  const base: GetMessageDetailDataResponse["content"] = [
    {
      id: 1,
      content: "안녕하세요, 해당 공간 예약 문의드립니다.",
      type: "TEXT",
      senderName: "게스트",
      senderId: 100,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isLoginUsersMessage: true,
    },
    {
      id: 2,
      content: "안녕하세요. 말씀해 주신 날짜 확인해 보겠습니다.",
      type: "TEXT",
      senderName: "호스트",
      senderId: 1,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5).toISOString(),
      isLoginUsersMessage: false,
    },
    {
      id: 3,
      content: "예약 가능한 날짜 알려주시면 바로 확인해 드릴게요.",
      type: "TEXT",
      senderName: "호스트",
      senderId: 1,
      createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
      isLoginUsersMessage: false,
    },
  ];
  return {
    content: base.map((m) => ({ ...m, id: m.id + roomId * 10 })),
    totalPages: 1,
    totalElements: base.length,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };
}
