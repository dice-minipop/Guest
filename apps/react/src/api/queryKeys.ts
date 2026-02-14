/**
 * TanStack Query key 팩토리
 * 쿼리 키를 중앙에서 관리하여 일관성과 타입 안정성 확보
 */
export const queryKeys = {
  all: ["api"] as const,
  announcement: {
    all: ["api", "announcement"] as const,
    list: (params?: unknown, filter?: unknown) =>
      ["api", "announcement", "list", params, filter] as const,
    detail: (id: number) => ["api", "announcement", "detail", id] as const,
  },
  auth: {
    all: ["api", "auth"] as const,
  },
  brand: {
    all: ["api", "brand"] as const,
    myInfo: ["api", "brand", "myInfo"] as const,
  },
  guest: {
    all: ["api", "guest"] as const,
    info: ["api", "guest", "info"] as const,
    likedSpaces: (params?: { page?: number; size?: number }) =>
      ["api", "guest", "likedSpaces", params] as const,
    likedAnnouncements: (params?: { page?: number; size?: number }) =>
      ["api", "guest", "likedAnnouncements", params] as const,
  },
  like: {
    all: ["api", "like"] as const,
    space: (id: number) => ["api", "like", "space", id] as const,
    announcement: (id: number) => ["api", "like", "announcement", id] as const,
  },
  message: {
    all: ["api", "message"] as const,
    list: ["api", "message", "list"] as const,
    detail: (roomId: number, params?: { page?: number; size?: number }) =>
      ["api", "message", "detail", roomId, params] as const,
  },
  reservation: {
    all: ["api", "reservation"] as const,
    list: (params?: { status: string; sort?: string; page?: number; size?: number }) =>
      ["api", "reservation", "list", params] as const,
    impossibleDates: (spaceId: number) =>
      ["api", "reservation", "impossibleDates", spaceId] as const,
  },
  s3: {
    all: ["api", "s3"] as const,
  },
  space: {
    all: ["api", "space"] as const,
    list: (params?: unknown, filter?: unknown) => ["api", "space", "list", params, filter] as const,
    detail: (id: number) => ["api", "space", "detail", id] as const,
    populationAnalysis: (id: number) => ["api", "space", "populationAnalysis", id] as const,
  },
} as const;
