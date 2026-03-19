import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getGuestInfo, queryKeys } from "@/api";
import { BackHeader } from "@/components/BackHeader";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/mypage/profile")({
  component: MypageProfilePage,
});

const inputBase =
  "typo-body2 w-full appearance-none rounded-lg border border-(--gray-light) bg-(--gray-light) px-4 py-3 text-[16px] text-(--gray-dark) cursor-not-allowed";

function MypageProfilePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.guest.info,
    queryFn: getGuestInfo,
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <BackHeader title="회원 정보 관리" onBack={handleBack} />
      <div aria-hidden style={{ minHeight: 48 }} />
      <div className="px-5 pt-8">
        {isLoading ? (
          <p className="mt-1 typo-body2 text-(--gray-deep)">불러오는 중...</p>
        ) : (
          <div className="mt-1.5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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
    </div>
  );
}
