import { Link } from "@tanstack/react-router";
import type { MessageRoom } from "@/api";
import { SpaceImage } from "@/shared/ui/space-image-fallback";

function formatMessageTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export interface MessageRoomCardProps {
  item: MessageRoom;
}

export function MessageRoomCard({ item }: MessageRoomCardProps) {
  const timeText = formatMessageTime(item.lastMessageAt);
  const lastMessage =
    item.lastMessage?.trim().slice(0, 40) + (item.lastMessage?.length > 40 ? "…" : "") ||
    "메시지 없음";

  return (
    <li className="w-full list-none">
      <Link
        to="/messages/$roomId"
        params={{ roomId: String(item.id) }}
        state={{ transitionDirection: "forward" }}
        className="flex items-center w-full gap-12 py-8"
      >
        {/* 공간 이미지 */}
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
          <SpaceImage
            src={item.spaceImage}
            alt=""
            className="size-full object-cover"
          />
        </div>

        {/* 공간명+마지막 메시지 | 시간+안읽은 개수 (간격 4px) */}
        <div className="flex min-w-0 flex-1 flex-row gap-4">
          <div className="min-w-0 flex-1 flex flex-col">
            <span className="typo-subtitle3 truncate block text-gray-dark">
              {item.spaceName || "알 수 없는 공간"}
            </span>
            <p className="typo-body2 line-clamp-2 text-gray-medium">{lastMessage}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-8">
            {timeText ? (
              <span className="typo-caption2 whitespace-nowrap text-gray-light">{timeText}</span>
            ) : null}
            {item.unreadCount > 0 ? (
              <span className="typo-caption2 flex min-h-24 min-w-24 items-center justify-center rounded-full bg-system-red px-2 py-0.5 text-white">
                {item.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
