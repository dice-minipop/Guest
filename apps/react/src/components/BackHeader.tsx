import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";

export type BackHeaderProps = {
  /** 헤더 중앙 제목 (centerSlot 없을 때 사용) */
  title?: string;
  /** 헤더 중앙 커스텀 영역 (탭 등, title보다 우선) */
  centerSlot?: ReactNode;
  /** 헤더 우측 영역 */
  rightSlot?: ReactNode;
  /** 뒤로가기 클릭 핸들러 */
  onBack: () => void;
  /** 뒤로가기 버튼 aria-label */
  backButtonLabel?: string;
} & Omit<ComponentPropsWithoutRef<"header">, "children">;

/**
 * Running-Rife 스타일 통합 뒤로가기 헤더.
 * 3열 그리드: 뒤로가기 | 제목/centerSlot | rightSlot
 */
export const BackHeader = forwardRef<HTMLElement, BackHeaderProps>(
  (
    {
      title,
      centerSlot,
      rightSlot,
      onBack,
      backButtonLabel = "뒤로가기",
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={`fixed top-0 left-1/2 z-10 w-full max-w-(--common-max-width) -translate-x-1/2 grid grid-cols-3 items-center bg-dice-white ${className ?? ""}`}
        style={{
          paddingTop: "max(var(--spacing-12), env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--spacing-12)",
          paddingLeft: "3px",
          paddingRight: "3px",
          ...style,
        }}
        {...props}
      >
        <div className="flex items-center justify-start">
          <button
            type="button"
            aria-label={backButtonLabel}
            onClick={onBack}
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center typo-subtitle1 text-dice-black transition-opacity hover:opacity-80 active:opacity-70"
          >
            <ArrowRightIcon className="size-24" aria-hidden />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {centerSlot ?? (
            <h1 className="typo-subtitle3 truncate text-center text-dice-black pointer-events-none">
              {title ?? ""}
            </h1>
          )}
        </div>
        <div className="flex min-w-0 items-center justify-end">
          {rightSlot ?? <div className="h-12 w-12 shrink-0" aria-hidden />}
        </div>
      </header>
    );
  }
);

BackHeader.displayName = "BackHeader";
