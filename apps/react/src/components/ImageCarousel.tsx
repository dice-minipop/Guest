import { useState } from "react";
import { SpaceImage } from "@/shared/ui/space-image-fallback";
import { Carousel } from "./Carousel";

export interface ImageCarouselProps {
  /** 이미지 URL 목록 */
  imageUrls: string[];
  /** 이미지 비율 (기본 1:1) */
  aspectRatio?: "4/3" | "3/2" | "16/9" | "1/1" | "375/210";
  /** alt 텍스트 접두사 (예: "공간 이미지" → "공간 이미지 1", "공간 이미지 2") */
  altPrefix?: string;
  /** 이미지 로드 실패 시 dice fallback 표시 (공간 이미지용) */
  fallbackOnError?: boolean;
}

const aspectClass = {
  "4/3": "aspect-4/3",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "375/210": "aspect-[375/210]",
} as const;

export function ImageCarousel({
  imageUrls,
  aspectRatio = "1/1",
  altPrefix = "이미지",
  fallbackOnError = false,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (imageUrls.length === 0) return null;

  const slideClassName = `w-full ${aspectClass[aspectRatio]} object-cover`;

  const slides = imageUrls.map((url, i) =>
    fallbackOnError ? (
      <SpaceImage key={i} src={url} alt={`${altPrefix} ${i + 1}`} className={slideClassName} />
    ) : (
      <img
        key={i}
        src={url}
        alt={`${altPrefix} ${i + 1}`}
        className={slideClassName}
        loading={i === 0 ? "eager" : "lazy"}
      />
    )
  );

  return (
    <div className="relative w-full">
      <Carousel
        slides={slides}
        slidesPerView={1}
        spaceBetween={0}
        pagination={false}
        loop={imageUrls.length > 1}
        slideClassName="!h-auto"
        onSlideChange={setCurrentIndex}
      />
      <div
        className="absolute right-3 bottom-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white"
        aria-live="polite"
      >
        {currentIndex + 1}/{imageUrls.length}
      </div>
    </div>
  );
}
