import type { PaginationDTO } from "../../types/page";
import type { SpaceItem } from "../../types/space";

export interface UpdateInfoResponse {
  name: string;
  email: string;
  phone: string;
  brandList: {
    id: number;
    name: string;
    logoUrl: string;
  }[];
}

export type GetLikedSpaceListsResponse = PaginationDTO<SpaceItem>;

export interface LikedAnnouncement {
  id: number;
  title: string;
  city: string;
  district: string;
  hostName: string;
  target: string;
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  isLiked: boolean;
  likeCount: number;
  status: string;
}

export type GetLikedAnnouncementListsResponse = PaginationDTO<LikedAnnouncement>;

export interface GetGuestInfoResponse {
  name: string;
  email: string;
  phone: string;
  brandList: {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
    imageUrls: string[];
  }[];
}
