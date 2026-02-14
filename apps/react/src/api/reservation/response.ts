import type { PaginationDTO } from "../../types/page";

export interface CreateReservationResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface ReservationItem {
  reservationId: number;
  messageRoomId: number;
  spaceName: string;
  startDate: string;
  endDate: string;
  message: string;
  status: string;
  city: string;
  district: string;
  capacity: number;
  size: number;
  totalPrice: number;
  spaceImage: string;
}

export type GetReservationListsResponse = PaginationDTO<ReservationItem>;

export interface GetImpossibleDateListsResponse {
  reservedDates: {
    startDate: string;
    endDate: string;
  }[];
}
