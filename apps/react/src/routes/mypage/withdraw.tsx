import { useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import ArrowDownIcon from "@/assets/icons/Arrow/down.svg?react";
import { BackHeader } from "@/components/BackHeader";
import { BottomSheet } from "@/components/BottomSheet";
import { backWithHistory } from "@/shared/navigation/back";

const WITHDRAWAL_REASONS = [
  "앱 방문을 잘 하지 않아요",
  "원하는 팝업 공간을 찾기 어려웠어요",
  "지원 공고가 부족하거나 활용하기 어려웠어요",
  "예약 및 일정 관리 기능이 불편했어요",
  "호스트(게스트)와의 소통이 원활하지 않았어요",
  "찜하기 기능이 불편했어요",
] as const;

export const Route = createFileRoute("/mypage/withdraw")({
  component: MypageWithdrawPage,
});

function MypageWithdrawPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  const handleSubmit = () => {
    // TODO: 탈퇴 제출 로직
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <BackHeader title="탈퇴하기" onBack={handleBack} />
      <div aria-hidden style={{ minHeight: 72 }} />
      <div
        className="px-(--spacing-screen-x) pt-32 space-y-32"
        style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}
      >
        <section className="space-y-8">
          <h2 className="typo-subtitle2 whitespace-pre-line text-(--dice-black)">
            OO님과 이별한다니{"\n"}너무 아쉽습니다
          </h2>
          <p className="typo-body1 text-gray-medium">
            회원님께서 탈퇴를 원하신다니 저희 서비스가 많이 부족하고 미흡했나 봅니다. 더 나은
            서비스를 제공하는 플랫폼이 될 수 있도록 노력하겠습니다.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="typo-subtitle2 text-(--dice-black)">탈퇴 전 확인 부탁드립니다</h2>
          <p className="typo-body1 text-gray-medium">
            계정을 삭제하시면 예약, 프로필, 찜, 쪽지 등 모든 활동 정보가 삭제됩니다. 계정 삭제 후
            30일간 재가입할 수 없습니다.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="typo-subtitle3 whitespace-pre-line text-(--dice-black)">
            더 나은 다이스가 될 수 있도록{"\n"}탈퇴하시는 이유를 알려주시면 감사하겠습니다
          </h2>
          <button
            type="button"
            onClick={() => setReasonSheetOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-light bg-dice-white py-12 px-16 text-left typo-body2 text-(--dice-black) transition-colors hover:bg-neutral-100"
          >
            <span className={selectedReason ? "text-gray-dark" : "text-gray-medium"}>
              {selectedReason ?? "탈퇴하시는 이유가 무엇인가요?"}
            </span>
            <ArrowDownIcon className="h-24 w-24 shrink-0 text-neutral-400" aria-hidden />
          </button>
        </section>
      </div>

      <BottomSheet
        open={reasonSheetOpen}
        onClose={() => setReasonSheetOpen(false)}
        sheetTitle="탈퇴 사유 선택"
        sheetDescription="회원 탈퇴 사유를 선택해 주세요"
        content={
          <div className="overflow-y-auto py-24 px-5 pb-20">
            <h3 className="typo-caption1 mb-3 text-gray-dark">탈퇴 사유</h3>
            <div className="flex flex-col gap-2">
              {WITHDRAWAL_REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reason);
                      setReasonSheetOpen(false);
                    }}
                    className={`w-full rounded-lg p-16 text-left typo-subtitle3 transition-colors ${
                      selected ? "bg-bg-light-gray text-dice-black" : "bg-white text-gray-medium"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {/* 하단 고정 버튼 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm gap-12 bg-dice-white px-(--spacing-screen-x) pt-16"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-12">
          <button
            type="button"
            onClick={handleBack}
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-16 py-[15.5px] typo-button1 text-(--dice-black) transition-colors hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="min-w-0 flex-1 rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors hover:opacity-90"
          >
            제출
          </button>
        </div>
      </div>
    </div>
  );
}
