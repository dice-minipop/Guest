import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MessageIcon from "@/assets/icons/Message/message.svg?react";
import { getSpaceDetailData, queryKeys } from "../api";
import { getDummySpaceDetail } from "../api/space/dummy";
import { FacilityInfoRow } from "../components/FacilityInfoRow";
import { ImageCarousel } from "../components/ImageCarousel";

export const Route = createFileRoute("/space/$id")({
  component: SpaceDetailPage,
});

function SpaceDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const spaceId = Number(id);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

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

  const formatPrice = (n: number) => (n > 0 ? `${n.toLocaleString("ko-KR")}원` : "-");

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
  const nearestSubway = data.nearestSubway;
  const details = data.details ?? "";
  const facilityInfos = data.facilityInfos ?? [];
  const tags = data.tags ?? [];

  const messageRoomId = data.messageRoomId;
  const messagesTo = messageRoomId
    ? { to: "/mypage/messages/$roomId" as const, params: { roomId: String(messageRoomId) } }
    : { to: "/mypage/messages" as const };

  return (
    <div
      className="fixed left-0 right-0 bottom-0 flex flex-col overflow-hidden bg-white dark:bg-neutral-900"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      {/* 헤더 */}
      <div className="shrink-0 border-b border-stroke-eee bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/space"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            aria-label="목록으로"
          >
            ← 목록
          </Link>
        </div>
      </div>

      {/* 스크롤 영역 (스크롤바는 이 영역 안에서만, 바텀 바 위에서 끊김) */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-20">
        {/* 전체 너비 이미지 캐러셀 */}
        {imageUrls.length > 0 ? (
          <ImageCarousel imageUrls={imageUrls} aspectRatio="1/1" altPrefix="공간 이미지" />
        ) : logoUrl ? (
          <img src={logoUrl} alt="공간 대표 이미지" className="w-full aspect-square object-cover" />
        ) : null}

        <div>
          <section className="px-(--spacing-screen-x)">
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
                  <span className="typo-subtitle3 text-gray-semilight">
                    {" "}
                    {nearestSubway.distance}m
                  </span>
                )}
              </div>
            )}

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
          </section>

          <div className="px-(--spacing-screen-x) mt-4 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            {data.capacity != null && <span>수용 인원: {data.capacity}명</span>}
            {data.size != null && <span>면적: {data.size}㎡</span>}
          </div>

          {tags.length > 0 && (
            <div>
              <h3>동네 해시태그</h3>
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

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
          onClick={() => navigate({ to: "/reservation/apply", search: { spaceId } })}
          className="typo-button1 flex-1 rounded-lg bg-dice-black py-16 text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-dice-black"
        >
          공간 예약 신청
        </button>
      </div>
    </div>
  );
}
