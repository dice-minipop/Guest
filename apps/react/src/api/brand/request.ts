export interface CreateBrandRequest {
  name: string;
  description: string;
  logoUrl: string;
  imageUrls: string[];
  homepageUrl: string;
  targetGender?: string[];
  targetAgeGroup?: string[];
}

export interface UpdateBrandRequest {
  name: string;
  description: string;
  logoUrl: string;
  imageUrls: string[];
  homepageUrl: string;
  targetGender?: string[];
  targetAgeGroup?: string[];
}
