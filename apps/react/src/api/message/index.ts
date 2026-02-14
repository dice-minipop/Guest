import { apiClient } from "../axios";
import type { CreateChatRoomRequest, ReportChatRoomRequest, SendMessageRequest } from "./request";
import type {
  GetMessageDetailDataResponse,
  GetMessageListsResponse,
  MessageRoom,
} from "./response";

// 메시지 상세 조회 (인증 필요)
export async function getMessageDetailData(
  roomId: number,
  page?: number,
  size?: number
): Promise<GetMessageDetailDataResponse> {
  const response = await apiClient.get<GetMessageDetailDataResponse>(`/v1/message/${roomId}`, {
    params: { page, size },
  });
  return response.data;
}

// 메시지 전송 (인증 필요)
export async function sendMessage(roomId: number, data: SendMessageRequest): Promise<void> {
  await apiClient.post(`/v1/message/${roomId}`, data);
}

// 메시지 신고 (인증 필요)
export async function reportChatRoom(data: ReportChatRoomRequest): Promise<void> {
  await apiClient.post("/v1/message/report", data);
}

// 메시지 방 생성 (인증 필요)
export async function createChatRoom(data: CreateChatRoomRequest): Promise<MessageRoom> {
  const response = await apiClient.post<MessageRoom>("/v1/message/create", data);
  return response.data;
}

// 메시지 목록 조회 (인증 필요)
export async function getMessageLists(): Promise<GetMessageListsResponse> {
  const response = await apiClient.get<GetMessageListsResponse>("/v1/message/guest-list");
  return response.data;
}

export type { SendMessageRequest, ReportChatRoomRequest, CreateChatRoomRequest } from "./request";
export type {
  MessageData,
  GetMessageDetailDataResponse,
  MessageRoom,
  GetMessageListsResponse,
} from "./response";
