import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import LikeLightgray from "@/assets/icons/like/like-lightgray.svg?react";
import LikePurple from "@/assets/icons/like/like-purple.svg?react";
import { canUseMemberOnlyApi } from "@/api/axios";
import { toggleLikeAnnouncement } from "@/api/like";
import { queryKeys } from "@/api/queryKeys";
import type { AnnouncementItem } from "../api";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getDday(endIso: string): { label: string; days: number } {
  try {
    const end = new Date(endIso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const label = days > 0 ? `D-${days}` : days === 0 ? "D-Day" : `D+${-days}`;
    return { label, days };
  } catch {
    return { label: "", days: 0 };
  }
}

export interface AnnouncementCardProps {
  item: AnnouncementItem;
}

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const location = [item.city, item.district].filter(Boolean).join("") || "위치 정보 없음";
  const dateRange = `${formatDate(item.recruitmentStartAt)} ~ ${formatDate(item.recruitmentEndAt)}`;
  const dday = getDday(item.recruitmentEndAt);
  const ddayBgClass =
    dday.days < 0
      ? "bg-system-green text-white"
      : dday.days <= 30
        ? "bg-system-red text-white"
        : "bg-system-green text-white";

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeAnnouncement(item.id),
    onSuccess: (data) => {
      setIsLiked(data.isLike);
      setLikeCount((prev) => (data.isLike ? prev + 1 : Math.max(0, prev - 1)));
      queryClient.invalidateQueries({ queryKey: queryKeys.announcement.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.guest.all });
    },
    onError: () => {
      setIsLiked(item.isLiked);
      setLikeCount(item.likeCount);
    },
  });

  return (
    <li className="w-full list-none">
      <Link
        to="/announcement/$id"
        params={{ id: String(item.id) }}
        state={{ transitionDirection: "forward" }}
        className="block w-full rounded-xl border space-y-2 border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        {/* 위치·제목 섹션 | 좋아요 버튼 좌우 정렬 */}
        <div className="flex items-start justify-between gap-3">
          <section className="min-w-0 flex-1">
            <span className="typo-caption1 block truncate text-gray-medium">{location}</span>
            <h2 className="mt-1 typo-subtitle1 truncate text-dice-black">{item.title}</h2>
          </section>
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (likeMutation.isPending) return;
                if (!canUseMemberOnlyApi()) {
                  alert("회원 전용 기능입니다. 로그인 후 이용해 주세요.");
                  return;
                }
                likeMutation.mutate();
              }}
              className="rounded-full p-1 transition-colors hover:bg-neutral-100 disabled:opacity-50"
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              disabled={likeMutation.isPending}
            >
              {isLiked ? <LikePurple className="h-6 w-6" /> : <LikeLightgray className="h-6 w-6" />}
            </button>
            <span
              className={
                isLiked ? "typo-caption2 text-system-purple" : "typo-caption2 text-gray-semilight"
              }
            >
              {likeCount}
            </span>
          </div>
        </div>

        {/* 대상 | 날짜 + D-day 배지 */}
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-1 typo-caption2 text-gray-light">
          <span>{item.target || "대상 미정"} 대상</span>
          <span>|</span>
          <span>{dateRange}</span>
          {dday.label && (
            <span
              className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 typo-caption2 ${ddayBgClass}`}
            >
              {dday.label}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
