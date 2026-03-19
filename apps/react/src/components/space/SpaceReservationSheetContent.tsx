import { useState } from "react";
import XIcon from "../../assets/icons/x.svg?react";
import FilledPolygonIcon from "../../assets/icons/Polygon/filled-polygon.svg?react";
import PolygonIcon from "../../assets/icons/Polygon/polygon.svg?react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** YYYY-MM-DD */
export type DateString = string;

export interface ReservedDateRange {
  startDate: DateString;
  endDate: DateString;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  while (days.length < totalCells) {
    days.push(null);
  }
  return days;
}

function toDateString(year: number, month: number, day: number): DateString {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD →"25. 01. 26" */
function formatDisplayDate(dateStr: DateString): string {
  const yy = dateStr.slice(2, 4);
  const mm = dateStr.slice(5, 7);
  const dd = dateStr.slice(8, 10);
  return `${yy}. ${mm}. ${dd}`;
}

export interface SpaceReservationSheetContentProps {
  /** 예약 불가 기간 목록 (시작일~종료일) */
  reservedDates?: ReservedDateRange[];
  /** 1일 대여 금액 */
  unitPrice?: number;
  onClose: () => void;
  /** 시작일, 종료일 선택 완료 시 호출 */
  onReserve?: (startDate: DateString, endDate: DateString) => void;
}

const MONTHS_TO_SHOW = 12;

export function SpaceReservationSheetContent({
  reservedDates = [],
  unitPrice = 0,
  onClose,
  onReserve,
}: SpaceReservationSheetContentProps) {
  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());
  const [startDate, setStartDate] = useState<DateString>("");
  const [endDate, setEndDate] = useState<DateString>("");

  const monthsToRender: { year: number; month: number }[] = [];
  for (let i = 0; i < MONTHS_TO_SHOW; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    monthsToRender.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const handleDate = (day: number | null, year: number, month: number) => {
    if (day == null) return;
    const selectedDate = toDateString(year, month, day);

    if (selectedDate < todayStr) {
      return;
    }

    const isReserved = reservedDates.some(
      ({ startDate: resStart, endDate: resEnd }) =>
        selectedDate >= resStart && selectedDate <= resEnd
    );

    if (isReserved) {
      window.alert("해당 날짜는 선택할 수 없습니다!");
      return;
    }

    if (startDate !== "" && endDate !== "") {
      setStartDate(selectedDate);
      setEndDate("");
      return;
    }

    if (startDate !== "" && endDate === "") {
      if (selectedDate === startDate) {
        return;
      }
      if (selectedDate < startDate) {
        setStartDate(selectedDate);
      } else {
        const hasReservedBetween = reservedDates.some(
          ({ startDate: resStart, endDate: resEnd }) =>
            (resStart >= startDate && resStart <= selectedDate) ||
            (resEnd >= startDate && resEnd <= selectedDate)
        );

        if (hasReservedBetween) {
          window.alert("해당 범위 내 예약된 날짜가 포함되어 있어 선택할 수 없습니다!");
          return;
        }

        setEndDate(selectedDate);
      }
    } else if (startDate === "" && endDate === "") {
      setStartDate(selectedDate);
    }
  };

  const clearDate = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleReservation = () => {
    if (startDate !== "" && endDate !== "") {
      onReserve?.(startDate, endDate);
      onClose();
    } else if (startDate === "" && endDate === "") {
      window.alert("예약할 날짜를 선택해주세요!");
    } else if (startDate !== "" && endDate === "") {
      window.alert("종료일을 선택해주세요!");
    }
  };

  const formatPrice = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "-");
  const getRentalDays = (startStr: string, endStr: string): number => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.floor(diff) + 1);
    } catch {
      return 0;
    }
  };
  const selectedDays = startDate !== "" && endDate !== "" ? getRentalDays(startDate, endDate) : 0;
  const selectedTotalPrice = selectedDays > 0 ? unitPrice * selectedDays : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 pt-3">
        <p className="typo-h2 text-dice-black">희망 대여 기간 선택</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full text-(--gray-deep) transition-colors hover:bg-neutral-100 hover:text-(--dice-black)"
        >
          <XIcon className="size-6" aria-hidden />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {monthsToRender.map(({ year: y, month: m }) => {
          const calendarDays = getCalendarDays(y, m);
          return (
            <section key={`${y}-${m}`} className="py-3" aria-label={`${y}년 ${m + 1}월`}>
              <h3 className="typo-body1 mb-3 font-medium text-dice-black">
                {y}년 {m + 1}월
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="py-0.5 text-center text-xs font-medium text-neutral-500">
                    {wd}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  const isCurrentMonth = day != null;
                  if (!isCurrentMonth) {
                    return <div key={i} className="aspect-square" aria-hidden />;
                  }
                  const dateStr = toDateString(y, m, day);
                  const isReserved = reservedDates.some(
                    ({ startDate: resStart, endDate: resEnd }) =>
                      dateStr >= resStart && dateStr <= resEnd
                  );
                  const isStart = dateStr === startDate;
                  const isEnd = dateStr === endDate;
                  const isInRange =
                    startDate !== "" && endDate !== "" && dateStr > startDate && dateStr < endDate;
                  const isPast = dateStr < todayStr;
                  const isDisabled = isReserved || isPast;

                  const isSelected = isStart || isEnd;
                  const isInRangeOrEnds = isStart || isEnd || isInRange;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDate(day, y, m)}
                      className={[
                        "typo-caption1 relative flex aspect-square items-center justify-center py-1 transition-colors",
                        !isDisabled && !isSelected && !isInRange && "rounded-full",
                        isInRangeOrEnds && "-m-0.5",
                        !isStart &&
                          !isEnd &&
                          !isInRange &&
                          !isDisabled &&
                          "text-gray-dark hover:bg-neutral-100",
                        (isReserved || isPast) && "cursor-not-allowed text-gray-light",
                        isInRange && "text-gray-dark",
                      ]
                        .filter(Boolean)
                        .join("")}
                    >
                      {isInRangeOrEnds && (
                        <span
                          className={`absolute top-1/2 z-0 h-[65%] -translate-y-1/2 bg-neutral-100 ${
                            isStart ? "left-1/2 right-0" : isEnd ? "left-0 right-1/2" : "inset-x-0"
                          }`}
                          aria-hidden
                        />
                      )}
                      {isStart && (
                        <>
                          <PolygonIcon
                            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                            aria-hidden
                          />
                          <span className="relative z-10 text-dice-black">{day}</span>
                        </>
                      )}
                      {isEnd && (
                        <>
                          <FilledPolygonIcon
                            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                            aria-hidden
                          />
                          <span className="relative z-10 text-dice-white">{day}</span>
                        </>
                      )}
                      {!isStart && !isEnd && (
                        <span className={isInRange ? "relative z-10" : undefined}>{day}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {startDate !== "" && endDate !== "" && (
        <div className="shrink-0 bg-(--system-purple) px-5 py-3 text-center">
          <p className="typo-subtitle2 text-white">
            {formatDisplayDate(startDate)} ~ {formatDisplayDate(endDate)} /{""}
            {formatPrice(selectedTotalPrice)}
          </p>
        </div>
      )}

      <div className="flex shrink-0 gap-3 border-t border-neutral-200 px-5 py-4">
        <div className="flex flex-1 gap-3">
          <button
            type="button"
            onClick={clearDate}
            className="rounded-lg border border-neutral-300 p-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            날짜 초기화
          </button>
          <button
            type="button"
            onClick={handleReservation}
            className="flex-1 rounded-lg bg-black p-4 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
            disabled={startDate === "" || endDate === ""}
          >
            예약 신청
          </button>
        </div>
      </div>
    </div>
  );
}
