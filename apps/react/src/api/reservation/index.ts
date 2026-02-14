import { apiClient } from "../axios";
import type { CreateReservationRequest } from "./request";
import type {
  CreateReservationResponse,
  GetImpossibleDateListsResponse,
  GetReservationListsResponse,
} from "./response";

// 예약 (인증 필요)
export async function createReservation(
  data: CreateReservationRequest
): Promise<CreateReservationResponse> {
  const response = await apiClient.post<CreateReservationResponse>("/v2/reservation/reserve", data);
  return response.data;
}

// 예약 취소 (인증 필요)
export async function cancelReservation(reservationId: number): Promise<void> {
  await apiClient.post("/v1/reservation/cancel", null, {
    params: { reservationId },
  });
}

// 예약 목록 조회 (인증 필요)
export async function getReservationLists(
  status: string,
  sort?: string,
  page?: number,
  size?: number
): Promise<GetReservationListsResponse> {
  const response = await apiClient.get<GetReservationListsResponse>("/v2/reservation/list", {
    params: { status, sort, page, size },
  });
  return response.data;
}

// 예약 불가능 날짜 조회 (인증 필요)
export async function getImpossibleDateLists(
  spaceId: number
): Promise<GetImpossibleDateListsResponse> {
  const response = await apiClient.get<GetImpossibleDateListsResponse>(
    "/v1/reservation/available-dates",
    { params: { spaceId } }
  );
  return response.data;
}

export type { CreateReservationRequest } from "./request";
export type {
  CreateReservationResponse,
  ReservationItem,
  GetReservationListsResponse,
  GetImpossibleDateListsResponse,
} from "./response";
