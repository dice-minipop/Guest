import * as Slider from "@radix-ui/react-slider";
import { useMemo } from "react";
import { priceItems } from "../../data/filterItems";

const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;
const PRICE_STEP = 10_000;

function formatPriceParts(value: number): { number: string; unit: string } {
  if (value >= 1_000_000) return { number: "100", unit: "만원" };
  if (value === 0) return { number: "0", unit: "원" };
  const man = Math.round(value / 10_000);
  return { number: String(man), unit: "만원" };
}

export interface PriceFilterSectionProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceFilterSection({ value, onChange }: PriceFilterSectionProps) {
  const selectedChipIndex = useMemo(() => {
    const idx = priceItems.findIndex((item) => item.min === value[0] && item.max === value[1]);
    return idx >= 0 ? idx : null;
  }, [value]);

  const handleChipClick = (index: number) => {
    const item = priceItems[index];
    if (selectedChipIndex === index) {
      onChange([PRICE_MIN, PRICE_MAX]);
    } else {
      onChange([item.min, item.max]);
    }
  };

  const handleSliderChange = (v: [number, number]) => {
    onChange(v);
  };

  const minParts = formatPriceParts(value[0]);
  const maxParts = formatPriceParts(value[1]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-8">
        <div className="flex w-fit items-center gap-2">
          <span className="rounded-full border border-stroke-eee bg-bg-light-gray px-3 py-[5.5px] typo-button1 text-(--gray-deep)">
            1일 대여
          </span>
          <div className="typo-subtitle1 text-(--gray-deep)">
            <span className="text-(--system-purple)">{minParts.number}</span>
            <span className="text-(--dice-black)">{minParts.unit}</span>
            <span className="text-(--gray-deep)"> ~ </span>
            <span className="text-(--system-purple)">{maxParts.number}</span>
            <span className="text-(--dice-black)">{maxParts.unit}</span>
          </div>
        </div>
        <div className="w-full">
          <Slider.Root
            className="relative flex w-full touch-none select-none items-center"
            value={value}
            onValueChange={(v) => handleSliderChange(v as [number, number])}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="relative h-0.5 w-full grow rounded-full bg-(--gray-light)">
              <Slider.Range className="absolute h-full rounded-full bg-(--dice-black)" />
            </Slider.Track>
            <Slider.Thumb className="block size-5 rounded-full border-2 border-(--dice-black) bg-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--system-purple) focus-visible:ring-offset-2 disabled:pointer-events-none" />
            <Slider.Thumb className="block size-5 rounded-full border-2 border-(--dice-black) bg-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--system-purple) focus-visible:ring-offset-2 disabled:pointer-events-none" />
          </Slider.Root>
          {/* 트랙 0% / 50% / 100%에 맞춰 라벨 배치 */}
          <div className="relative mt-3 h-5 w-full typo-caption1 text-(--gray-light)">
            <span className="absolute left-0 top-0">0원</span>
            <span className="absolute left-1/2 top-0 -translate-x-1/2">50만원</span>
            <span className="absolute right-0 top-0">100만원 이상</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-1 gap-y-2">
        {priceItems.map((item, index) => (
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
