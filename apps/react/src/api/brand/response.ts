export interface BrandInfo {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  imageUrls: string[];
  targetGender: string[];
  targetAgeGroup: string[];
}

export type GetMyBrandInfoResponse = BrandInfo[] | [];
