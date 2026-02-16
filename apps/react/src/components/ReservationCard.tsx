import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReservationItem } from "../api";
import { cancelReservation, queryKeys } from "../api";
import MessageIcon from "@/assets/icons/Message/message.svg?react";

const IMAGE_SIZE = 120;

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}. ${mm}. ${dd}`;
  } catch {
    return dateStr;
  }
}

function getRentalDays(startStr: string, endStr: string): number {
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(diff) + 1);
  } catch {
    return 0;
  }
}

export interface ReservationCardProps {
  item: ReservationItem;
  /** 예약 취소 성공 시 호출 (목록 갱신용) */
  onCancelSuccess?: () => void;
}

export function ReservationCard({ item, onCancelSuccess }: ReservationCardProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => cancelReservation(item.reservationId),
    onSuccess: () => {
      onCancelSuccess?.();
      queryClient.invalidateQueries({ queryKey: queryKeys.reservation.all });
    },
  });

  const address = [item.city, item.district].filter(Boolean).join(" ") || "위치 정보 없음";
  const dateRange = `${formatDateShort(item.startDate)} ~ ${formatDateShort(item.endDate)}`;
  const days = getRentalDays(item.startDate, item.endDate);
  const formatPrice = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "-");
  const sizeLabel = item.size != null ? `${item.size}㎡` : "-";
  const isCanceled = item.status === "CANCEL";

  return (
    <li className="w-full list-none">
      <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        {/* 주소 | 사진, 공간 이름 | 사진, 사이즈 | 사진 */}
        <div className="flex gap-12 p-16">
          <div className="flex min-w-0 flex-1 flex-col gap-4 mt-8">
            <span className="typo-caption1 truncate text-gray-medium dark:text-gray-semilight">
              {address}
            </span>
            <h2 className="typo-subtitle1 line-clamp-2 text-dice-black dark:text-white">
              {item.spaceName}
            </h2>
            <p className="typo-caption2 text-gray-light dark:text-gray-semilight mt-4">
              {sizeLabel}
            </p>
          </div>
          <div
            className="relative shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-600"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
          >
            {item.spaceImage ? (
              <img src={item.spaceImage} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>

        {/* 희망 대여 기간 */}
        <div className="flex items-center justify-between px-16 mb-4">
          <span className="typo-caption1 text-gray-semilight dark:text-gray-semilight">
            희망 대여 기간
          </span>
          <span className="typo-caption1">
            <span className="text-gray-deep">{dateRange}</span>
            {days > 0 && <span className="text-system-purple"> ({days}일)</span>}
          </span>
        </div>

        {/* 총 대여 금액 */}
        <div className="flex items-center justify-between px-16">
          <span className="typo-caption1 text-gray-semilight dark:text-gray-semilight">
            총 대여 금액
          </span>
          <span className="typo-subtitle1 text-dice-black dark:text-white">
            {formatPrice(item.totalPrice)}
          </span>
        </div>

        {/* 하단 버튼: 상태별 */}
        <div className="flex gap-8 p-16">
          {isCanceled ? (
            <button
              type="button"
              disabled
              className="flex flex-1 items-center justify-center rounded-lg border border-gray-light bg-gray-light py-12 typo-button1 text-white transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            >
              예약 신청 취소됨
            </button>
          ) : (
            <>
              <Link
                to="/mypage/messages/$roomId"
                params={{ roomId: String(item.messageRoomId) }}
                className="flex items-center justify-center rounded-lg border border-stroke-eee bg-white p-3.5"
              >
                <MessageIcon className="size-24" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex flex-1 items-center justify-center rounded-lg border border-stroke-eee bg-white py-12 typo-button1 text-gray-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
              >
                {cancelMutation.isPending ? "처리 중..." : "예약 신청 취소"}
              </button>
            </>
          )}
        </div>
      </article>
    </li>
  );
}
