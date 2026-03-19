import { createPortal } from "react-dom";
import { clearGuestMode } from "@/api/axios";
import DiceIcon from "@/assets/icons/dice.svg?react";
import XIcon from "@/assets/x.svg?react";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export function LoginRequiredModal({ open, onClose, onLogin, onSignup }: LoginRequiredModalProps) {
  if (!open || typeof document === "undefined") return null;

  const handleLogin = () => {
    clearGuestMode();
    onLogin();
  };

  const handleSignup = () => {
    clearGuestMode();
    onSignup();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-200 flex items-center justify-center bg-(--dim-basic) px-5"
      style={{ zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] rounded-xl bg-white flex flex-col"
      >
        <button type="button" onClick={onClose} className="p-3 self-end">
          <XIcon />
        </button>

        <div className="p-4 pt-0 space-y-5">
          <h2 className="typo-subtitle2 text-gray-dark text-center">
            다이스와 함께 하시려면 로그인해주세요.
          </h2>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-stroke-eee py-3.5 text-center typo-button1 text-dice-black transition-opacity hover:opacity-90 active:opacity-80"
            >
              <DiceIcon className="w-6 h-6" />
              <span>다이스 아이디로 로그인</span>
            </button>
            <button
              type="button"
              onClick={handleSignup}
              className="typo-button1 flex-1 rounded-lg bg-dice-black py-[15.5px] text-white"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
