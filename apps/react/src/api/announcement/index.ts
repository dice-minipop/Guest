import { apiClient } from "../axios";
import type { AnnouncementFilterDTO } from "../../types/announcement";
import type { GetAnnouncementDetailDataResponse, GetAnnouncementListsResponse } from "./response";

/** 모집 공고 리스트 조회 (POST + query params) */
export async function getAnnouncementLists(
  params?: {
    keyword?: string;
    page?: number;
    size?: number;
  },
  data?: Partial<AnnouncementFilterDTO>
): Promise<GetAnnouncementListsResponse> {
  const response = await apiClient.post<GetAnnouncementListsResponse>(
    "/v1/announcement/list",
    data ?? {},
    { params: params ?? {} }
  );
  return response.data;
}

/** 모집 공고 상세 조회 */
export async function getAnnouncementDetailData(
  id: number
): Promise<GetAnnouncementDetailDataResponse> {
  const response = await apiClient.get<GetAnnouncementDetailDataResponse>(`/v1/announcement/${id}`);
  return response.data;
}

export type GetAnnouncementListsRequest = AnnouncementFilterDTO;

export type {
  AnnouncementItem,
  GetAnnouncementListsResponse,
  GetAnnouncementDetailDataResponse,
} from "./response";
