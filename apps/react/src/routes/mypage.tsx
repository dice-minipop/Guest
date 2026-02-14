import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyBrandInfo, logout, queryKeys } from "@/api";
import { clearTokens } from "@/api/axios";
import { bridge } from "@/bridge";

const TERMS_URL = "https://juvenile-chess-b24.notion.site/18e7ece7ecb5800e99a0eedd7976c022?pvs=4";
const PRIVACY_URL = "https://juvenile-chess-b24.notion.site/18e7ece7ecb5806dab25c6fe7c424d7c?pvs=4";

function openExternal(url: string) {
  if (bridge?.openInAppBrowser) {
    bridge.openInAppBrowser(url).catch(() => window.open(url, "_blank"));
  } else {
    window.open(url, "_blank");
  }
}

export const Route = createFileRoute("/mypage")({
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

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: queryKeys.brand.myInfo,
    queryFn: getMyBrandInfo,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });

  const brandList = Array.isArray(brands) ? brands : [];
  const hasBrands = brandList.length > 0;

  return (
    <div className="min-h-screen bg-(--bg-white)">
      <div>
        {/* 내 브랜드 정보 */}
        <section className="mb-6">
          {hasBrands ? (
            <ul className="flex flex-col gap-4">
              {brandList.map((b) => {
                const bgImage = b.logoUrl || (Array.isArray(b.imageUrls) && b.imageUrls[0]) || "";
                const itemImages = Array.isArray(b.imageUrls) ? b.imageUrls : [];
                return (
                  <li key={b.id} className="relative overflow-hidden bg-(--gray-light)">
                    {/* 배경 이미지 */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
                    />
                    {/* Dim */}
                    <div className="absolute inset-0 bg-(--dim-basic)" />
                    {/* 콘텐츠 */}
                    <div className="relative flex flex-col gap-3 p-4">
                      <div>
                        <p className="typo-h1 text-white">{b.name}</p>
                        {b.description ? (
                          <p className="typo-body2 text-gray-light line-clamp-2">{b.description}</p>
                        ) : null}
                      </div>
                      {/* 브랜드 아이템 사진 목록 (가로 스크롤) */}
                      {itemImages.length > 0 ? (
                        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
                          <ul className="flex gap-2">
                            {itemImages.map((url, i) => (
                              <li
                                key={`${b.id}-${i}`}
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
              })}
            </ul>
          ) : (
            <Link
              to="/mypage/brand-profile"
              className="block bg-black px-(--spacing-screen-x) py-6"
            >
              <p className="typo-subtitle1 font-medium text-white">브랜드 프로필을 작성해주세요</p>
              <p className="typo-body2 text-gray-light">
                팝업 공간을 대여해주는 호스트와 신뢰할 수 있는 거래를 위해 브랜드를 1~2문장으로 짧게
                설명해주세요
              </p>
              <div className="mt-4 -mx-(--spacing-screen-x) overflow-x-auto px-(--spacing-screen-x) scrollbar-none">
                <div className="flex w-max flex-nowrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 w-20 shrink-0 rounded-lg bg-white" aria-hidden />
                  ))}
                </div>
              </div>
              {brandsLoading ? (
                <p className="mt-4 typo-caption2 text-white/70">불러오는 중...</p>
              ) : null}
            </Link>
          )}
        </section>

        <section className="px-(--spacing-screen-x)">
          {/* 찜한 목록 / 쪽지함 */}
          <nav className="border-b border-(--stroke-eee) py-24">
            <Link
              to="/mypage/liked"
              className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
            >
              <span>찜한 목록</span>
            </Link>
            <Link
              to="/mypage/messages"
              className="flex items-center justify-between py-12 typo-subtitle3 text-(--gray-deep) active:opacity-80"
            >
              <span>쪽지함</span>
            </Link>
          </nav>

          {/* 회원 정보 / 이용 약관 / 개인정보 처리방침 */}
          <nav className="border-b border-(--stroke-eee) py-24">
            <Link
              to="/mypage/profile"
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
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center justify-between py-4 typo-subtitle3 text-(--gray-deep) active:opacity-80"
            >
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </section>

        <div className="bg-(--bg-light-gray) h-8 mb-24" />

        <section className="px-(--spacing-screen-x)">
          {/* 탈퇴하기 */}
          <div className="mt-4">
            <Link
              to="/mypage/withdraw"
              className="flex items-center justify-between py-4 typo-subtitle3 text-(--gray-deep) active:opacity-80"
            >
              탈퇴하기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
