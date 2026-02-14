import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const location = [item.city, item.district].filter(Boolean).join(" ") || "위치 정보 없음";
  const dateRange = `${formatDate(item.recruitmentStartAt)} ~ ${formatDate(item.recruitmentEndAt)}`;
  const dday = getDday(item.recruitmentEndAt);
  const ddayBgClass =
    dday.days < 0
      ? "bg-green-500/15 text-green-600 dark:bg-green-500/25 dark:text-green-400"
      : dday.days <= 30
        ? "bg-system-red/15 text-system-red dark:bg-system-red/25"
        : "bg-green-500/15 text-green-600 dark:bg-green-500/25 dark:text-green-400";

  return (
    <li className="w-full list-none">
      <Link
        to="/announcement/$id"
        params={{ id: String(item.id) }}
        className="block w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        {/* 위치 | 좋아요 */}
        <div className="flex items-center justify-between">
          <span className="typo-caption2 truncate text-gray-deep dark:text-gray-semilight">
            {location}
          </span>
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked((prev) => !prev);
              }}
              className="rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <svg
                className="h-5 w-5"
                fill={isLiked ? "var(--system-red)" : "none"}
                stroke={isLiked ? "var(--system-red)" : "var(--gray-medium)"}
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
            <span className="typo-caption2 text-gray-deep dark:text-gray-semilight">
              {item.likeCount}
            </span>
          </div>
        </div>

        {/* 이름 */}
        <h2 className="mt-1 typo-subtitle3 truncate text-gray-dark dark:text-white">
          {item.title}
        </h2>

        {/* 대상 | 날짜 + D-day 배지 */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 typo-body2 text-gray-deep dark:text-gray-semilight">
          <span>{item.target || "대상 미정"}</span>
          <span className="text-gray-medium dark:text-gray-deep">|</span>
          <span>{dateRange}</span>
          {dday.label && (
            <span
              className={`inline-flex shrink-0 rounded px-1.5 py-0.5 typo-caption1 font-medium ${ddayBgClass}`}
            >
              {dday.label}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
