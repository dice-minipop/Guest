import * as Slider from "@radix-ui/react-slider";
import { useMemo } from "react";
import { sizeItems } from "../../data/filterItems";

const SIZE_MIN = 0;
const SIZE_MAX = 150;
const SIZE_STEP = 5;
const PYEONG_TO_M2 = 3.3058;

/** 평 → m² (× 3.3058), 소수점 셋째자리에서 반올림(소수 둘째자리까지) */
function pyeongToM2(pyeong: number): number {
  return Math.round(pyeong * PYEONG_TO_M2 * 100) / 100;
}

export interface SizeFilterSectionProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function SizeFilterSection({ value, onChange }: SizeFilterSectionProps) {
  const selectedChipIndex = useMemo(() => {
    const idx = sizeItems.findIndex((item) => item.min === value[0] && item.max === value[1]);
    return idx >= 0 ? idx : null;
  }, [value]);

  const handleChipClick = (index: number) => {
    const item = sizeItems[index];
    if (selectedChipIndex === index) {
      onChange([SIZE_MIN, SIZE_MAX]);
    } else {
      onChange([item.min, item.max]);
    }
  };

  const handleSliderChange = (v: [number, number]) => {
    onChange(v);
  };

  const minPyeong = value[0];
  const maxPyeong = value[1];
  const minM2 = pyeongToM2(minPyeong);
  const maxM2 = pyeongToM2(maxPyeong);

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-32">
        <div className="typo-subtitle1 text-(--gray-deep)">
          <span className="text-(--system-purple)">{minPyeong}</span>
          <span className="text-(--dice-black)">평</span>
          <span className="text-(--gray-deep)"> ~ </span>
          <span className="text-(--system-purple)">{maxPyeong}</span>
          <span className="text-(--dice-black)">평</span>
          <span className="text-(--gray-deep)"> ≒ </span>
          <span className="text-(--system-purple)">{minM2}</span>
          <span className="text-(--dice-black)">m²</span>
          <span className="text-(--gray-deep)"> ~ </span>
          <span className="text-(--system-purple)">{maxM2}</span>
          <span className="text-(--dice-black)">m²</span>
        </div>
        <div className="w-full">
          <Slider.Root
            className="relative flex w-full touch-none select-none items-center"
            value={value}
            onValueChange={(v) => handleSliderChange(v as [number, number])}
            min={SIZE_MIN}
            max={SIZE_MAX}
            step={SIZE_STEP}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="relative h-2 w-full grow rounded-full bg-(--gray-light) dark:bg-neutral-600">
              <Slider.Range className="absolute h-full rounded-full bg-(--dice-black)" />
            </Slider.Track>
            <Slider.Thumb className="block size-5 rounded-full border-2 border-(--dice-black) bg-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--system-purple) focus-visible:ring-offset-2 disabled:pointer-events-none dark:bg-neutral-100" />
            <Slider.Thumb className="block size-5 rounded-full border-2 border-(--dice-black) bg-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--system-purple) focus-visible:ring-offset-2 disabled:pointer-events-none dark:bg-neutral-100" />
          </Slider.Root>
          {/* 트랙 0% / 50% / 100%에 맞춰 라벨 배치 */}
          <div className="relative mt-12 h-5 w-full typo-caption1 text-(--gray-light)">
            <span className="absolute left-0 top-0">0평</span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2">75평</span>
            <span className="absolute right-0 top-0">150평 이상</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-8">
        {sizeItems.map((item, index) => (
          <button
            key={`${item.min}-${item.max}`}
            type="button"
            onClick={() => handleChipClick(index)}
            className={`rounded border px-2.5 py-[9px] typo-button2 transition-colors ${
              selectedChipIndex === index
                ? "border-(--system-purple) bg-white text-(--system-purple)"
                : "border-(--gray-light) bg-white text-(--gray-deep) hover:border-(--gray-deep)"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
