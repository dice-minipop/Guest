import { useState } from "react";
import DiceIcon from "@/assets/icons/dice.svg?react";

export interface SpaceImageFallbackProps {
  /** 컨테이너에 적용할 추가 className (예: aspect-square, w-full) */
  className?: string;
}

/** 공간 이미지가 없거나 로드 실패 시 표시할 fallback (dice 아이콘 + 흰색 배경) */
export function SpaceImageFallback({ className = "" }: SpaceImageFallbackProps) {
  return (
    <div className={`flex items-center justify-center bg-white ${className}`} aria-hidden>
      <DiceIcon className="size-11 shrink-0 text-dice-black" />
    </div>
  );
}

export interface SpaceImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

/** 공간 이미지: src가 없거나 로드 실패 시 dice fallback 표시 */
export function SpaceImage({ src, alt = "", className = "" }: SpaceImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <SpaceImageFallback className={className} />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
}
