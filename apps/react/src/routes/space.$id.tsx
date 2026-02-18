import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MessageIcon from "@/assets/icons/Message/message.svg?react";
import RightWhiteIcon from "@/assets/icons/Arrow/right-white.svg?react";
import LikeLightgray from "@/assets/icons/like/like-lightgray.svg?react";
import LikePurple from "@/assets/icons/like/like-purple.svg?react";
import { backWithHistory } from "@/shared/navigation/back";
import { getSpaceDetailData, queryKeys } from "../api";
import { getDummySpaceDetail } from "../api/space/dummy";
import { BottomSheet } from "../components/BottomSheet";
import { FacilityInfoRow } from "../components/FacilityInfoRow";
import { ImageCarousel } from "../components/ImageCarousel";
import { SpaceReservationSheetContent } from "../components/space";
import { m2ToPyeong } from "../utils/sizeConversion";

export const Route = createFileRoute("/space/$id")({
  component: SpaceDetailPage,
});

type SpaceDetailData = NonNullable<
  Awaited<ReturnType<typeof getSpaceDetailData>> | ReturnType<typeof getDummySpaceDetail>
>;

function SpaceTitleWithLike({ data }: { data: SpaceDetailData }) {
  const [isLiked, setIsLiked] = useState(data.isLiked);
  const [likeCount, setLikeCount] = useState(data.likeCount);
  const nearestSubway = data.nearestSubway;

  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <h1 className="typo-h2 text-dice-black">{data.name}</h1>
        {nearestSubway != null && (
          <div>
            {nearestSubway.lineNumber != null && <span>{nearestSubway.lineNumber}</span>}
            {nearestSubway.stationName != null && (
              <span className="typo-subtitle3 text-gray-semilight">
                {nearestSubway.stationName}에서
              </span>
            )}
            {nearestSubway.distance != null && (
              <span className="typo-subtitle3 text-gray-semilight"> {nearestSubway.distance}m</span>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={() => {
            setIsLiked((prevLiked) => {
              const nextLiked = !prevLiked;
              setLikeCount((prevCount) => (nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1)));
              return nextLiked;
            });
          }}
          className="rounded-full p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
        >
          {isLiked ? (
            <LikePurple className="h-24 w-24" aria-hidden />
          ) : (
            <LikeLightgray className="h-24 w-24" aria-hidden />
          )}
        </button>
        <span
          className={
            isLiked ? "typo-caption2 text-system-purple" : "typo-caption2 text-gray-semilight"
          }
        >
          {likeCount}
        </span>
      </div>
    </div>
  );
}

function SpaceDetailPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();
  const spaceId = Number(id);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isPastCarousel, setIsPastCarousel] = useState(false);
  const [reservationSheetOpen, setReservationSheetOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.space.detail(spaceId),
    queryFn: async () => {
      try {
        return await getSpaceDetailData(spaceId);
      } catch {
        return getDummySpaceDetail(spaceId);
      }
    },
    enabled: Number.isInteger(spaceId) && spaceId > 0,
  });

  const handleBackToList = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
      return;
    }
    navigate({ to: "/space", replace: true, state: { skipTransition: true } });
  };

  // 캐러셀을 스크롤로 넘겼는지 감지 (48px 바 스타일 전환용)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const carouselEl = carouselRef.current;
    if (!scrollEl || !carouselEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.rootBounds) return;
        const past = entry.boundingClientRect.bottom <= entry.rootBounds.top;
        setIsPastCarousel((prev) => (prev === past ? prev : past));
      },
      { root: scrollEl, rootMargin: "0px", threshold: 0 }
    );

    observer.observe(carouselEl);
    return () => observer.disconnect();
  }, [data]);

  const formatPrice = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "-");
  const formatBusinessTime = (time?: string | null) => {
    if (!time) return "-";

    const [rawHour = "0", rawMinute = "0"] = time.split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "-";
    if (minute === 0) return `${hour}시`;
    return `${hour}시 ${minute}분`;
  };

  if (!Number.isInteger(spaceId) || spaceId <= 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-neutral-500">잘못된 공간 ID입니다.</p>
        <Link to="/space" className="mt-4 inline-block text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="px-4 py-12 text-center text-sm text-neutral-500">불러오는 중...</div>;
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-8">
        <p className="text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "공간 정보를 불러오지 못했습니다."}
        </p>
        <Link to="/space" className="mt-4 inline-block text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  const imageUrls = data.imageUrls ?? [];
  const logoUrl = data.logoUrl;
  const details = data.details ?? "";
  const facilityInfos = data.facilityInfos ?? [];
  const tags = data.tags ?? [];

  const messageRoomId = data.messageRoomId;
  const reservationUnitPrice = data.discountRate > 0 ? data.discountPrice : data.pricePerDay;
  const messagesTo = messageRoomId
    ? { to: "/mypage/messages/$roomId" as const, params: { roomId: String(messageRoomId) } }
    : { to: "/mypage/messages" as const };

  return (
    <div
      className="no-bounce-scroll fixed left-0 right-0 bottom-0 flex flex-col overflow-hidden bg-white dark:bg-neutral-900"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      {/* 캐러셀 넘긴 뒤 보여줄 48px 상단 바 (레이아웃 영향 없이 fixed) */}
      <div
        className={`fixed left-0 right-0 z-20 flex h-[48px] items-center bg-dice-black transition-opacity ${
          isPastCarousel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          type="button"
          onClick={handleBackToList}
          className="flex p-12 pl-[15px] shrink-0 items-center justify-center"
          aria-label="목록으로"
        >
          <RightWhiteIcon className="size-24" aria-hidden />
        </button>
      </div>

      {/* 캐러셀 위에서는 Dim 원형 버튼 노출 */}
      <button
        type="button"
        onClick={handleBackToList}
        className={`fixed z-30 flex items-center justify-center rounded-full bg-(--dim-basic) p-6 transition-opacity ${
          isPastCarousel ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{
          left: 14,
          top: "calc(10px + env(safe-area-inset-top, 0px))",
        }}
        aria-label="목록으로"
      >
        <RightWhiteIcon className="size-24 shrink-0 text-white [&_path]:stroke-white" aria-hidden />
      </button>

      {/* 스크롤 영역 (스크롤바는 이 영역 안에서만, 바텀 바 위에서 끊김) */}
      <div ref={scrollRef} className="no-bounce-scroll min-h-0 flex-1 overflow-y-auto pb-20">
        {/* 캐러셀 */}
        <div ref={carouselRef} className="relative w-full">
          {imageUrls.length > 0 ? (
            <ImageCarousel imageUrls={imageUrls} aspectRatio="1/1" altPrefix="공간 이미지" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="공간 대표 이미지"
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-bg-light-gray dark:bg-neutral-800" />
          )}
        </div>

        <section className="space-y-16">
          <div className="px-(--spacing-screen-x) space-y-24">
            <SpaceTitleWithLike data={data} />

            <div className="mt-1 flex flex-col gap-0.5">
              <div className="typo-caption1">
                <span className="text-gray-dark dark:text-white">1일 대여 </span>
                {data.discountRate > 0 ? (
                  <span className="text-gray-semilight dark:text-gray-semilight line-through">
                    {formatPrice(data.pricePerDay)}
                  </span>
                ) : (
                  <span className="text-gray-semilight dark:text-gray-semilight">
                    {formatPrice(data.pricePerDay)}
                  </span>
                )}
              </div>
              {data.discountRate > 0 && (
                <div className="flex items-center gap-1">
                  <span className="typo-subtitle2 text-system-purple">{data.discountRate}%</span>
                  <span className="typo-subtitle1 text-dice-black dark:text-white">
                    {formatPrice(data.discountPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <dl className="px-(--spacing-screen-x) mt-4 flex flex-col gap-8 typo-caption1 text-gray-deep">
            <div className="flex gap-5">
              <dt className="w-14 shrink-0">영업 시간</dt>
              <dd className="min-w-0">
                {formatBusinessTime(data.openingTime)} - {formatBusinessTime(data.closingTime)}
              </dd>
            </div>

            <div className="flex gap-5">
              <dt className="w-14 shrink-0">공간 크기</dt>
              <dd className="min-w-0">
                {data.size != null && data.size > 0
                  ? `${data.size}㎡ (${m2ToPyeong(data.size)}평)`
                  : "-"}
              </dd>
            </div>
          </dl>

          {tags.length > 0 && (
            <div>
              <h3>동네 해시태그</h3>
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </section>

        <div className="h-8 bg-bg-light-gray my-24" />

        <section className="px-(--spacing-screen-x) space-y-24">
          <h2 className="typo-subtitle2 text-dice-black">팝업 공간 소개</h2>
          <p
            className={`mt-1 whitespace-pre-wrap typo-body1 text-gray-deep ${
              detailsExpanded ? "" : "line-clamp-3"
            }`}
          >
            {details}
          </p>
          <button
            type="button"
            onClick={() => setDetailsExpanded((prev) => !prev)}
            className="mt-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {detailsExpanded ? "간략히 보기" : "자세히 보기"}
          </button>
        </section>

        <div className="h-8 bg-bg-light-gray my-24" />

        {facilityInfos.length > 0 && (
          <section className="px-(--spacing-screen-x)">
            <h2 className="typo-subtitle2 text-dice-black">시설·집기 이용 안내</h2>
            <ul className="mt-2 flex flex-col gap-3">
              {facilityInfos.map((info, index) => (
                <li key={info.key ?? info.name ?? index}>
                  <FacilityInfoRow item={info} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="h-8 bg-bg-light-gray my-24" />

        <section className="px-(--spacing-screen-x) space-y-24">
          <h2 className="typo-subtitle2 text-dice-black">위치 안내</h2>
          <div className="typo-body1 text-gray-deep">{data.address}</div>
        </section>

        <div className="h-8 bg-bg-light-gray my-24" />

        <section className="px-(--spacing-screen-x) space-y-24">
          <h2 className="typo-subtitle2 text-dice-black">공지사항 안내</h2>
          <ul className="border border-stroke-eee rounded-lg p-16 bg-bg-light-gray">
            {data.notices?.map((notice) => (
              <li key={notice}>
                <p className="typo-body1 text-gray-deep">* {notice}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 하단 바 (바텀 네비처럼 레이아웃 흐름에 포함, 스크롤바가 뒤로 감) */}
      <div
        className="flex shrink-0 items-center gap-3 border-t border-stroke-eee bg-dice-white px-(--spacing-screen-x) dark:border-neutral-700 dark:bg-neutral-800"
        style={{
          paddingTop: "var(--spacing-12)",
          paddingBottom: "max(var(--spacing-12), env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Link
          {...messagesTo}
          className="flex p-3.5 shrink-0 border border-gray-light rounded-lg text-gray-dark transition-colors hover:bg-bg-light-gray dark:border-neutral-600 dark:text-gray-semilight dark:hover:bg-neutral-700"
          aria-label="쪽지함"
        >
          <MessageIcon className="size-24" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setReservationSheetOpen(true)}
          className="typo-button1 flex-1 rounded-lg bg-dice-black py-16 text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-dice-black"
        >
          공간 예약 신청
        </button>
      </div>

      <BottomSheet
        open={reservationSheetOpen}
        onClose={() => setReservationSheetOpen(false)}
        dismissible={false}
        sheetTitle="예약 날짜 선택"
        sheetDescription="예약 가능한 날짜 범위를 선택하세요"
        content={
          <SpaceReservationSheetContent
            unitPrice={reservationUnitPrice}
            onClose={() => setReservationSheetOpen(false)}
            onReserve={(startDate, endDate) => {
              setReservationSheetOpen(false);
              navigate({
                to: "/reservation/apply",
                search: { spaceId, startDate, endDate },
              });
            }}
          />
        }
      />
    </div>
  );
}
