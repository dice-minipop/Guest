import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";

export function useLoginRequiredModal() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const closeLoginRequiredModal = () => {
    setIsLoginModalOpen(false);
  };

  const openLoginRequiredModal = () => {
    setIsLoginModalOpen(true);
  };

  const loginRequiredModal = (
    <LoginRequiredModal
      open={isLoginModalOpen}
      onClose={closeLoginRequiredModal}
      onLogin={() => {
        closeLoginRequiredModal();
        navigate({ to: "/login", search: { fromGuestBrowse: true } });
      }}
      onSignup={() => {
        closeLoginRequiredModal();
        navigate({ to: "/signup", search: { fromGuestBrowse: true } });
      }}
    />
  );

  return {
    openLoginRequiredModal,
    closeLoginRequiredModal,
    loginRequiredModal,
  };
}
