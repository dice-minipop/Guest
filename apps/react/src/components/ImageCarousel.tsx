import { useState } from "react";
import { Carousel } from "./Carousel";

export interface ImageCarouselProps {
  /** 이미지 URL 목록 */
  imageUrls: string[];
  /** 이미지 비율 (기본 1:1) */
  aspectRatio?: "4/3" | "3/2" | "16/9" | "1/1" | "375/210";
  /** alt 텍스트 접두사 (예: "공간 이미지" → "공간 이미지 1", "공간 이미지 2") */
  altPrefix?: string;
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
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (imageUrls.length === 0) return null;

  const slides = imageUrls.map((url, i) => (
    <img
      key={i}
      src={url}
      alt={`${altPrefix} ${i + 1}`}
      className={`w-full ${aspectClass[aspectRatio]} object-cover`}
      loading={i === 0 ? "eager" : "lazy"}
    />
  ));

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
        className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white"
        aria-live="polite"
      >
        {currentIndex + 1}/{imageUrls.length}
      </div>
    </div>
  );
}
