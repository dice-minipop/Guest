import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";

export const Route = createFileRoute("/reservation/apply/info")({
  component: ReservationApplyInfoPage,
});

const inputBase =
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-white px-16 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black) dark:bg-neutral-800 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-500";

const textareaBase =
  "typo-body2 w-full min-h-[120px] resize-y appearance-none rounded-lg border border-(--gray-light) bg-white px-16 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black) dark:bg-neutral-800 dark:border-neutral-600 dark:text-white dark:placeholder:text-neutral-500";

function ReservationApplyInfoPage() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [eventContent, setEventContent] = useState("");
  const [extraRequest, setExtraRequest] = useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/reservation/apply" });
    }
  };

  const handleSubmit = () => {
    // TODO: 예약 신청 제출 로직
  };

  return (
    <div className="min-h-screen bg-dice-white dark:bg-neutral-900">
      <header className="relative flex shrink-0 items-center justify-between px-[3px] py-12">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-(--dice-black) transition-colors hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700"
          aria-label="뒤로가기"
        >
          <ArrowRightIcon className="h-24 w-24" aria-hidden />
        </button>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center typo-subtitle3 text-(--dice-black) dark:text-white">
          예약 신청
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="px-(--spacing-screen-x) pt-5">
        <div className="space-y-24">
          <section className="space-y-8">
            <h2 className="whitespace-pre-line typo-h2 text-(--dice-black) dark:text-white">
              {"진행할 팝업스토어에 대한\n정보를 입력해주세요"}
            </h2>
            <p className="whitespace-pre-line typo-body2 text-(--gray-deep) dark:text-neutral-400">
              {
                "호스트가 팝업스토어의 성격과 목적을 정확히 이해하고,\n원활하게 공간 예약 여부를 검토할 수 있도록 도와줘요"
              }
            </p>
          </section>

          <section className="space-y-8">
            <label
              htmlFor="event-name"
              className="block typo-caption1 text-(--gray-dark) dark:text-white"
            >
              팝업스토어 행사 이름<span className="text-(--system-red)">*</span>
            </label>
            <input
              id="event-name"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="팝업스토어 행사 이름을 입력해주세요"
              className={inputBase}
            />
          </section>

          <section className="space-y-8">
            <label
              htmlFor="event-content"
              className="block typo-caption1 text-(--gray-dark) dark:text-white"
            >
              행사 내용<span className="text-(--system-red)">*</span>
            </label>
            <textarea
              id="event-content"
              value={eventContent}
              onChange={(e) => setEventContent(e.target.value)}
              placeholder="팝업 공간을 대여해주는 호스트와 신뢰할 수 있는 거래를 위해 행사 내용을 1~2문장으로 짧게 설명해주세요"
              className={textareaBase}
            />
          </section>

          <section className="space-y-8">
            <span className="block typo-caption1 text-(--gray-dark) dark:text-white">
              행사 내용 관련 첨부 파일
            </span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="typo-body2 text-(--gray-dark) file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-16 file:py-2 file:typo-caption1 file:text-(--dice-black) dark:file:bg-neutral-700 dark:file:text-white"
            />
          </section>

          <section className="space-y-8">
            <label
              htmlFor="extra-request"
              className="block typo-caption1 text-(--gray-dark) dark:text-white"
            >
              기타 요청사항 <span className="text-(--gray-semilight)">(선택)</span>
            </label>
            <textarea
              id="extra-request"
              value={extraRequest}
              onChange={(e) => setExtraRequest(e.target.value)}
              placeholder="협의가 필요한 사항이나 문의하실 내용이 있으시면 작성해주세요"
              className={textareaBase}
            />
          </section>
        </div>
        {/* 하단 고정 버튼에 가리지 않도록 스크롤 여백 */}
        <div aria-hidden style={{ minHeight: "calc(100px + env(safe-area-inset-bottom))" }} />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm bg-dice-white px-(--spacing-screen-x) pt-16 dark:bg-neutral-900"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors hover:opacity-90 dark:bg-white dark:text-dice-black"
        >
          예약 신청
        </button>
      </div>
    </div>
  );
}
