import { apiClient } from "../axios";
import type { UploadImageListResponse, UploadImageResponse } from "./response";

/**
 * Web: File[] (input[type=file], drag-drop 등)
 * FormData에 append 시 Content-Type은 브라우저가 boundary와 함께 설정함.
 */
function buildImageFormData(files: File[]): FormData {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append("images", file, file.name || `image_${index}.png`);
  });
  return formData;
}

// 다중 이미지 업로드 (인증 필요)
export async function uploadImageList(files: File[]): Promise<UploadImageListResponse> {
  const formData = buildImageFormData(files);
  const response = await apiClient.post<UploadImageListResponse>("/v1/s3/uploads", formData);
  return response.data;
}

// 단일 이미지 업로드 (인증 필요, 단일 URL 반환)
export async function uploadImage(files: File[]): Promise<UploadImageResponse> {
  const formData = buildImageFormData(files);
  const response = await apiClient.post<UploadImageResponse>("/v1/s3/upload", formData);
  return response.data;
}

export type { UploadImageListResponse, UploadImageResponse } from "./response";
