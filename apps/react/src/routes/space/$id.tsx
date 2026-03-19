import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import MessageIcon from "@/assets/icons/Message/message.svg?react";
import RightWhiteIcon from "@/assets/icons/Arrow/right-white.svg?react";
import LikeLightgray from "@/assets/icons/like/like-lightgray.svg?react";
import LikePurple from "@/assets/icons/like/like-purple.svg?react";
import { backWithHistory } from "@/shared/navigation/back";
import { getSpaceDetailData, queryKeys } from "@/api";
import { getDummySpaceDetail } from "@/api/space/dummy";
import { BottomSheet } from "@/components/BottomSheet";
import { FacilityInfoRow } from "@/components/FacilityInfoRow";
import { ImageCarousel } from "@/components/ImageCarousel";
import { SpaceImage } from "@/shared/ui/space-image-fallback";
import { NaverMap } from "@/components/NaverMap";
import { SpaceReservationSheetContent } from "@/components/space";
import { canUseMemberOnlyApi } from "@/api/axios";
import { useLoginRequiredModal } from "@/hooks/useLoginRequiredModal";
import {
  consumeSpaceDetailScrollRestore,
  getSpaceDetailScrollKey,
  markSpaceDetailScrollRestore,
} from "@/lib/scrollStorage";
import { useTabScrollStorage } from "@/hooks/useTabScrollStorage";
import { m2ToPyeong } from "@/utils/sizeConversion";
import PlaceIcon from "@/assets/place.svg?react";
import MapIcon from "@/assets/map.svg?react";
import DownArrowIcon from "@/assets/down-arrow.svg?react";
import { bridge } from "@/bridge";

export const Route = createFileRoute("/space/$id")({
  component: SpaceLayout,
});

function SpaceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMapPage = pathname.endsWith("/map");

  if (isMapPage) {
    return <Outlet />;
  }

  return <SpaceDetailPage />;
}

type SpaceDetailData = NonNullable<
  Awaited<ReturnType<typeof getSpaceDetailData>> | ReturnType<typeof getDummySpaceDetail>
>;

async function copyTextToClipboard(text: string) {
  if (
    typeof bridge?.isNativeMethodAvailable === "function" &&
    bridge.isNativeMethodAvailable("copyTextToClipboard")
  ) {
    await bridge.copyTextToClipboard(text);
    return;
  }

  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("CLIPBOARD_UNAVAILABLE");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function SpaceTitleWithLike({ data, spaceId }: { data: SpaceDetailData; spaceId: number }) {
  const [isLiked, setIsLiked] = useState(data.isLiked);
  const [likeCount, setLikeCount] = useState(data.likeCount);
  const { openLoginRequiredModal, loginRequiredModal } = useLoginRequiredModal();
  const nearestSubway = data.nearestSubway;
  const hasCoords =
    data.latitude != null &&
    data.longitude != null &&
    Number.isFinite(data.latitude) &&
    Number.isFinite(data.longitude);

  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <h1 className="typo-h2 text-dice-black">{data.name}</h1>
        {nearestSubway != null && (
          <div className="flex flex-row items-center py-2.5">
            <PlaceIcon className="size-5 mr-0.5" aria-hidden />
            {nearestSubway.lineNumber != null && (
              <span className="mr-1">{nearestSubway.lineNumber}</span>
            )}
            {nearestSubway.stationName != null && (
              <span className="typo-subtitle3 text-gray-semilight mr-1">
                {nearestSubway.stationName}에서
              </span>
            )}
            {nearestSubway.distance != null && (
              <span className="typo-subtitle3 text-gray-semilight"> {nearestSubway.distance}m</span>
            )}
            {hasCoords && (
              <Link
                to="/space/$id/map"
                params={{ id: String(spaceId) }}
                state={{ transitionDirection: "forward" }}
                onClick={() => markSpaceDetailScrollRestore(spaceId)}
                className="ml-2 inline-flex items-center gap-0.5 typo-caption1 text-system-purple underline"
                aria-label="지도 크게 보기"
              >
                <MapIcon className="size-5" aria-hidden />
                <span>지도 보기</span>
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={() => {
            if (!canUseMemberOnlyApi()) {
              openLoginRequiredModal();
              return;
            }
            const nextLiked = !isLiked;
            setIsLiked(nextLiked);
            setLikeCount((prevCount) => (nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1)));
          }}
          className="rounded-full p-1 transition-colors hover:bg-neutral-100"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
        >
          {isLiked ? (
            <LikePurple className="h-6 w-6" aria-hidden />
          ) : (
            <LikeLightgray className="h-6 w-6" aria-hidden />
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
      {loginRequiredModal}
    </div>
  );
}

function SpaceDetailPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();
  const spaceId = Number(id);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [facilitiesExpanded, setFacilitiesExpanded] = useState(false);
  const [showDetailsToggle, setShowDetailsToggle] = useState(false);
  const [isPastCarousel, setIsPastCarousel] = useState(false);
  const [reservationSheetOpen, setReservationSheetOpen] = useState(false);
  const [shouldRestoreScroll] = useState(() => consumeSpaceDetailScrollRestore(spaceId));
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLParagraphElement>(null);
  const { openLoginRequiredModal, loginRequiredModal } = useLoginRequiredModal();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.space.detail(spaceId),
    queryFn: async () => {
      try {
        const result = await getSpaceDetailData(spaceId);
        console.log("[space] 공간 상세 조회:", result);
        return result;
      } catch {
        const fallback = getDummySpaceDetail(spaceId);
        console.log("[space] 공간 상세 조회 (dummy):", fallback);
        return fallback;
      }
    },
    enabled: Number.isInteger(spaceId) && spaceId > 0,
  });

  const handleBackToList = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
      return;
    }
    navigate({ to: "/space", replace: true, state: { transitionDirection: "back" } });
  };

  useTabScrollStorage({
    storageKey: getSpaceDetailScrollKey(spaceId),
    scrollContainerRef: scrollRef,
    restoreDeps: [data],
    restoreEnabled: shouldRestoreScroll,
  });

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

  useEffect(() => {
    const detailsElement = detailsRef.current;
    if (!detailsElement) return;

    const measureDetailsOverflow = () => {
      const computedStyle = window.getComputedStyle(detailsElement);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight);

      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setShowDetailsToggle(false);
        return;
      }

      setShowDetailsToggle(detailsElement.scrollHeight > lineHeight * 3 + 1);
    };

    measureDetailsOverflow();

    const resizeObserver = new ResizeObserver(() => {
      measureDetailsOverflow();
    });

    resizeObserver.observe(detailsElement);
    return () => resizeObserver.disconnect();
  }, [data?.details]);

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

  const handleCopyAddress = async () => {
    const address = data?.address;
    if (!address) return;

    try {
      await copyTextToClipboard(address);
      toast.success("주소를 복사했어요.");
    } catch (copyError) {
      console.error("[space] 주소 복사 실패:", copyError);
      toast.error("주소 복사에 실패했어요.");
    }
  };

  if (!Number.isInteger(spaceId) || spaceId <= 0) {
    return (
      <div className="px-1 py-2">
        <p className="text-neutral-500">잘못된 공간 ID입니다.</p>
        <Link
          to="/space"
          state={{ transitionDirection: "back" }}
          className="mt-1 inline-block text-indigo-600 hover:underline"
        >
          목록으로
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="px-1 py-3 text-center text-sm text-neutral-500">불러오는 중...</div>;
  }

  if (isError || !data) {
    return (
      <div className="px-1 py-2">
        <p className="text-red-600">
          {error instanceof Error ? error.message : "공간 정보를 불러오지 못했습니다."}
        </p>
        <Link
          to="/space"
          state={{ transitionDirection: "back" }}
          className="mt-1 inline-block text-indigo-600 hover:underline"
        >
          목록으로
        </Link>
      </div>
    );
  }

  const imageUrls = data.imageUrls ?? [];
  const logoUrl = data.logoUrl;
  const details = data.details ?? "";
  const facilityInfos = data.facilityInfos ?? [];
  const visibleFacilityInfos = facilitiesExpanded ? facilityInfos : facilityInfos.slice(0, 8);
  const tags = data.tags ?? [];

  const messageRoomId = data.messageRoomId;
  const reservationUnitPrice = data.discountRate > 0 ? data.discountPrice : data.pricePerDay;
  const messagesTo = messageRoomId
    ? { to: "/messages/$roomId" as const, params: { roomId: String(messageRoomId) } }
    : { to: "/messages" as const };

  return (
    <div
      className="no-bounce-scroll fixed left-1/2 bottom-0 flex w-full max-w-(--common-max-width) -translate-x-1/2 flex-col overflow-hidden bg-white"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      {/* 캐러셀 넘긴 뒤 보여줄 48px 상단 바 (레이아웃 영향 없이 fixed) */}
      <div
        className={`fixed top-0 left-1/2 z-20 flex h-[48px] w-full max-w-(--common-max-width) -translate-x-1/2 items-center bg-dice-black transition-opacity ${
          isPastCarousel ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          type="button"
          onClick={handleBackToList}
          className="flex p-3 pl-[15px] shrink-0 items-center justify-center"
          aria-label="목록으로"
        >
          <RightWhiteIcon className="size-6" aria-hidden />
        </button>
      </div>

      {/* 캐러셀 위에서는 Dim 원형 버튼 노출 */}
      <button
        type="button"
        onClick={handleBackToList}
        className={`absolute z-30 flex items-center justify-center rounded-full bg-(--dim-basic) p-1.5 transition-opacity ${
          isPastCarousel ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{
          left: 14,
          top: "calc(10px + env(safe-area-inset-top, 0px))",
        }}
        aria-label="목록으로"
      >
        <RightWhiteIcon className="size-6 shrink-0 text-white [&_path]:stroke-white" aria-hidden />
      </button>

      {/* 스크롤 영역 (스크롤바는 이 영역 안에서만, 바텀 바 위에서 끊김) */}
      <div ref={scrollRef} className="no-bounce-scroll min-h-0 flex-1 overflow-y-auto pb-16">
        {/* 캐러셀 */}
        <div ref={carouselRef} className="relative w-full">
          {imageUrls.length > 0 ? (
            <ImageCarousel
              imageUrls={imageUrls}
              aspectRatio="1/1"
              altPrefix="공간 이미지"
              fallbackOnError
            />
          ) : (
            <SpaceImage
              src={logoUrl}
              alt="공간 대표 이미지"
              className="w-full aspect-square object-cover"
            />
          )}
        </div>

        <section className="space-y-6">
          <div className="px-5 space-y-4 mt-8">
            <SpaceTitleWithLike data={data} spaceId={spaceId} />

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 typo-caption1">
                <span className="text-gray-dark">1일 대여</span>
                {data.discountRate > 0 ? (
                  <span className="text-gray-semilight line-through">
                    {formatPrice(data.pricePerDay)}
                  </span>
                ) : (
                  <span className="typo-subtitle1 text-dice-black">
                    {formatPrice(data.pricePerDay)}
                  </span>
                )}
              </div>
              {data.discountRate > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="typo-subtitle2 text-system-purple">{data.discountRate}%</span>
                  <span className="typo-subtitle1 text-dice-black">
                    {formatPrice(data.discountPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-5">
            <button className="w-full p-4 flex flex-col items-center justify-center border border-stroke-eee rounded-lg">
              <p className="typo-caption2 text-gray-medium mb-2">유동인구 핵심 분석</p>
              {data.analysis && (data.analysis.title || data.analysis.description) ? (
                <div className="flex flex-col gap-1">
                  {data.analysis.title && (
                    <p className="typo-subtitle2 text-system-purple">{data.analysis.title}</p>
                  )}
                  {data.analysis.description && (
                    <p className="typo-body1 text-gray-dark">{data.analysis.description}</p>
                  )}
                </div>
              ) : (
                <p className="typo-caption1 text-gray-semilight h-14 flex items-center justify-center">
                  공간 분석 데이터가 아직 없어요 기다려주세요
                </p>
              )}

              {data.analysis && (data.analysis.title || data.analysis.description) && (
                <p className="w-full typo-caption1 text-gray-semilight border-t border-stroke-eee pt-4">
                  선택한 모든 브랜드 타겟 유동인구 더보기
                </p>
              )}
            </button>
          </div>

          <dl className="mx-5 mt-1 flex flex-col gap-2 typo-caption1 text-gray-deep border-b border-stroke-eee pb-5">
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
            <div className="px-5 space-y-[5px]">
              <h3 className="typo-caption1 text-dice-black">동네 해시태그</h3>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="typo-caption1 text-gray-deep px-2.5 py-1 rounded-full border border-stroke-eee"
                  >
                    <span className="text-gray-light mr-0.5">#</span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="h-2 bg-bg-light-gray my-6" />

        <section className="px-5 space-y-4">
          <h2 className="typo-subtitle2 text-dice-black">팝업 공간 소개</h2>
          <p
            ref={detailsRef}
            className={`whitespace-pre-wrap typo-body1 text-gray-deep ${
              detailsExpanded ? "" : "line-clamp-3"
            }`}
          >
            {details}
          </p>
          {showDetailsToggle && (
            <button
              type="button"
              onClick={() => setDetailsExpanded((prev) => !prev)}
              className="typo-button1 flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-eee bg-white py-4 text-gray-medium transition-opacity hover:opacity-90"
            >
              <span>{detailsExpanded ? "간략히 보기" : "자세히 보기"}</span>
              <DownArrowIcon
                className={`h-6 w-6 transition-transform ${detailsExpanded ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          )}
        </section>

        <div className="h-2 bg-bg-light-gray my-6" />

        <section className="px-5 space-y-4">
          <h2 className="typo-subtitle2 text-dice-black">시설·집기 이용 안내</h2>
          {facilityInfos.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-4">
                {visibleFacilityInfos.map((info, index) => (
                  <li key={info.key ?? info.name ?? index}>
                    <FacilityInfoRow item={info} />
                  </li>
                ))}
              </ul>
              {facilityInfos.length > 8 && (
                <button
                  type="button"
                  onClick={() => setFacilitiesExpanded((prev) => !prev)}
                  className="typo-button1 flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-eee bg-white py-4 text-gray-medium transition-opacity hover:opacity-90"
                >
                  <span>
                    {facilitiesExpanded
                      ? "시설·집기 간략히 보기"
                      : `시설 집기 ${facilityInfos.length}개 모두 보기`}
                  </span>
                  <DownArrowIcon
                    className={`h-6 w-6 transition-transform ${facilitiesExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              )}
            </>
          ) : (
            <div className="flex h-[256px] items-center justify-center">
              <p className="typo-body1 text-gray-semilight">아직 등록된 시설·집기가 없어요</p>
            </div>
          )}
        </section>

        <div className="h-2 bg-bg-light-gray my-6" />

        <section className="px-5 space-y-4">
          <h2 className="typo-subtitle2 text-dice-black">위치 안내</h2>

          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-0.5">
              <PlaceIcon className="size-6 mr-0.5" aria-hidden />
              <div className="typo-body1 text-gray-deep">{data.address}</div>
            </div>

            <button
              type="button"
              onClick={handleCopyAddress}
              disabled={!data.address}
              className="typo-caption2 text-gray-medium underline disabled:text-gray-semilight"
            >
              주소 복사
            </button>
          </div>

          {data.latitude != null &&
            data.longitude != null &&
            Number.isFinite(data.latitude) &&
            Number.isFinite(data.longitude) && (
              <Link
                to="/space/$id/map"
                params={{ id: String(spaceId) }}
                state={{ transitionDirection: "forward" }}
                className="block cursor-pointer relative"
                onClick={() => markSpaceDetailScrollRestore(spaceId)}
                aria-label="지도 크게 보기"
              >
                <NaverMap
                  latitude={data.latitude}
                  longitude={data.longitude}
                  title={data.name}
                  height={200}
                  interactive={false}
                />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 typo-caption2 text-white bg-black/50 px-3 py-1.5 rounded-full">
                  탭하여 크게 보기
                </span>
              </Link>
            )}
        </section>

        <div className="h-2 bg-bg-light-gray my-6" />

        <section className="px-5 space-y-6">
          <h2 className="typo-subtitle2 text-dice-black">공지사항 안내</h2>
          {data.notices && data.notices.length > 0 ? (
            <ul className="border border-stroke-eee rounded-lg p-4 bg-bg-light-gray">
              {data.notices.map((notice) => (
                <li key={notice}>
                  <p className="typo-body1 text-gray-deep">* {notice}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-stroke-eee rounded-lg p-4 bg-bg-light-gray">
              <p className="typo-body1 text-gray-deep">아직 등록된 공지사항이 없어요</p>
            </div>
          )}
        </section>
      </div>

      {/* 하단 바 (바텀 네비처럼 레이아웃 흐름에 포함, 스크롤바가 뒤로 감) */}
      <div
        className="flex shrink-0 items-center gap-3 border-t border-stroke-eee bg-dice-white px-5"
        style={{
          paddingTop: "12px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Link
          {...messagesTo}
          onClick={(e) => {
            if (!canUseMemberOnlyApi()) {
              e.preventDefault();
              openLoginRequiredModal();
              return;
            }
            markSpaceDetailScrollRestore(spaceId);
          }}
          className="flex p-3.5 shrink-0 border border-gray-light rounded-lg text-gray-dark transition-colors hover:bg-bg-light-gray"
          aria-label="쪽지함"
        >
          <MessageIcon className="size-6" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => {
            if (!canUseMemberOnlyApi()) {
              openLoginRequiredModal();
              return;
            }
            setReservationSheetOpen(true);
          }}
          className="typo-button1 flex-1 rounded-lg bg-dice-black py-4 text-white transition-opacity hover:opacity-90"
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
              markSpaceDetailScrollRestore(spaceId);
              navigate({
                to: "/reservation/apply",
                search: { spaceId, startDate, endDate },
                state: { transitionDirection: "forward" },
              });
            }}
          />
        }
      />
      {loginRequiredModal}
    </div>
  );
}
