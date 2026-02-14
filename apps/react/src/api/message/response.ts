import type { PaginationDTO } from "../../types/page";

export interface MessageData {
  id: number;
  content: string;
  type: string;
  senderName: string;
  senderId: number;
  createdAt: string;
  isLoginUsersMessage: boolean;
}

export type GetMessageDetailDataResponse = PaginationDTO<MessageData>;

export interface MessageRoom {
  id: number;
  spaceName: string;
  spaceImage: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export type GetMessageListsResponse = MessageRoom[];
