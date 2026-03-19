import {
  createFileRoute,
  useNavigate,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import MessageIcon from "@/assets/icons/Message/message.svg?react";
import { MessageRoomCard } from "@/components/MessageRoomCard";
import { BackHeader } from "@/components/BackHeader";
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
      <BackHeader onBack={handleBack} />
      <div aria-hidden style={{ minHeight: 48 }} />
      <h1 className="flex items-center gap-2 typo-h1 text-dice-black px-5 pt-8 pb-6 border-b border-(--stroke-eee)">
        호스트와의 쪽지함
        <MessageIcon />
      </h1>

      <div className="px-5 py-6">
        {!isMemberOnlyAllowed ? (
          <p className="typo-body2 text-gray-deep">
            회원 전용 기능입니다. 로그인 후 이용해 주세요.
          </p>
        ) : isLoading ? (
          <p className="typo-body2 text-gray-deep">쪽지 목록을 불러오는 중...</p>
        ) : !rooms?.length ? (
          <p className="typo-body2 text-gray-deep">아직 쪽지방이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rooms.map((room) => (
              <MessageRoomCard key={room.id} item={room} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
