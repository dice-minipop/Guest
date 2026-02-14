import { useMemo, type ReactNode } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export interface CarouselProps {
  /** 슬라이드 요소 배열 (각 요소가 한 슬라이드) */
  slides: ReactNode[];
  /** 한 번에 보일 슬라이드 수 */
  slidesPerView?: number | "auto";
  /** 슬라이드 간 간격 (px) */
  spaceBetween?: number;
  /** 페이지네이션 표시 */
  pagination?: boolean;
  /** 좌우 네비게이션 버튼 표시 */
  navigation?: boolean;
  /** 루프 여부 */
  loop?: boolean;
  /** Swiper 옵션 그대로 전달 */
  swiperOptions?: Omit<
    SwiperOptions,
    "slidesPerView" | "spaceBetween" | "pagination" | "navigation" | "loop" | "modules"
  >;
  /** 슬라이드 변경 시 콜백 */
  onSlideChange?: (index: number) => void;
  /** 슬라이드용 추가 className */
  slideClassName?: string;
}

export function Carousel({
  slides,
  slidesPerView = 1,
  spaceBetween = 8,
  pagination = false,
  navigation = false,
  loop = false,
  swiperOptions,
  onSlideChange,
  slideClassName,
}: CarouselProps) {
  const modules = useMemo(() => {
    const m = [];
    if (navigation) m.push(Navigation);
    if (pagination) m.push(Pagination);
    return m;
  }, [navigation, pagination]);

  return (
    <Swiper
      className={pagination ? "pb-10!" : undefined}
      modules={modules}
      slidesPerView={slidesPerView}
      spaceBetween={spaceBetween}
      loop={loop}
      pagination={pagination ? { clickable: true } : false}
      navigation={navigation}
      onSlideChange={(swiper: { realIndex: number }) => onSlideChange?.(swiper.realIndex)}
      {...swiperOptions}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index} className={slideClassName}>
          {slide}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
