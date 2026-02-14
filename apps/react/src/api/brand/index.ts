import { apiClient } from "../axios";
import type { CreateBrandRequest, UpdateBrandRequest } from "./request";
import type { GetMyBrandInfoResponse } from "./response";

// 브랜드 수정 (인증 필요)
export async function updateBrand(brandId: number, data: UpdateBrandRequest): Promise<void> {
  await apiClient.post(`/v1/brand/update/${brandId}`, data);
}

// 브랜드 생성 (인증 필요)
export async function createBrand(data: CreateBrandRequest): Promise<void> {
  await apiClient.post("/v1/brand/create", data);
}

// 자신의 브랜드 조회 (인증 필요)
export async function getMyBrandInfo(): Promise<GetMyBrandInfoResponse> {
  const response = await apiClient.get<GetMyBrandInfoResponse>("/v1/brand/list");
  return response.data;
}

export type { CreateBrandRequest, UpdateBrandRequest } from "./request";
export type { BrandInfo, GetMyBrandInfoResponse } from "./response";
