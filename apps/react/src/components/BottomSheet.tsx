import type { ReactNode } from "react";
import { Drawer } from "vaul";

export interface BottomSheetProps {
  /** 시트 열림 여부 */
  open: boolean;
  /** 닫을 때 호출 (백드롭 클릭, 아래로 스와이프) */
  onClose: () => void;
  /** true면 오버레이 클릭/스와이프 시 닫힘 (기본값 true) */
  dismissible?: boolean;
  /** 입력 필드 리포지션 방지 */
  preventReposition?: boolean;
  /** 시트 제목 (스크린리더용) */
  sheetTitle: string;
  /** 시트 설명 (스크린리더용) */
  sheetDescription: string;
  /** 시트 본문 */
  content: ReactNode;
}

/**
 * Vaul Drawer 기반 바텀시트.
 */
export function BottomSheet({
  open,
  onClose,
  dismissible = true,
  preventReposition = false,
  sheetTitle,
  sheetDescription,
  content,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      dismissible={dismissible}
      repositionInputs={!preventReposition}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-100 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-1/2 z-100 flex w-full max-w-(--common-max-width) -translate-x-1/2 flex-col overflow-hidden rounded-t-[10px] bg-white max-h-[85vh]">
          <Drawer.Title className="sr-only">{sheetTitle}</Drawer.Title>
          <Drawer.Description className="sr-only">{sheetDescription}</Drawer.Description>
          <div className="mx-auto mt-1 h-1.5 w-3 shrink-0 rounded-full bg-neutral-20" />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{content}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
