import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTabScrollStorage } from "@/hooks/useTabScrollStorage";
import { clearScrollStorage, MYPAGE_SCROLL_STORAGE_KEY } from "@/lib/scrollStorage";
import { getMyBrandInfo, logout, queryKeys } from "@/api";
import { canUseMemberOnlyApi, clearTokens, isGuestMode } from "@/api/axios";
import { bridge } from "@/bridge";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isGuest = isGuestMode();

  const { data: brands, isFetched } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
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
      // 로그아웃 후에는 로그인 화면이 아니라 index로 스택을 초기화해 이동한다.
      window.location.replace("/");
    },
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const hasBrands = brandList.length > 0;
  const primaryBrand = hasBrands ? brandList[0] : null;

  const handleMemberOnlyButtonClick = (e: React.MouseEvent) => {
    if (canUseMemberOnlyApi()) return;
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const handleLogoutClick = () => {
    if (isGuest) {
      clearTokens();
      clearScrollStorage();
      queryClient.clear();
      // 라우터 스택 상태를 초기화하기 위해 전체 replace 이동
      window.location.replace("/");
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
      <div className="min-w-0 pb-64">
        {/* 내 브랜드 정보: EditIcon + 브랜드 콘텐츠 하나의 섹션 */}
        <section className="mb-6">
          <div className="flex flex-col">
            <Link
              to="/mypage/brand-profile"
              state={{ transitionDirection: "forward" }}
              className="flex justify-end bg-dice-black p-12"
            >
              <EditIcon className="size-24" aria-hidden />
            </Link>
            {primaryBrand ? (
              <ul className="flex flex-col gap-4">
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
                      <div className="relative flex flex-col gap-3 p-4">
                        <div>
                          <p className="typo-h1 text-white">{primaryBrand.name}</p>
                          {primaryBrand.description ? (
                            <p className="typo-body2 text-gray-light line-clamp-2">
                              {primaryBrand.description}
                            </p>
                          ) : null}
                        </div>
                        {itemImages.length > 0 ? (
                          <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
                            <ul className="flex gap-2">
                              {itemImages.map((url, i) => (
                                <li
                                  key={`${primaryBrand.id}-${i}`}
                                  className="h-20 w-20 shrink-0 overflow-hidden"
                                >
                                  <img src={url} alt="" className="h-full w-full object-cover" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })()}
              </ul>
            ) : (
              // <Link
              //   to="/mypage/brand-profile"
              //   className="block bg-black py-16 pl-(--spacing-screen-x) space-y-16"
              // >
              <div className="block bg-black py-16 pl-(--spacing-screen-x) space-y-16">
                <p className="typo-h1 text-white pr-(--spacing-screen-x)">
                  브랜드 프로필을 작성해주세요
                </p>
                <p className="typo-body2 text-gray-light pr-(--spacing-screen-x)">
                  팝업 공간을 대여해주는 호스트와 신뢰할 수 있는 거래를 위해 브랜드를 1~2문장으로
                  짧게 설명해주세요
                </p>
                <div className="mt-4 -mx-4 overflow-x-auto px-4 scrollbar-none">
                  <div className="flex w-max flex-nowrap gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 w-20 shrink-0 rounded-lg bg-white" aria-hidden />
                    ))}
                  </div>
                </div>
              </div>
              // </Link>
            )}
          </div>
        </section>

        <div className="bg-(--bg-white)">
          <section className="px-(--spacing-screen-x)">
            {/* 찜한 목록 / 쪽지함 */}
            <nav className="border-b border-(--stroke-eee) py-24">
              <Link
                to="/liked"
                state={{ transitionDirection: "forward" }}
                onClick={handleMemberOnlyButtonClick}
                className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>찜한 목록</span>
              </Link>
              <Link
                to="/messages"
                state={{ transitionDirection: "forward" }}
                onClick={handleMemberOnlyButtonClick}
                className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>쪽지함</span>
              </Link>
            </nav>

            {/* 회원 정보 / 이용 약관 / 개인정보 처리방침 */}
            <nav className="border-b border-(--stroke-eee) py-24">
              <Link
                to="/mypage/profile"
                state={{ transitionDirection: "forward" }}
                className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>회원 정보 관리</span>
              </Link>
              <button
                type="button"
                onClick={() => openExternal(TERMS_URL)}
                className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>이용 약관</span>
              </button>
              <button
                type="button"
                onClick={() => openExternal(PRIVACY_URL)}
                className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                <span>개인정보 처리방침</span>
              </button>
            </nav>

            {/* 로그아웃 */}
            <div className="py-24">
              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={!isGuest && logoutMutation.isPending}
                className="flex items-center justify-between py-4 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                {isGuest
                  ? "게스트로 둘러보기 종료"
                  : logoutMutation.isPending
                    ? "로그아웃 중..."
                    : "로그아웃"}
              </button>
            </div>
          </section>

          <div className="bg-(--bg-light-gray) h-8 mb-24" />

          <section className="px-(--spacing-screen-x) pb-32">
            {/* 탈퇴하기 */}
            <div className="mt-4">
              <Link
                to="/mypage/withdraw"
                state={{ transitionDirection: "forward" }}
                className="flex items-center justify-between py-4 typo-subtitle3 text-(--gray-deep) active:opacity-80"
              >
                탈퇴하기
              </Link>
            </div>
          </section>
        </div>
      </div>
      <LoginRequiredModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={() => {
          setIsLoginModalOpen(false);
          navigate({ to: "/login" });
        }}
      />
    </div>
  );
}
