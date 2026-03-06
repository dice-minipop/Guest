import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowRightIcon from "@/assets/icons/Arrow/right.svg?react";
import { getAlarms, readAllAlarms, readAlarm, deleteAlarm, queryKeys } from "@/api";
import { canUseMemberOnlyApi } from "@/api/axios";
import type { AlarmItem } from "@/api";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/alarms/")({
  component: AlarmsPage,
});

function AlarmsPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMemberOnlyAllowed = canUseMemberOnlyApi();

  const {
    data: alarms,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.alarm.list,
    queryFn: getAlarms,
    enabled: isMemberOnlyAllowed,
  });

  const readAllMutation = useMutation({
    mutationFn: readAllAlarms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alarm.all });
    },
  });

  const readMutation = useMutation({
    mutationFn: readAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alarm.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alarm.all });
    },
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/mypage", state: { transitionDirection: "back" } });
    }
  };

  const unreadCount = alarms?.filter((a) => !a.isRead).length ?? 0;

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

          <h1 className="absolute left-0 right-0 text-center typo-subtitle3 text-dice-black pointer-events-none">
            알림
          </h1>

          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>

      <div className="flex min-h-screen flex-col px-(--spacing-screen-x) pt-24 pb-8">
        {!isMemberOnlyAllowed && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="typo-body2 text-center text-(--gray-deep)">
              회원 전용 기능입니다. 로그인 후 이용해 주세요.
            </p>
          </div>
        )}

        {isMemberOnlyAllowed && isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="typo-body2 text-center text-(--gray-deep)">알림 목록을 불러오는 중...</p>
          </div>
        )}

        {isMemberOnlyAllowed && isError && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 typo-body2 text-center text-red-700">
              {error instanceof Error ? error.message : "알림 목록을 불러오지 못했습니다."}
            </div>
          </div>
        )}

        {isMemberOnlyAllowed && !isLoading && !isError && (!alarms || alarms.length === 0) && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="typo-body2 text-center text-(--gray-deep)">현재는 받은 알림이 없어요.</p>
          </div>
        )}

        {isMemberOnlyAllowed && !isLoading && !isError && alarms && alarms.length > 0 && (
          <>
            {unreadCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => readAllMutation.mutate()}
                  disabled={readAllMutation.isPending}
                  className="typo-body2 text-gray-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  전체 읽음
                </button>
              </div>
            )}
            <ul className="flex flex-col gap-4">
              {alarms.map((item) => (
                <AlarmCard
                  key={item.alarmId}
                  item={item}
                  onRead={() => readMutation.mutate(item.alarmId)}
                  onDelete={() => deleteMutation.mutate(item.alarmId)}
                  isReadPending={readMutation.isPending && readMutation.variables === item.alarmId}
                  isDeletePending={
                    deleteMutation.isPending && deleteMutation.variables === item.alarmId
                  }
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

interface AlarmCardProps {
  item: AlarmItem;
  onRead: () => void;
  onDelete: () => void;
  isReadPending: boolean;
  isDeletePending: boolean;
}

function AlarmCard({ item, onRead, onDelete, isReadPending, isDeletePending }: AlarmCardProps) {
  return (
    <li
      className={`rounded-lg border p-4 ${
        item.isRead ? "border-neutral-200 bg-neutral-50" : "border-neutral-300 bg-white"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2
            className={`typo-subtitle3 flex-1 ${item.isRead ? "text-gray-medium" : "text-dice-black font-medium"}`}
          >
            {item.title}
          </h2>
          <div className="flex shrink-0 gap-2">
            {!item.isRead && (
              <button
                type="button"
                onClick={onRead}
                disabled={isReadPending}
                className="typo-caption2 text-gray-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                읽음
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeletePending}
              className="typo-caption2 text-gray-medium underline transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </div>
        <p className="typo-body2 text-gray-dark line-clamp-3">{item.content}</p>
      </div>
    </li>
  );
}
