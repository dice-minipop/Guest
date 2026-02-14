export interface CreateReservationRequest {
  spaceId: number;
  startDate: string;
  endDate: string;
  eventName: string;
  eventContent: string;
  fileList: string[];
  etcRequest: string;
}
