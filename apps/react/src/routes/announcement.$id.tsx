import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { backWithHistory } from "@/shared/navigation/back";
import { getAnnouncementDetailData, queryKeys } from "../api";
import { getDummyAnnouncementDetail } from "../api/announcement/dummy";
import { ImageCarousel } from "../components/ImageCarousel";
import { bridge } from "@/bridge";
import ArrowRightWhiteIcon from "@/assets/icons/Arrow/right-white.svg?react";
import LikeLightgray from "@/assets/icons/like/like-lightgray.svg?react";
import LikePurple from "@/assets/icons/like/like-purple.svg?react";
import GlobeIcon from "@/assets/icons/Announcement/globe.svg?react";

function openExternal(url: string) {
  const useInAppBrowser =
    typeof bridge?.isNativeMethodAvailable === "function" &&
    bridge.isNativeMethodAvailable("openInAppBrowser");
  if (useInAppBrowser && bridge?.openInAppBrowser) {
    bridge.openInAppBrowser(url).catch(() => window.open(url, "_blank"));
  } else {
    window.open(url, "_blank");
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const Route = createFileRoute("/announcement/$id")({
  component: AnnouncementDetailPage,
});

type DetailData = NonNullable<
  | Awaited<ReturnType<typeof getAnnouncementDetailData>>
  | ReturnType<typeof getDummyAnnouncementDetail>
>;

function TitleWithLike({ data }: { data: DetailData }) {
  const [isLiked, setIsLiked] = useState(data.isLiked);
  return (
    <div className="flex items-start justify-between gap-5 border-b border-stroke-eee pb-24">
      <h1 className="typo-h2 min-w-0 flex-1 wrap-break-word text-dice-black">{data.title}</h1>
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => setIsLiked((prev) => !prev)}
          className="rounded-full p-1 transition-colors hover:bg-neutral-100"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
        >
          {isLiked ? <LikePurple className="h-24 w-24" /> : <LikeLightgray className="h-24 w-24" />}
        </button>
        <span
          className={
            isLiked ? "typo-caption2 text-system-purple" : "typo-caption2 text-gray-semilight"
          }
        >
          {data.likeCount}
        </span>
      </div>
    </div>
  );
}

function AnnouncementDetailPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();
  const announcementId = Number(id);

  const handleBackToList = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
      return;
    }
    navigate({ to: "/announcement", replace: true, state: { skipTransition: true } });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.announcement.detail(announcementId),
    queryFn: async () => {
      try {
        return await getAnnouncementDetailData(announcementId);
      } catch {
        return getDummyAnnouncementDetail(announcementId);
      }
    },
    enabled: Number.isInteger(announcementId) && announcementId > 0,
  });

  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-neutral-500">잘못된 공고 ID입니다.</p>
        <Link to="/announcement" className="mt-4 inline-block text-indigo-600 hover:underline">
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
        <p className="text-red-600">
          {error instanceof Error ? error.message : "공고 정보를 불러오지 못했습니다."}
        </p>
        <Link to="/announcement" className="mt-4 inline-block text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  const imageUrls = data.imageUrls ?? [];
  const announcementPageUrl = data.websiteUrl?.trim() || "";
  const hasAnnouncementPage = announcementPageUrl.length > 0;
  const locationText = [data.city, data.district].filter(Boolean).join("") || "-";
  const dateRange = `${formatDate(data.recruitmentStartAt)} ~ ${formatDate(data.recruitmentEndAt)}`;

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 flex w-full max-w-(--common-max-width) -translate-x-1/2 flex-col overflow-hidden bg-white"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      {/* 헤더 */}
      <div className="shrink-0 bg-dice-black">
        <button type="button" onClick={handleBackToList} className="p-12" aria-label="목록으로">
          <ArrowRightWhiteIcon className="h-24 w-24" aria-hidden />
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {imageUrls.length > 0 && (
          <ImageCarousel imageUrls={imageUrls} aspectRatio="375/210" altPrefix="공고 이미지" />
        )}

        <div className="py-6 pt-32">
          <div className="px-(--spacing-screen-x) space-y-24">
            {/* 제목(줄바꿈) | 좋아요 버튼 좌우 정렬 */}
            <TitleWithLike key={data.id} data={data} />

            {/* 라벨 | 값 2열 배치 */}
            <dl className="mt-4 flex flex-col gap-8 typo-caption1 text-gray-deep">
              <div className="flex gap-5">
                <dt className="w-14 shrink-0">해당 지역</dt>
                <dd className="min-w-0">{locationText}</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-14 shrink-0">공간 위치</dt>
                <dd className="min-w-0">{data.address || "-"}</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-14 shrink-0">지원 대상</dt>
                <dd className="min-w-0">{data.target || "-"}</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-14 shrink-0">모집 기간</dt>
                <dd className="min-w-0">{dateRange}</dd>
              </div>
              <div className="flex gap-5">
                <dt className="w-14 shrink-0">문의 번호</dt>
                <dd className="min-w-0">{data.contactNumber || "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="h-8 bg-bg-light-gray my-24" />

          {data.details && (
            <div className="px-(--spacing-screen-x) mt-6">
              <h2 className="typo-subtitle2 text-dice-black">지원 공고 소개</h2>
              <p className="mt-1 whitespace-pre-wrap typo-body1 text-gray-deep">{data.details}</p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정: 공고 페이지 바로가기 */}
      <div
        className="shrink-0 border-t border-stroke-eee bg-dice-white px-(--spacing-screen-x)"
        style={{
          paddingTop: "var(--spacing-12)",
          paddingBottom: "max(var(--spacing-12), env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={() => hasAnnouncementPage && openExternal(announcementPageUrl)}
          disabled={!hasAnnouncementPage}
          className="typo-button1 w-full flex flex-row justify-center items-center gap-8 rounded-lg bg-dice-black py-3.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GlobeIcon className="h-24 w-24" aria-hidden />
          공고 페이지 바로가기
        </button>
      </div>
    </div>
  );
}
