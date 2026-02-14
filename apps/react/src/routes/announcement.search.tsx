import { createFileRoute, Navigate } from "@tanstack/react-router";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";

export const Route = createFileRoute("/announcement/search")({
  component: AnnouncementSearchPage,
});

function AnnouncementSearchPage() {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      Navigate({ to: "/announcement" });
    }
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <header className="relative flex shrink-0 items-center justify-between py-12 px-[3px]">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-(--dice-black) transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="뒤로가기"
        >
          <ArrowRightIcon className="h-24 w-24" aria-hidden />
        </button>

        <h1 className="typo-subtitle3 absolute left-0 right-0 text-center text-(--dice-black) pointer-events-none">
          지원공고 검색
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>
    </div>
  );
}
