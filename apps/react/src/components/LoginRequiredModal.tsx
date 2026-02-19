import { createPortal } from "react-dom";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginRequiredModal({ open, onClose, onLogin }: LoginRequiredModalProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-(--dim-basic) px-20"
      style={{ zIndex: 1000 }}
    >
      <div className="w-full max-w-[360px] rounded-xl bg-white p-20 shadow-lg">
        <h2 className="typo-subtitle2 text-dice-black">로그인이 필요해요</h2>
        <p className="mt-8 typo-body2 text-gray-deep">
          해당 목록은 회원 전용 기능입니다.
          <br />
          로그인 후 이용해 주세요.
        </p>
        <div className="mt-20 flex gap-8">
          <button
            type="button"
            onClick={onClose}
            className="typo-button1 flex-1 rounded-lg border border-stroke-eee py-[13px] text-gray-deep"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="typo-button1 flex-1 rounded-lg bg-dice-black py-[13px] text-white"
          >
            로그인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
