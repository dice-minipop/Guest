import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";

import ChatGray from "@/assets/icons/PageHeader/chat-gray.svg?react";
import ChatWhite from "@/assets/icons/PageHeader/chat-white.svg?react";
import HeartGray from "@/assets/icons/PageHeader/heart-gray.svg?react";
import HeartWhite from "@/assets/icons/PageHeader/heart-white.svg?react";
import NotificationGray from "@/assets/icons/PageHeader/notification-gray.svg?react";
import NotificationWhite from "@/assets/icons/PageHeader/notification-white.svg?react";
import SearchIcon from "@/assets/icons/PageHeader/search.svg?react";

const MY_PAGE_LIKED = "/mypage/liked";
const MY_PAGE_NOTIFICATIONS = "/mypage/notifications";
const MY_PAGE_MESSAGES = "/mypage/messages";

export type PageHeaderVariant = "space" | "announcement" | "reservation";

type HeaderIconItem = {
  id: "liked" | "notification" | "messages";
  to: string;
  ariaLabel: string;
  IconGray: ComponentType<{ className?: string }>;
  IconWhite: ComponentType<{ className?: string }>;
};

const VARIANT_ICONS: Record<PageHeaderVariant, HeaderIconItem[]> = {
  space: [
    {
      id: "liked",
      to: MY_PAGE_LIKED,
      ariaLabel: "좋아요 목록",
      IconGray: HeartGray,
      IconWhite: HeartWhite,
    },
    {
      id: "notification",
      to: MY_PAGE_NOTIFICATIONS,
      ariaLabel: "알림 목록",
      IconGray: NotificationGray,
      IconWhite: NotificationWhite,
    },
    {
      id: "messages",
      to: MY_PAGE_MESSAGES,
      ariaLabel: "채팅 목록",
      IconGray: ChatGray,
      IconWhite: ChatWhite,
    },
  ],
  announcement: [
    {
      id: "liked",
      to: MY_PAGE_LIKED,
      ariaLabel: "좋아요 목록",
      IconGray: HeartGray,
      IconWhite: HeartWhite,
    },
    {
      id: "notification",
      to: MY_PAGE_NOTIFICATIONS,
      ariaLabel: "알림 목록",
      IconGray: NotificationGray,
      IconWhite: NotificationWhite,
    },
  ],
  reservation: [
    {
      id: "liked",
      to: MY_PAGE_LIKED,
      ariaLabel: "좋아요 목록",
      IconGray: HeartGray,
      IconWhite: HeartWhite,
    },
    {
      id: "notification",
      to: MY_PAGE_NOTIFICATIONS,
      ariaLabel: "알림 목록",
      IconGray: NotificationGray,
      IconWhite: NotificationWhite,
    },
    {
      id: "messages",
      to: MY_PAGE_MESSAGES,
      ariaLabel: "채팅 목록",
      IconGray: ChatGray,
      IconWhite: ChatWhite,
    },
  ],
};

export interface PageHeaderProps {
  /** 헤더에 표시할 제목 (예: 팝업공간, 지원공고, 예약관리) */
  title: string;
  /** 팝업공간 | 지원공고 | 예약관리 — 타이틀 옆 좋아요/알림/채팅 아이콘 구성 */
  variant?: PageHeaderVariant;
  /** 검색 페이지 경로. 지정 시 제목 아래에 검색 페이지로 이동하는 검색바 표시 */
  searchTo?: string;
  /** 검색 링크에 표시할 문구. searchTo 사용 시 함께 지정 가능 */
  searchPlaceholder?: string;
  /** 제목/검색바 아래에 넣을 내용. 없으면 검색바만 또는 제목만 표시 */
  children?: ReactNode;
}

/**
 * 팝업공간, 지원공고, 예약관리 등에서 공통으로 사용하는 상단 고정 헤더.
 * variant 지정 시 타이틀 옆에 좋아요/알림/채팅 아이콘(해당 페이지 목적지), 검색 링크 왼쪽에 search 아이콘.
 */
export function PageHeader({
  title,
  variant,
  searchTo,
  searchPlaceholder = "키워드 검색",
  children,
}: PageHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const icons = variant ? VARIANT_ICONS[variant] : [];

  return (
    <header
      className="sticky top-0 z-10 border-b border-neutral-200 bg-black"
      style={{
        paddingTop: "max(var(--spacing-12), env(safe-area-inset-top, 0px))",
        paddingBottom: "var(--spacing-12)",
        paddingLeft: "max(var(--spacing-screen-x), env(safe-area-inset-left, 0px))",
        paddingRight: "max(var(--spacing-screen-x), env(safe-area-inset-right, 0px))",
      }}
    >
      <div className="flex items-center justify-between gap-2 py-4">
        <h1 className="typo-subtitle1 text-white">{title}</h1>
        {icons.length > 0 ? (
          <div className="flex items-center">
            {icons.map(({ to, ariaLabel, IconGray, IconWhite }) => {
              const isActive = pathname === to;
              const Icon = isActive ? IconWhite : IconGray;
              return (
                <Link
                  key={to}
                  to={to}
                  className="rounded-full p-12 transition-opacity hover:opacity-80 active:opacity-70"
                  aria-label={ariaLabel}
                >
                  <Icon className="h-24 w-24 shrink-0" aria-hidden />
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
      {searchTo != null ? (
        <Link
          to={searchTo}
          className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-12 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100"
        >
          <SearchIcon className="h-5 w-5 shrink-0" aria-hidden />
          <span>{searchPlaceholder}</span>
        </Link>
      ) : null}
      {children != null ? <div className="mt-3">{children}</div> : null}
    </header>
  );
}
