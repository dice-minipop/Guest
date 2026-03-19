import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import ChatGray from "@/assets/icons/PageHeader/chat-gray.svg?react";
import ChatWhite from "@/assets/icons/PageHeader/chat-white.svg?react";
import HeartGray from "@/assets/icons/PageHeader/heart-gray.svg?react";
import HeartWhite from "@/assets/icons/PageHeader/heart-white.svg?react";
import NotificationGray from "@/assets/icons/PageHeader/notification-gray.svg?react";
import NotificationWhite from "@/assets/icons/PageHeader/notification-white.svg?react";
import SearchIcon from "@/assets/icons/PageHeader/search.svg?react";
import { canUseMemberOnlyApi } from "@/api/axios";
import { useLoginRequiredModal } from "@/hooks/useLoginRequiredModal";

const MY_PAGE_LIKED = "/liked";
const MY_PAGE_ALARMS = "/alarms";
const MY_PAGE_MESSAGES = "/messages";

export type PageHeaderVariant = "space" | "announcement" | "reservation";

type HeaderIconItem = {
  id: "liked" | "alarm" | "messages";
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
      id: "alarm",
      to: MY_PAGE_ALARMS,
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
      id: "alarm",
      to: MY_PAGE_ALARMS,
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
      id: "alarm",
      to: MY_PAGE_ALARMS,
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
  const [stickyRowHeight, setStickyRowHeight] = useState(0);
  const [isSearchHidden, setIsSearchHidden] = useState(false);
  const stickyRowRef = useRef<HTMLDivElement>(null);
  const searchLinkRef = useRef<HTMLAnchorElement>(null);
  const { openLoginRequiredModal, loginRequiredModal } = useLoginRequiredModal();

  useEffect(() => {
    const stickyRow = stickyRowRef.current;
    if (!stickyRow) return;

    const updateStickyRowHeight = () => {
      setStickyRowHeight(stickyRow.getBoundingClientRect().height);
    };

    updateStickyRowHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateStickyRowHeight();
    });

    resizeObserver.observe(stickyRow);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const searchLink = searchLinkRef.current;
    if (searchTo == null || searchLink == null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSearchHidden(!entry?.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: `-${stickyRowHeight}px 0px 0px 0px`,
      }
    );

    observer.observe(searchLink);

    return () => observer.disconnect();
  }, [searchTo, stickyRowHeight]);

  const handleMemberOnlyIconClick = (e: React.MouseEvent, to: string) => {
    const memberOnlyTargets = [MY_PAGE_LIKED, MY_PAGE_ALARMS, MY_PAGE_MESSAGES];
    if (!memberOnlyTargets.includes(to)) return;
    if (canUseMemberOnlyApi()) return;

    e.preventDefault();
    openLoginRequiredModal();
  };

  return (
    <>
      <div
        ref={stickyRowRef}
        className={`sticky top-0 z-20 bg-black ${searchTo == null && children == null ? "border-b border-neutral-200" : ""}`}
        style={{
          paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
        }}
      >
        <div className="flex items-center justify-between gap-0.5 py-1">
          <h1 className="typo-subtitle1 text-white">{title}</h1>
          {icons.length > 0 || searchTo != null ? (
            <div className="flex items-center">
              {searchTo != null ? (
                <Link
                  to={searchTo}
                  state={{ transitionDirection: "forward" }}
                  className={`rounded-full p-3 transition-opacity duration-200 ${
                    isSearchHidden
                      ? "opacity-100 hover:opacity-80 active:opacity-70"
                      : "pointer-events-none opacity-0"
                  }`}
                  aria-label="검색 페이지로 이동"
                  aria-hidden={!isSearchHidden}
                  tabIndex={isSearchHidden ? 0 : -1}
                >
                  <SearchIcon className="h-6 w-6 shrink-0" aria-hidden />
                </Link>
              ) : null}
              {icons.map(({ to, ariaLabel, IconGray, IconWhite }) => {
                const isActive = pathname === to;
                const Icon = isActive ? IconWhite : IconGray;
                return (
                  <Link
                    key={to}
                    to={to}
                    state={{ transitionDirection: "forward" }}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                      handleMemberOnlyIconClick(e, to)
                    }
                    className="rounded-full p-3 transition-opacity hover:opacity-80 active:opacity-70"
                    aria-label={ariaLabel}
                  >
                    <Icon className="h-6 w-6 shrink-0" aria-hidden />
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {searchTo != null || children != null ? (
        <div
          className="relative z-10 border-b border-neutral-200 bg-black pb-5"
          style={{
            paddingLeft: "max(20px, env(safe-area-inset-left, 0px))",
            paddingRight: "max(20px, env(safe-area-inset-right, 0px))",
          }}
        >
          {searchTo != null ? (
            <Link
              ref={searchLinkRef}
              to={searchTo}
              state={{ transitionDirection: "forward" }}
              className="flex items-center gap-0.5 rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100"
            >
              <SearchIcon className="h-5 w-5 shrink-0" aria-hidden />
              <span>{searchPlaceholder}</span>
            </Link>
          ) : null}
          {children != null ? (
            <div className={searchTo != null ? "mt-3" : "pt-1"}>{children}</div>
          ) : null}
        </div>
      ) : null}

      {loginRequiredModal}
    </>
  );
}
