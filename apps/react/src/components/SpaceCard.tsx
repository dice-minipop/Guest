import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import LikeLightgray from "@/assets/icons/like/like-lightgray.svg?react";
import LikePurple from "@/assets/icons/like/like-purple.svg?react";
import { toggleLikeSpace } from "../api/like";
import { queryKeys } from "../api/queryKeys";
import type { SpaceItem } from "../types/space";

const IMAGE_ASPECT = 335 / 188; // 335*188 비율

export interface SpaceCardProps {
  item: SpaceItem;
}

export function SpaceCard({ item }: SpaceCardProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeSpace(item.id),
    onSuccess: (data) => {
      setIsLiked(data.isLike);
      setLikeCount((prev) => (data.isLike ? prev + 1 : Math.max(0, prev - 1)));
      queryClient.invalidateQueries({ queryKey: queryKeys.space.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.all });
    },
    onError: () => {
      // 실패 시 로컬 상태 롤백
      setIsLiked(item.isLiked);
      setLikeCount(item.likeCount);
    },
  });

  const imageUrl = item.imageUrl ?? item.imageUrls?.[0] ?? item.logoUrl ?? null;
  const location = item.address || `${item.city} ${item.district}`.trim() || "위치 정보 없음";
  const formatPrice = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "-");

  return (
    <li className="w-full list-none">
      <Link
        to="/space/$id"
        params={{ id: String(item.id) }}
        className="block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        {/* 335*188 비율 이미지 */}
        <div
          className="relative w-full overflow-hidden bg-neutral-200 dark:bg-neutral-600"
          style={{ aspectRatio: IMAGE_ASPECT }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        <div className="flex flex-col gap-1 p-16">
          {/* 위치·이름·크기 묶음 ↔ 좋아요 버튼 (좌우 정렬) */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 flex flex-col">
              <span className="typo-caption1 truncate text-gray-medium dark:text-gray-semilight">
                {location}
              </span>
              <h2 className="typo-subtitle1 truncate text-dice-black dark:text-white mb-2">
                {item.name}
              </h2>
              <p className="typo-caption2 text-gray-light dark:text-gray-semilight">
                {item.size > 0 || item.square > 0
                  ? `${item.size}m² (${item.square}평)`
                  : "면적 정보 없음"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (likeMutation.isPending) return;
                  likeMutation.mutate();
                }}
                className="rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
                disabled={likeMutation.isPending}
              >
                {isLiked ? (
                  <LikePurple className="h-24 w-24" />
                ) : (
                  <LikeLightgray className="h-24 w-24" />
                )}
              </button>
              <span
                className={
                  isLiked
                    ? "typo-caption2 text-system-purple"
                    : "typo-caption2 text-gray-semilight dark:text-gray-semilight"
                }
              >
                {likeCount}
              </span>
            </div>
          </div>

          {/* 1일 대여 / 할인 (우측 정렬) */}
          <div className="mt-1 flex flex-col items-end gap-0.5">
            <div className="typo-caption1">
              <span className="text-gray-dark dark:text-white">1일 대여 </span>
              {item.discountRate > 0 ? (
                <span className="text-gray-semilight dark:text-gray-semilight line-through">
                  {formatPrice(item.pricePerDay)}
                </span>
              ) : (
                <span className="text-gray-semilight dark:text-gray-semilight">
                  {formatPrice(item.pricePerDay)}
                </span>
              )}
            </div>
            {item.discountRate > 0 && (
              <div className="flex items-center gap-1">
                <span className="typo-subtitle2 text-system-purple">{item.discountRate}%</span>
                <span className="typo-subtitle1 text-dice-black dark:text-white">
                  {formatPrice(item.discountPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
