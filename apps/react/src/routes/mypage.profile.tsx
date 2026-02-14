import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getGuestInfo, queryKeys } from "@/api";

export const Route = createFileRoute("/mypage/profile")({
  component: MypageProfilePage,
});

const inputBase =
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-(--gray-light) px-16 py-3 text-[16px] text-(--gray-dark) cursor-not-allowed";

function MypageProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.guest.info,
    queryFn: getGuestInfo,
  });

  return (
    <div className="min-h-screen bg-dice-white px-(--spacing-screen-x)">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/mypage" className="typo-body2 text-(--gray-deep) active:opacity-80">
          ‹ 마이페이지
        </Link>
      </div>
      <h1 className="typo-h1 text-(--dice-black)">회원 정보 관리</h1>

      {isLoading ? (
        <p className="mt-4 typo-body2 text-(--gray-deep)">불러오는 중...</p>
      ) : (
        <div className="mt-6 flex flex-col gap-16">
          <div className="flex flex-col gap-8">
            <label htmlFor="profile-name" className="typo-caption1 text-(--gray-dark)">
              이름
            </label>
            <input
              id="profile-name"
              type="text"
              value={data?.name ?? ""}
              disabled
              readOnly
              className={inputBase}
              aria-label="이름"
            />
          </div>
          <div className="flex flex-col gap-8">
            <label htmlFor="profile-email" className="typo-caption1 text-(--gray-dark)">
              이메일
            </label>
            <input
              id="profile-email"
              type="email"
              value={data?.email ?? ""}
              disabled
              readOnly
              className={inputBase}
              aria-label="이메일"
            />
          </div>
          <div className="flex flex-col gap-8">
            <label htmlFor="profile-phone" className="typo-caption1 text-(--gray-dark)">
              휴대폰 번호
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={data?.phone ?? ""}
              disabled
              readOnly
              className={inputBase}
              aria-label="휴대폰 번호"
            />
          </div>
        </div>
      )}
    </div>
  );
}
