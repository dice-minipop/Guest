import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/reservation")({
  component: ReservationPage,
});

function ReservationPage() {
  return (
    <div className="min-h-screen">
      <PageHeader variant="reservation" title="예약관리" />
      <div className="px-4 py-4">
        <p className="text-neutral-600 dark:text-neutral-400">예약 페이지입니다.</p>
      </div>
    </div>
  );
}
