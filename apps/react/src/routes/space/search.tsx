import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { BackHeader } from "@/components/BackHeader";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/space/search")({
  component: SpaceSearchPage,
});

function SpaceSearchPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/space", state: { transitionDirection: "back" } });
    }
  };

  return (
    <div className="min-h-screen bg-dice-white">
      <BackHeader title="팝업공간 검색" onBack={handleBack} />
    </div>
  );
}
