import { Link, useRouterState } from "@tanstack/react-router";

import SpaceDark from "@/assets/icons/BottomNav/space-dark.svg?react";
import SpaceGray from "@/assets/icons/BottomNav/space-gray.svg?react";
import AnnouncementDark from "@/assets/icons/BottomNav/announcement-dark.svg?react";
import AnnouncementGray from "@/assets/icons/BottomNav/announcement-gray.svg?react";
import ReservationDark from "@/assets/icons/BottomNav/reservation-dark.svg?react";
import ReservationGray from "@/assets/icons/BottomNav/reservation-gray.svg?react";
import MypageDark from "@/assets/icons/BottomNav/mypage-dark.svg?react";
import MypageGray from "@/assets/icons/BottomNav/mypage-gray.svg?react";

const TAB_ROUTES = [
  {
    to: "/space",
    label: "팝업공간",
    IconActive: SpaceDark,
    IconInactive: SpaceGray,
  },
  {
    to: "/announcement",
    label: "지원공고",
    IconActive: AnnouncementDark,
    IconInactive: AnnouncementGray,
  },
  {
    to: "/reservation",
    label: "예약관리",
    IconActive: ReservationDark,
    IconInactive: ReservationGray,
  },
  {
    to: "/mypage",
    label: "나의정보",
    IconActive: MypageDark,
    IconInactive: MypageGray,
  },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-100 flex min-h-(--bottom-nav-h) items-center justify-around gap-1 border-t border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-900"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      {TAB_ROUTES.map(({ to, label, IconActive, IconInactive }) => {
        const isActive = pathname === to;
        const Icon = isActive ? IconActive : IconInactive;
        return (
          <Link
            key={to}
            to={to}
            replace
            state={{ skipTransition: true }}
            className={`flex flex-1 flex-col items-center justify-center gap-8 py-8 no-underline transition-colors ${
              isActive ? "text-gray-dark" : "text-gray-medium"
            } hover:text-gray-dark dark:hover:text-gray-dark`}
          >
            <Icon className="size-24 shrink-0" aria-hidden />
            <span className="typo-button2">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
