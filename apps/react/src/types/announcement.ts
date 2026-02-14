/** 공고 목록 필터 (POST body) */
export interface AnnouncementFilterDTO {
  city: string;
  district: string;
  targets: string[];
  status: string;
  sortBy?: string;
}
