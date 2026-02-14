import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";

export const Route = createFileRoute("/mypage/messages")({
  component: MypageMessagesPage,
});

function MypageMessagesPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/mypage" });
    }
  };

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderHeight(el.offsetHeight);
    });
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-dice-white px-(--spacing-screen-x)">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-10 bg-dice-white dark:border-neutral-700 dark:bg-neutral-800"
        style={{
          paddingTop: "max(var(--spacing-12), env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--spacing-12)",
          paddingLeft: "3px",
          paddingRight: "3px",
        }}
      >
        <div className="relative flex min-h-[44px] w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="w-[48px] h-[48px] flex shrink-0 items-center justify-center typo-subtitle1 text-white transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="뒤로가기"
          >
            <ArrowRightIcon className="size-24" aria-hidden />
          </button>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>
      <div aria-hidden style={{ minHeight: headerHeight || 56 }} />

      <h1 className="typo-h1 text-dice-black mt-24">호스트와의 쪽지함</h1>
    </div>
  );
}
