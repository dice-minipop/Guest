import { apiClient } from "../axios";
import type { UpdateInfoRequest } from "./request";
import type {
  GetGuestInfoResponse,
  GetLikedAnnouncementListsResponse,
  GetLikedSpaceListsResponse,
  UpdateInfoResponse,
} from "./response";

// 게스트 정보 수정 (인증 필요)
export async function updateGuestInfo(data: UpdateInfoRequest): Promise<UpdateInfoResponse> {
  const response = await apiClient.post<UpdateInfoResponse>("/v1/guest/update", data);
  return response.data;
}

// 공간 좋아요 목록 조회 (인증 필요)
export async function getLikedSpaceLists(
  page?: number,
  size?: number
): Promise<GetLikedSpaceListsResponse> {
  const response = await apiClient.get<GetLikedSpaceListsResponse>("/v1/guest/like/space", {
    params: { page, size },
  });
  return response.data;
}

// 공고 좋아요 목록 조회 (인증 필요)
export async function getLikedAnnouncementLists(
  page?: number,
  size?: number
): Promise<GetLikedAnnouncementListsResponse> {
  const response = await apiClient.get<GetLikedAnnouncementListsResponse>(
    "/v1/guest/like/announcement",
    { params: { page, size } }
  );
  return response.data;
}

// 게스트 정보 조회 (인증 필요)
export async function getGuestInfo(): Promise<GetGuestInfoResponse> {
  const response = await apiClient.get<GetGuestInfoResponse>("/v1/guest/info");
  return response.data;
}

export type { UpdateInfoRequest } from "./request";
export type {
  UpdateInfoResponse,
  GetLikedSpaceListsResponse,
  LikedAnnouncement,
  GetLikedAnnouncementListsResponse,
  GetGuestInfoResponse,
} from "./response";
