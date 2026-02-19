import { createFileRoute, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { getMyBrandInfo, queryKeys } from "@/api";

export const Route = createFileRoute("/reservation/apply")({
  component: ReservationApplyLayout,
});

function ReservationApplyLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/reservation/apply";

  if (!isIndex) {
    return <Outlet />;
  }

  return <ReservationApplyPage />;
}

function ReservationApplyPage() {
  const navigate = useNavigate();
  const { data: brandList, isLoading } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
  });
  const brand = brandList && brandList.length > 0 ? brandList[0] : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/reservation" });
    }
  };

  const handleNext = () => {
    navigate({ to: "/reservation/apply/info" });
  };

  const imageUrls = brand ? [brand.logoUrl, ...(brand.imageUrls ?? [])].filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-dice-white">
      <header className="relative flex shrink-0 items-center justify-between px-[3px] py-12">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-(--dice-black) transition-colors hover:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowRightIcon className="h-24 w-24" aria-hidden />
        </button>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center typo-subtitle3 text-(--dice-black)">
          예약 신청
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="px-(--spacing-screen-x) pt-32">
        {isLoading && (
          <p className="py-8 text-center typo-body2 text-gray-medium">
            브랜드 정보를 불러오는 중...
          </p>
        )}

        {!isLoading && !brand && (
          <p className="py-8 text-center typo-body2 text-gray-medium">
            등록된 브랜드 프로필이 없어요.
          </p>
        )}

        {!isLoading && brand && (
          <div className="space-y-32">
            <section className="space-y-8">
              <h2 className="typo-subtitle2 text-(--dice-black)">브랜드 프로필을 확인해주세요</h2>
              <p className="typo-body1 text-gray-medium">
                해당 브랜드 프로필로 공간 예약이 신청되어요
              </p>
            </section>

            <section className="space-y-8">
              <h3 className="typo-caption1 text-(--dice-black)">브랜드 이름</h3>
              <p className="typo-body2 text-(--gray-dark)">{brand.name}</p>
            </section>

            <section className="space-y-8">
              <h3 className="typo-caption1 text-(--dice-black)">브랜드 소개</h3>
              <p className="typo-body2 whitespace-pre-line text-(--gray-dark)">
                {brand.description || "-"}
              </p>
            </section>

            <section className="space-y-8">
              <h3 className="typo-caption1 text-(--dice-black)">브랜드, 상품 관련 이미지</h3>
              <div className="flex flex-wrap gap-12">
                {imageUrls.length > 0 ? (
                  imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ))
                ) : (
                  <p className="typo-body2 text-gray-medium">등록된 이미지가 없어요</p>
                )}
              </div>
            </section>
          </div>
        )}
        {/* 하단 고정 버튼에 가리지 않도록 스크롤 여백 */}
        <div aria-hidden style={{ minHeight: "calc(100px + env(safe-area-inset-bottom))" }} />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-sm bg-dice-white px-(--spacing-screen-x) pt-16"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors hover:opacity-90"
        >
          다음
        </button>
      </div>
    </div>
  );
}
