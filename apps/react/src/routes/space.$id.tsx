import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpaceDetailData, queryKeys } from "../api";
import { FacilityInfoRow } from "../components/FacilityInfoRow";
import { ImageCarousel } from "../components/ImageCarousel";

export const Route = createFileRoute("/space/$id")({
  component: SpaceDetailPage,
});

function SpaceDetailPage() {
  const { id } = Route.useParams();
  const spaceId = Number(id);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.space.detail(spaceId),
    queryFn: () => getSpaceDetailData(spaceId),
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
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

      {/* 전체 너비 이미지 캐러셀 */}
      {imageUrls.length > 0 ? (
        <ImageCarousel imageUrls={imageUrls} aspectRatio="1/1" altPrefix="공간 이미지" />
      ) : logoUrl ? (
        <img src={logoUrl} alt="공간 대표 이미지" className="w-full aspect-square object-cover" />
      ) : null}

      <div className="px-4 py-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{data.name}</h1>

        {nearestSubway != null && (
          <div>
            {nearestSubway.lineNumber != null && <span>{nearestSubway.lineNumber}</span>}
            {nearestSubway.stationName != null && <span>{nearestSubway.stationName}에서</span>}
            {nearestSubway.distance != null && <span>{nearestSubway.distance}m</span>}
          </div>
        )}

        <div className="mt-1 flex flex-col items-end gap-0.5">
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

        {(data.details ?? data.description) != null &&
          (data.details ?? data.description) !== "" && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">소개</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                {details}
              </p>
            </div>
          )}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
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

        <div className="mt-4">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            팝업 공간 소개
          </h2>
          <p
            className={`mt-1 text-sm text-neutral-600 dark:text-neutral-400 ${
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
        </div>

        {facilityInfos.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              시설·집기 이용 안내
            </h2>
            <ul className="mt-2 flex flex-col gap-3">
              {facilityInfos.map((info, index) => (
                <li key={info.key ?? info.name ?? index}>
                  <FacilityInfoRow item={info} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
