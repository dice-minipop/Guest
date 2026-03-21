import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useTabScrollStorage } from "@/hooks/useTabScrollStorage";
import { useLoginRequiredModal } from "@/hooks/useLoginRequiredModal";
import { clearScrollStorage, MYPAGE_SCROLL_STORAGE_KEY } from "@/lib/scrollStorage";
import { getMyBrandInfo, logout, queryKeys } from "@/api";
import { canUseMemberOnlyApi, clearTokens, isGuestMode } from "@/api/axios";
import { bridge } from "@/bridge";
import EditIcon from "@/assets/icons/Brand/edit.svg?react";

const TERMS_URL = "https://juvenile-chess-b24.notion.site/18e7ece7ecb5800e99a0eedd7976c022?pvs=4";
const PRIVACY_URL = "https://juvenile-chess-b24.notion.site/18e7ece7ecb5806dab25c6fe7c424d7c?pvs=4";

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

export const Route = createFileRoute("/mypage/")({
  component: MypageLayout,
});

function MypageLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/mypage";
  if (!isIndex) return <Outlet />;
  return <MypagePage />;
}

function MypagePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isGuest = isGuestMode();
  const { openLoginRequiredModal, loginRequiredModal } = useLoginRequiredModal();

  const { data: brands, isFetched } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
    enabled: !isGuest,
  });

  useTabScrollStorage({
    storageKey: MYPAGE_SCROLL_STORAGE_KEY,
    scrollContainerRef,
    restoreDeps: [isFetched],
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearTokens();
      clearScrollStorage();
      queryClient.clear();
      navigate({ to: "/", replace: true, state: { transitionDirection: "back" } });
    },
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const hasBrands = brandList.length > 0;
  const primaryBrand = hasBrands ? brandList[0] : null;

  const handleMemberOnlyButtonClick = (e: React.MouseEvent) => {
    if (canUseMemberOnlyApi()) return;
    e.preventDefault();
    openLoginRequiredModal();
  };

  const handleLogoutClick = () => {
    if (isGuest) {
      clearTokens();
      clearScrollStorage();
      queryClient.clear();
      navigate({ to: "/", replace: true, state: { transitionDirection: "back" } });
      return;
    }
    logoutMutation.mutate();
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden bg-(--bg-white)"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div className="min-w-0 pb-16">
        {/* 내 브랜드 정보: EditIcon + 브랜드 콘텐츠 하나의 섹션 */}
        <section className="mb-1.5">
          <div className="flex flex-col">
            <Link
              to="/mypage/brand-profile"
              state={{ transitionDirection: "forward" }}
              onClick={handleMemberOnlyButtonClick}
              className="flex justify-end bg-dice-black p-3"
            >
              <EditIcon className="size-6" aria-hidden />
            </Link>
            {primaryBrand ? (
              <ul className="flex flex-col gap-1">
                {(() => {
                  const bgImage =
                    primaryBrand.logoUrl ||
                    (Array.isArray(primaryBrand.imageUrls) && primaryBrand.imageUrls[0]) ||
                    "";
                  const itemImages = Array.isArray(primaryBrand.imageUrls)
                    ? primaryBrand.imageUrls
                    : [];

                  return (
                    <li
                      key={primaryBrand.id}
                      className="relative overflow-hidden bg-(--gray-light)"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
                      />
                      {bgImage ? <div className="absolute inset-0 bg-(--dim-basic)" /> : null}
                      <div className="relative flex flex-col gap-3 p-1">
                        <div className={`block py-4 pl-5 space-y-4 ${bgImage ? "bg-transparent" : "bg-black"}`}>
                          <p className="typo-h1 text-white">{primaryBrand.name}</p>
                          {primaryBrand.description ? (
                            <p className="typo-body2 text-gray-light line-clamp-2">
                              {primaryBrand.description}
                            </p>
                          ) : null}

                          <div className="mt-1 overflow-x-auto scrollbar-none">
                            <div className="flex w-max flex-nowrap gap-1">
                              {itemImages.length > 0 ? (
                                <ul className="flex gap-1">
                                  {itemImages.map((url, i) => (
                                    <li
                                      key={`${primaryBrand.id}-${i}`}
                                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl last:mr-5"
                                    >
                                      <img
                                        src={url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })()}
              </ul>
            ) : (
              <div className="block bg-black py-4 pl-5 space-y-4">
                <p className="typo-h1 text-white pr-5">브랜드 프로필을 작성해주세요</p>
                <p className="typo-body2 text-gray-light pr-5">
                  팝업 공간을 대여해주는 호스트와 신뢰할 수 있는 거래를 위해 브랜드를 1~2문장으로
                  짧게 설명해주세요
                </p>
                <div className="mt-1 overflow-hidden">
                  <div className="flex w-max flex-nowrap gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 w-20 shrink-0 rounded-xl bg-white" aria-hidden />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="bg-(--bg-white)">
          <section className="px-5">
            {/* 찜한 목록 / 쪽지함 */}
            <nav className="border-b border-(--stroke-eee) py-6">
              <Link
                to="/liked"
                state={{ transitionDirection: "forward" }}
                onClick={handleMemberOnlyButtonClick}
                className="flex items-center justify-between py-3 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>찜한 목록</span>
              </Link>
              <Link
                to="/messages"
                state={{ transitionDirection: "forward" }}
                onClick={handleMemberOnlyButtonClick}
                className="flex items-center justify-between py-3 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>쪽지함</span>
              </Link>
            </nav>

            {/* 회원 정보 / 이용 약관 / 개인정보 처리방침 */}
            <nav className="border-b border-(--stroke-eee) py-6">
              <Link
                to="/mypage/profile"
                state={{ transitionDirection: "forward" }}
                onClick={handleMemberOnlyButtonClick}
                className="flex items-center justify-between py-3 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>회원 정보 관리</span>
              </Link>
              <button
                type="button"
                onClick={() => openExternal(TERMS_URL)}
                className="flex items-center justify-between py-3 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>이용 약관</span>
              </button>
              <button
                type="button"
                onClick={() => openExternal(PRIVACY_URL)}
                className="flex items-center justify-between py-3 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>개인정보 처리방침</span>
              </button>
            </nav>

            {/* 로그아웃 */}
            <div className="py-6">
              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={!isGuest && logoutMutation.isPending}
                className="flex items-center justify-between py-1 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                {isGuest
                  ? "게스트로 둘러보기 종료"
                  : logoutMutation.isPending
                    ? "로그아웃 중..."
                    : "로그아웃"}
              </button>
            </div>
          </section>

          {!isGuest && (
            <>
              <div className="bg-(--bg-light-gray) h-2 mb-6" />

              <section className="px-5 pb-8">
                {/* 탈퇴하기 */}
                <div className="mt-1">
                  <Link
                    to="/mypage/withdraw"
                    state={{ transitionDirection: "forward" }}
                    className="flex items-center justify-between py-1 typo-subtitle3 text-(--gray-deep) active:opacity-80"
                  >
                    탈퇴하기
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {loginRequiredModal}
    </div>
  );
}
