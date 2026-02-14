import { apiClient } from "../axios";
import type { SpaceFilterDTO } from "../../types/space";
import type { SpaceDetailItem } from "../../types/space";
import type { GetSpaceListsResponse, SpacePopulationAnalysisResponse } from "./response";

// 공간 필터링 조회 (인증 없이 조회 가능하다고 가정 — 필요 시 guestApiClient로 변경)
export async function getFilteredSpaceLists(
  params?: {
    keyword?: string;
    page?: number;
    size?: number;
  },
  data?: Partial<SpaceFilterDTO>
): Promise<GetSpaceListsResponse> {
  const response = await apiClient.post<GetSpaceListsResponse>("/v2/space/list", data ?? {}, {
    params: params ?? {},
  });
  return response.data;
}

// 공간 상세 조회
export async function getSpaceDetailData(id: number): Promise<SpaceDetailItem> {
  const response = await apiClient.get<SpaceDetailItem>(`/v2/space/${id}`);
  return response.data;
}

// 공간 인구 분석
export async function getSpacePopulationAnalysis(
  id: number
): Promise<SpacePopulationAnalysisResponse> {
  const response = await apiClient.get<SpacePopulationAnalysisResponse>(`/v1/space/${id}/analysis`);
  return response.data;
}

export type GetFilteredSpaceListsRequest = SpaceFilterDTO;

export type { GetSpaceListsResponse, SpacePopulationAnalysisResponse } from "./response";
