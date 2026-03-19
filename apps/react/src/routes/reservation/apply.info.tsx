import { useRef, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BackHeader } from "@/components/BackHeader";
import { createReservation, queryKeys, uploadImageList } from "@/api";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/reservation/apply/info")({
  validateSearch: (search: Record<string, unknown>) => ({
    spaceId: Number(search.spaceId) || 0,
    startDate: String(search.startDate ?? ""),
    endDate: String(search.endDate ?? ""),
  }),
  component: ReservationApplyInfoPage,
});

const inputBase =
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-white px-4 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black)";

const textareaBase =
  "typo-body2 w-full min-h-[120px] resize-none rounded-lg border border-(--gray-light) bg-white px-4 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:border-(--dice-black) focus:outline-none focus:ring-1 focus:ring-(--dice-black)";

function ReservationApplyInfoPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventName, setEventName] = useState("");
  const [eventContent, setEventContent] = useState("");
  const [extraRequest, setExtraRequest] = useState("");

  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservation.all });
      navigate({ to: "/reservation", state: { transitionDirection: "back" } });
    },
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({
        to: "/reservation/apply",
        search: { spaceId: search.spaceId, startDate: search.startDate, endDate: search.endDate },
        state: { transitionDirection: "back" },
      });
    }
  };

  const handleSubmit = async () => {
    const trimmedName = eventName.trim();
    const trimmedContent = eventContent.trim();
    if (!trimmedName || !trimmedContent) {
      window.alert("팝업스토어 행사 이름과 행사 내용을 입력해주세요.");
      return;
    }
    if (!search.spaceId || !search.startDate || !search.endDate) {
      window.alert("예약 정보가 없습니다. 처음부터 다시 진행해주세요.");
      return;
    }

    let fileUrls: string[] = [];
    const files = fileInputRef.current?.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        try {
          const { imageUrls } = await uploadImageList(imageFiles);
          fileUrls = imageUrls ?? [];
        } catch {
          window.alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
          return;
        }
      }
    }

    createMutation.mutate({
      spaceId: search.spaceId,
      startDate: search.startDate,
      endDate: search.endDate,
      eventName: trimmedName,
      eventContent: trimmedContent,
      fileList: fileUrls,
      etcRequest: extraRequest.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <BackHeader title="예약 신청" onBack={handleBack} />
      <div className="px-5 pt-5">
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="whitespace-pre-line typo-h2 text-(--dice-black)">
              {"진행할 팝업스토어에 대한\n정보를 입력해주세요"}
            </h2>
            <p className="whitespace-pre-line typo-body2 text-(--gray-deep)">
              {
                "호스트가 팝업스토어의 성격과 목적을 정확히 이해하고,\n원활하게 공간 예약 여부를 검토할 수 있도록 도와줘요"
              }
            </p>
          </section>

          <section className="space-y-2">
            <label htmlFor="event-name" className="block typo-caption1 text-(--gray-dark)">
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

          <section className="space-y-2">
            <label htmlFor="event-content" className="block typo-caption1 text-(--gray-dark)">
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

          <section className="space-y-2">
            <span className="block typo-caption1 text-(--gray-dark)">행사 내용 관련 첨부 파일</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="typo-body2 text-(--gray-dark) file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-0.5 file:typo-caption1 file:text-(--dice-black)"
            />
          </section>

          <section className="space-y-2">
            <label htmlFor="extra-request" className="block typo-caption1 text-(--gray-dark)">
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
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto w-full max-w-(--common-max-width) bg-dice-white px-5 pt-4"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full rounded-lg bg-dice-black px-4 py-[15.5px] typo-button1 text-dice-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {createMutation.isPending ? "신청 중..." : "예약 신청"}
        </button>
      </div>
    </div>
  );
}
