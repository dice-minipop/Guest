import type { PaginationDTO } from "../../types/page";

export interface AnnouncementItem {
  id: number;
  title: string;
  city: string;
  district: string;
  hostName: string;
  target: string;
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  likeCount: number;
  isLiked: boolean;
  status: string;
}

export type GetAnnouncementListsResponse = PaginationDTO<AnnouncementItem>;

export interface GetAnnouncementDetailDataResponse {
  id: number;
  title: string;
  city: string;
  district: string;
  address: string;
  hostName: string;
  target: string;
  imageUrls: string[];
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  details: string;
  contactNumber: string;
  websiteUrl: string;
  isLiked: boolean;
  likeCount: number;
  status: string;
}
