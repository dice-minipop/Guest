import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { getSpaceDetailData, queryKeys } from "@/api";
import { DUMMY_SPACE_POPULATION_ANALYSIS, getDummySpaceDetail } from "@/api/space/dummy";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/space/$id/population")({
  component: SpacePopulationPage,
});

const AGE_LABELS = ["10대", "20대", "30대", "40대", "50대", "60대+"];
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function getSafeCounts(values: number[] | undefined, length: number) {
  return Array.from({ length }, (_, index) => {
    const value = values?.[index];
    return Number.isFinite(value) ? Number(value) : 0;
  });
}

function formatCount(value: number) {
  return `${value.toLocaleString("ko-KR")}명`;
}

function formatYearMonthLabel(date: string | undefined) {
  if (!date) return "-";

  const [year = "", month = ""] = date.split("-");
  if (!year || !month) return date;

  return `${year.slice(-2)}년 ${month}월 기준`;
}

function SpacePopulationPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { id } = Route.useParams();
  const spaceId = Number(id);

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
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

  // const {
  //   data: populationData,
  //   isLoading: isPopulationLoading,
  //   isError: isPopulationError,
  // } = useQuery({
  //   queryKey: queryKeys.space.populationAnalysis(spaceId),
  //   queryFn: () => getSpacePopulationAnalysis(spaceId),
  //   enabled: Number.isInteger(spaceId) && spaceId > 0,
  //   retry: false,
  // });
  const populationData = DUMMY_SPACE_POPULATION_ANALYSIS;
  const isPopulationLoading = false;
  const isPopulationError = false;

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

  if (isDetailLoading || isPopulationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">불러오는 중...</p>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-1">
        <p className="text-red-600">공간 정보를 불러오지 못했습니다.</p>
        <Link to="/space" className="mt-1 text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  const analysisSummary = detailData.analysis;
  const data = populationData;
  const hasPopulationData = data != null;

  const menCounts = getSafeCounts(data?.ageGroupsCountMan, AGE_LABELS.length);
  const womenCounts = getSafeCounts(data?.ageGroupsCountWoman, AGE_LABELS.length);
  const dayCounts = getSafeCounts(data?.dayOfWeekCount, DAY_LABELS.length);
  const maxAgeCount = Math.max(1, ...menCounts, ...womenCounts);
  const maxDayCount = Math.max(1, ...dayCounts);
  const maxMetricCount = Math.max(
    1,
    data?.locationCount ?? 0,
    data?.areaCount ?? 0,
    data?.nationalCount ?? 0
  );
  const metricCards: Array<{ label: string; value: number }> = hasPopulationData
    ? [
        {
          label: data.location || detailData.address || "위치 평균",
          value: data.locationCount,
        },
        {
          label: "서울 평균",
          value: data.areaCount,
        },
        {
          label: "전국 평균",
          value: data.nationalCount,
        },
      ]
    : [];

  return (
    <div
      className="fixed left-1/2 top-0 bottom-0 flex w-full max-w-(--common-max-width) -translate-x-1/2 flex-col overflow-hidden bg-dice-white"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <header
        className="flex shrink-0 bg-dice-white"
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
            상세 유동인구 정보
          </h1>
          <div className="w-3 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-dice-white px-5 pt-6 pb-6">
        <section>
          <p className="typo-subtitle3 text-gray-semilight">{formatYearMonthLabel(data?.date)}</p>
          <div className="mt-2">
            <h2 className="typo-h2 text-dice-black">
              {(data?.location || detailData.address || "-") + "은"}
            </h2>
            <p className="typo-subtitle2 text-system-purple">
              {(analysisSummary?.title || data?.title || "유동인구 분석") + "에요"}
            </p>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-3 gap-3">
              {metricCards.map((item, index) => (
                <div key={item.label} className="flex flex-col items-center">
                  <p
                    className={`min-h-[20px] text-center typo-button2 ${
                      index === 0 ? "text-system-purple" : "text-gray-light"
                    }`}
                  >
                    {formatCount(item.value)}
                  </p>
                  <div className="mt-4 flex h-28 items-end justify-center">
                    <div
                      className={`w-10 rounded-[4px] transition-all ${
                        index === 0 ? "bg-system-purple" : "bg-gray-light"
                      }`}
                      style={{ height: `${(item.value / maxMetricCount) * 100}%` }}
                    />
                  </div>
                  <p
                    className={`mt-4 text-center typo-caption2 ${
                      index === 0 ? "text-system-purple" : "text-gray-light"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="-mx-5 my-6 h-2 bg-bg-light-gray" />

        {hasPopulationData ? (
          <div className="space-y-4 pb-6">
            <section className="rounded-2xl bg-white p-5">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h3 className="typo-subtitle2 text-dice-black">연령·성별 분포</h3>
                  <p className="mt-1 typo-caption1 text-gray-medium">
                    남녀별 주요 연령대 유동인구를 비교해요.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {AGE_LABELS.map((label, index) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="typo-button2 text-gray-dark">{label}</span>
                      <span className="typo-caption1 text-gray-medium">
                        남 {formatCount(menCounts[index])} / 여 {formatCount(womenCounts[index])}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                      <div className="rounded-full bg-blue-50 p-1">
                        <div
                          className="h-2 rounded-full bg-blue-400 transition-all"
                          style={{ width: `${(menCounts[index] / maxAgeCount) * 100}%` }}
                        />
                      </div>
                      <div className="rounded-full bg-pink-50 p-1">
                        <div
                          className="h-2 rounded-full bg-pink-400 transition-all"
                          style={{ width: `${(womenCounts[index] / maxAgeCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white">
              <h3 className="typo-subtitle2 text-dice-black">요일별 유동인구</h3>
              <p className="mt-1 typo-caption1 text-gray-medium">
                요일별 혼잡도를 간단히 비교해요.
              </p>
              <div className="mt-5 grid w-full grid-cols-7">
                {DAY_LABELS.map((label, index) => {
                  const isHighest = dayCounts[index] === maxDayCount;

                  return (
                    <div key={label} className="flex flex-col items-center">
                      <p className="min-h-[18px] text-center typo-caption2 text-system-purple">
                        {isHighest ? formatCount(dayCounts[index]) : ""}
                      </p>
                      <div className="mt-4 flex h-28 items-end justify-center">
                        <div
                          className={`w-8 rounded-[4px] transition-all ${
                            isHighest ? "bg-system-purple" : "bg-gray-light"
                          }`}
                          style={{ height: `${(dayCounts[index] / maxDayCount) * 100}%` }}
                        />
                      </div>
                      <p className="mt-4 text-center typo-caption2 text-gray-light">{label}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <section className="mt-4 rounded-2xl bg-white p-5">
            <h3 className="typo-subtitle2 text-dice-black">상세 분석 준비 중</h3>
            <p className="mt-2 typo-body1 text-gray-deep">
              유동인구 상세 API 응답이 아직 없어서 페이지 틀만 먼저 구성해두었습니다.
            </p>
            <p className="mt-2 typo-caption1 text-gray-medium">
              API 연결 후 연령·성별, 요일별 차트, 비교 지표를 이 화면에서 바로 확장할 수 있어요.
            </p>
            {isPopulationError && (
              <p className="mt-4 typo-caption1 text-system-red">
                분석 데이터를 불러오지 못해 임시 안내만 표시하고 있습니다.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
