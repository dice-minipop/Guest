import { apiClient } from "../axios";
import type { ToggleLikeResponse } from "./response";

// 공간 좋아요 토글 (인증 필요)
export async function toggleLikeSpace(id: number): Promise<ToggleLikeResponse> {
  const response = await apiClient.post<ToggleLikeResponse>(`/v1/like/like/space/${id}`);
  return response.data;
}

// 공고 좋아요 토글 (인증 필요)
export async function toggleLikeAnnouncement(id: number): Promise<ToggleLikeResponse> {
  const response = await apiClient.post<ToggleLikeResponse>(`/v1/like/like/announcement/${id}`);
  return response.data;
}

export type { ToggleLikeResponse } from "./response";
