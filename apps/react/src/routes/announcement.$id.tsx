import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnnouncementDetailData, queryKeys } from "../api";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const Route = createFileRoute("/announcement/$id")({
  component: AnnouncementDetailPage,
});

function AnnouncementDetailPage() {
  const { id } = Route.useParams();
  const announcementId = Number(id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.announcement.detail(announcementId),
    queryFn: () => getAnnouncementDetailData(announcementId),
    enabled: Number.isInteger(announcementId) && announcementId > 0,
  });

  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-neutral-500">잘못된 공고 ID입니다.</p>
        <Link to="/announcement" className="mt-4 inline-block text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="px-4 py-12 text-center text-sm text-neutral-500">불러오는 중...</div>;
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-8">
        <p className="text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "공고 정보를 불러오지 못했습니다."}
        </p>
        <Link to="/announcement" className="mt-4 inline-block text-indigo-600 hover:underline">
          목록으로
        </Link>
      </div>
    );
  }

  const imageUrls = data.imageUrls ?? [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/announcement"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            aria-label="목록으로"
          >
            ← 목록
          </Link>
        </div>
      </div>

      <div className="px-4 py-6">
        {imageUrls.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="h-48 w-72 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{data.title}</h1>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{data.hostName}</span>
          <span>
            {data.city}
            {data.district && ` ${data.district}`}
          </span>
          <span>{data.target}</span>
          <span>♥ {data.likeCount}</span>
          {data.status && <span>{data.status}</span>}
        </div>

        <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          모집 기간: {formatDate(data.recruitmentStartAt)} ~ {formatDate(data.recruitmentEndAt)}
        </div>

        {data.address && (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            주소: {data.address}
          </p>
        )}

        {data.details && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              상세 내용
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
              {data.details}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {data.contactNumber && (
            <a
              href={`tel:${data.contactNumber}`}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            >
              전화 문의
            </a>
          )}
          {data.websiteUrl && (
            <a
              href={data.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              웹사이트
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
