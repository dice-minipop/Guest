import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { bridge } from "@/bridge";
import { backWithHistory } from "@/shared/navigation/back";
import { getSpaceDetailData, queryKeys } from "@/api";
import { getDummySpaceDetail } from "@/api/space/dummy";
import { NaverMap } from "@/components/NaverMap";

export const Route = createFileRoute("/space/$id/map")({
  component: SpaceMapPage,
});

function SpaceMapPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();
  const spaceId = Number(id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.space.detail(spaceId),
    queryFn: async () => {
      try {
        const result = await getSpaceDetailData(spaceId);
        return result;
      } catch {
        const fallback = getDummySpaceDetail(spaceId);
        return fallback;
      }
    },
    enabled: Number.isInteger(spaceId) && spaceId > 0,
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
      return;
    }
    navigate({
      to: "/space/$id",
      params: { id },
      replace: true,
      state: { transitionDirection: "back" },
    });
  };

  if (!Number.isInteger(spaceId) || spaceId <= 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-1">
        <p className="text-neutral-500">잘못된 공간 ID입니다.</p>
        <Link to="/space" className="mt-1 text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-1">
        <p className="text-red-600">
          {error instanceof Error ? error.message : "공간 정보를 불러오지 못했습니다."}
        </p>
        <Link to="/space" className="mt-1 text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  const hasCoords =
    data.latitude != null &&
    data.longitude != null &&
    Number.isFinite(data.latitude) &&
    Number.isFinite(data.longitude);

  const browserUrl = hasCoords
    ? `https://map.naver.com/v5/?c=${data.latitude},${data.longitude},17,0,0,0`
    : data.address
      ? `https://map.naver.com/v5/search/${encodeURIComponent(data.address)}`
      : "";

  const appName = encodeURIComponent(
    typeof window !== "undefined" ? window.location.origin : "https://dice-guest-react.vercel.app"
  );
  const appUrl = hasCoords
    ? `nmap://place?lat=${data.latitude}&lng=${data.longitude}&name=${encodeURIComponent(data.name)}&appname=${appName}`
    : data.address
      ? `nmap://search?query=${encodeURIComponent(data.address)}&appname=${appName}`
      : "";

  const handleOpenNaverMap = async () => {
    if (!browserUrl) return;

    const canUseExternalOpen =
      typeof bridge?.isNativeMethodAvailable === "function" &&
      bridge.isNativeMethodAvailable("openExternalUrl");

    if (canUseExternalOpen && bridge?.openExternalUrl) {
      try {
        await bridge.openExternalUrl(appUrl || browserUrl, browserUrl);
        return;
      } catch {
        // 브리지 실패 시 웹 fallback으로 새 탭을 연다.
      }
    }

    window.open(browserUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed left-1/2 top-0 bottom-0 flex w-full max-w-(--common-max-width) -translate-x-1/2 flex-col overflow-hidden bg-dice-white"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* 상단 바 */}
      <header
        className="flex shrink-0 border-b border-stroke-eee bg-dice-white"
        style={{
          paddingLeft: "3px",
          paddingRight: "3px",
        }}
      >
        <div className="relative flex min-h-[44px] w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-dice-black transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="뒤로 가기"
          >
            <ArrowRightIcon className="size-6" aria-hidden />
          </button>
          <h1 className="pointer-events-none absolute left-0 right-0 text-center typo-subtitle3 text-dice-black">
            {data.name} 위치
          </h1>
          <div className="w-3 shrink-0" aria-hidden />
        </div>
      </header>

      {/* 지도 (나머지 높이 전체) */}
      <div className="flex-1 min-h-0 relative">
        {hasCoords ? (
          <NaverMap
            latitude={data.latitude!}
            longitude={data.longitude!}
            title={data.name}
            height={undefined}
            zoom={16}
            interactive={true}
          />
        ) : (
          <div className="flex h-full items-center justify-center typo-body1 text-gray-semilight">
            위치 정보가 없습니다.
          </div>
        )}
      </div>

      {/* 하단 주소 + 길찾기 */}
      <div className="shrink-0 border-t border-stroke-eee bg-white px-5 py-1 space-y-3">
        {data.address && <p className="typo-body1 text-gray-deep">{data.address}</p>}
        {browserUrl && (
          <button
            type="button"
            onClick={handleOpenNaverMap}
            className="typo-button1 block w-full rounded-lg bg-dice-black py-3 text-center text-white transition-opacity hover:opacity-90"
          >
            네이버 지도에서 열기
          </button>
        )}
      </div>
    </div>
  );
}
