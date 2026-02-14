export interface SendMessageRequest {
  content: string;
  type: string;
}

export interface ReportChatRoomRequest {
  messageRoomId: number;
  reason: string;
}

export interface CreateChatRoomRequest {
  spaceId: number;
}
