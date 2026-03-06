import {
  createFileRoute,
  useNavigate,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import MessageIcon from "@/assets/icons/Message/message.svg?react";
import { MessageRoomCard } from "@/components/MessageRoomCard";
import { getMessageLists, queryKeys } from "@/api";
import { canUseMemberOnlyApi } from "@/api/axios";
import { DUMMY_MESSAGE_ROOMS } from "@/api/message/dummy";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/messages/")({
  component: MessagesLayout,
});

function MessagesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetailPage = pathname !== "/messages" && pathname.startsWith("/messages/");

  if (isDetailPage) return <Outlet />;
  return <MessagesPage />;
}

function MessagesPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const isMemberOnlyAllowed = canUseMemberOnlyApi();

  const { data: rooms, isLoading } = useQuery({
    queryKey: queryKeys.message.list,
    queryFn: async () => {
      try {
        return await getMessageLists();
      } catch {
        return DUMMY_MESSAGE_ROOMS;
      }
    },
    enabled: isMemberOnlyAllowed,
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
      <header
        className="fixed top-0 left-1/2 z-10 w-full max-w-(--common-max-width) -translate-x-1/2 bg-dice-white"
        style={{
          paddingLeft: "3px",
          paddingRight: "3px",
        }}
      >
        <div className="relative flex min-h-[44px] w-full items-center">
          <button
            type="button"
            onClick={handleBack}
            className="w-[48px] h-[48px] flex shrink-0 items-center justify-center typo-subtitle1 text-white transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="뒤로가기"
          >
            <ArrowRightIcon className="size-24" aria-hidden />
          </button>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>

      <h1 className="flex items-center gap-8 typo-h1 text-dice-black px-(--spacing-screen-x) pt-20 pb-24 border-b border-(--stroke-eee)">
        호스트와의 쪽지함
        <MessageIcon />
      </h1>

      <div className="px-(--spacing-screen-x) py-24">
        {!isMemberOnlyAllowed ? (
          <p className="typo-body2 text-gray-deep">
            회원 전용 기능입니다. 로그인 후 이용해 주세요.
          </p>
        ) : isLoading ? (
          <p className="typo-body2 text-gray-deep">쪽지 목록을 불러오는 중...</p>
        ) : !rooms?.length ? (
          <p className="typo-body2 text-gray-deep">아직 쪽지방이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-12">
            {rooms.map((room) => (
              <MessageRoomCard key={room.id} item={room} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
