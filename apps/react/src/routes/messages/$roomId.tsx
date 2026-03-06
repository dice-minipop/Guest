import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import SirenIcon from "@/assets/icons/Message/siren.svg?react";
import { BottomSheet } from "@/components/BottomSheet";
import {
  getMessageDetailData,
  getMessageLists,
  reportChatRoom,
  sendMessage as sendMessageApi,
  queryKeys,
} from "@/api";
import { canUseMemberOnlyApi } from "@/api/axios";
import { getDummyMessageDetail, DUMMY_MESSAGE_ROOMS } from "@/api/message/dummy";
import type { MessageData } from "@/api";
import { backWithHistory } from "@/shared/navigation/back";

const REPORT_REASONS = [
  "스팸/광고",
  "욕설·비방",
  "부적절한 대화",
  "사기·거래 유도",
  "기타",
] as const;

export const Route = createFileRoute("/messages/$roomId")({
  component: MessageRoomPage,
});

function formatTimeAmPm(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function formatDateHeader(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getDateKey(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  } catch {
    return iso;
  }
}

function MessageBubble({ message }: { message: MessageData }) {
  const isMine = message.isLoginUsersMessage;
  return (
    <div
      className={`typo-body1 max-w-[80%] border py-[8px] px-[12px] ${
        isMine
          ? "rounded-tl-[8px] rounded-tr-[1px] rounded-br-[8px] rounded-bl-[8px] border-gray-dark bg-gray-dark text-white"
          : "rounded-tl-[1px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] border-stroke-eee bg-dice-white text-gray-deep"
      }`}
    >
      <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
    </div>
  );
}

function MessageRoomPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { roomId } = Route.useParams();
  const roomIdNum = Number(roomId);
  const isMemberOnlyAllowed = canUseMemberOnlyApi();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);

  const { data: rooms } = useQuery({
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

  const currentRoom = rooms?.find((r) => r.id === roomIdNum);
  const spaceName = currentRoom?.spaceName ?? "알 수 없는 공간";

  const { data: messageData, isLoading } = useQuery({
    queryKey: queryKeys.message.detail(roomIdNum, { page: 0, size: 50 }),
    queryFn: async () => {
      try {
        return await getMessageDetailData(roomIdNum, 0, 50);
      } catch {
        return getDummyMessageDetail(roomIdNum);
      }
    },
    enabled: isMemberOnlyAllowed && Number.isInteger(roomIdNum) && roomIdNum > 0,
  });

  const messages = messageData?.content ?? [];

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/messages", state: { transitionDirection: "back" } });
    }
  };

  const handleReportSubmit = async () => {
    if (!selectedReportReason || reporting) return;
    setReporting(true);
    try {
      await reportChatRoom({ messageRoomId: roomIdNum, reason: selectedReportReason });
      setReportSheetOpen(false);
      setSelectedReportReason(null);
      alert("신고가 접수되었습니다.");
    } catch {
      alert("신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setReporting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await sendMessageApi(roomIdNum, { content: trimmed, type: "TEXT" });
      setContent("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.message.detail(roomIdNum) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.message.list });
    } catch {
      queryClient.setQueryData(
        queryKeys.message.detail(roomIdNum, { page: 0, size: 50 }),
        (prev: typeof messageData) => {
          if (!prev) return prev;
          const newMsg: MessageData = {
            id: Date.now(),
            content: trimmed,
            type: "TEXT",
            senderName: "나",
            senderId: 0,
            createdAt: new Date().toISOString(),
            isLoginUsersMessage: true,
          };
          return {
            ...prev,
            content: [...prev.content, newMsg],
            totalElements: prev.totalElements + 1,
          };
        }
      );
      setContent("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light-gray pb-[72px]">
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

          <p
            className="min-w-0 flex-1 truncate text-center typo-subtitle3 text-gray-dark"
            aria-label={`${spaceName} 담당자와의 쪽지`}
          >
            {spaceName}
          </p>

          <button
            type="button"
            onClick={() => setReportSheetOpen(true)}
            className="w-[48px] h-[48px] flex shrink-0 items-center justify-center text-gray-dark transition-opacity hover:opacity-80 active:opacity-70"
            aria-label="채팅방 신고"
          >
            <SirenIcon className="size-24" aria-hidden />
          </button>
        </div>
      </header>

      <BottomSheet
        open={reportSheetOpen}
        onClose={() => {
          setReportSheetOpen(false);
          setSelectedReportReason(null);
        }}
        sheetTitle="채팅방 신고"
        sheetDescription="신고 사유를 선택해 주세요"
        content={
          <div className="overflow-y-auto py-24 px-5 pb-20">
            <h3 className="typo-caption1 mb-3 text-gray-dark">신고 사유</h3>
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => {
                const selected = selectedReportReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReportReason(reason)}
                    className={`w-full rounded-lg border p-16 text-left typo-subtitle3 transition-colors ${
                      selected
                        ? "border-dice-black bg-bg-light-gray text-dice-black"
                        : "border-stroke-eee bg-dice-white text-gray-medium"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!selectedReportReason || reporting}
              onClick={handleReportSubmit}
              className="typo-button1 mt-24 w-full rounded-lg bg-dice-black py-[15.5px] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {reporting ? "처리 중..." : "신고하기"}
            </button>
          </div>
        }
      />

      <div
        className="px-(--spacing-screen-x) pb-4"
        style={{
          paddingTop:
            "calc(max(var(--spacing-12), env(safe-area-inset-top, 0px)) + 48px + var(--spacing-12) + 12px)",
        }}
      >
        <p className="typo-caption1 rounded-lg p-16 bg-bg-white mb-24 text-center leading-relaxed text-gray-deep">
          &lsquo;{spaceName}&rsquo; 담당자님과의 쪽지가 시작되었습니다. 불필요한 비방과 부적절한
          언행은 제재 대상이 될 수 있습니다.
        </p>

        {!isMemberOnlyAllowed ? (
          <p className="typo-body2 text-gray-deep py-4">
            회원 전용 기능입니다. 로그인 후 이용해 주세요.
          </p>
        ) : isLoading ? (
          <p className="typo-body2 text-gray-deep py-4">메시지를 불러오는 중...</p>
        ) : messages.length === 0 ? (
          <p className="typo-body2 text-gray-deep py-4">아직 메시지가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, index) => {
              const prevDateKey = index > 0 ? getDateKey(messages[index - 1].createdAt) : null;
              const currentDateKey = getDateKey(msg.createdAt);
              const showDateHeader = prevDateKey !== currentDateKey;

              return (
                <div key={msg.id} className="flex flex-col gap-16">
                  {showDateHeader ? (
                    <p className="typo-caption2 py-8 text-center text-gray-dark">
                      {formatDateHeader(msg.createdAt)}
                    </p>
                  ) : null}
                  <div
                    className={`flex w-full flex-col items-end gap-4 ${msg.isLoginUsersMessage ? "items-end" : "items-start"}`}
                  >
                    <span className="typo-caption1 text-gray-medium">
                      {formatTimeAmPm(msg.createdAt)}
                    </span>
                    <MessageBubble message={msg} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-1/2 z-10 w-full max-w-(--common-max-width) -translate-x-1/2 border-t border-neutral-200 bg-dice-white"
        style={{
          paddingBottom: "max(var(--spacing-12), env(safe-area-inset-bottom, 0px))",
          paddingLeft: "var(--spacing-screen-x)",
          paddingRight: "var(--spacing-screen-x)",
          paddingTop: "var(--spacing-12)",
        }}
      >
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="typo-body2 min-h-10 flex-1 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-dice-black placeholder:text-gray-deep focus:border-dice-black focus:outline-none"
            aria-label="메시지 입력"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="typo-subtitle3 h-10 shrink-0 rounded-lg bg-dice-black px-4 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
