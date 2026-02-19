import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/notifications/")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage" });
    }
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <header
        className="fixed top-0 left-1/2 z-10 w-full max-w-(--common-max-width) -translate-x-1/2 bg-dice-white"
        style={{
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

          <h1 className="absolute left-0 right-0 text-center typo-subtitle3 text-dice-black pointer-events-none">
            알림
          </h1>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="px-(--spacing-screen-x) pt-24 pb-8">
        <p className="typo-body2 text-gray-deep">아직 도착한 알림이 없습니다.</p>
      </div>
    </div>
  );
}
