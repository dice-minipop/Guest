import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Carousel } from "../components/Carousel";
import { LottieItems } from "../data/lottieItems";
import DiceIcon from "@/assets/icons/dice.svg?react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function useScreenWidth() {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 375
  );
  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return screenWidth;
}

function HomePage() {
  const screenWidth = useScreenWidth();
  const lottieWidth = Math.min(screenWidth, 500);
  const calculatedHeight = (screenWidth * 378) / 375;
  const lottieHeight = Math.min(calculatedHeight, 500);

  const slides = LottieItems.map(({ path, title, subtitle }) => (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center"
        style={{ width: lottieWidth, height: lottieHeight }}
      >
        <Lottie animationData={path} loop className="h-full w-full" />
      </div>
      <h2 className="mt-32 typo-subtitle1 text-dice-black">{title}</h2>
      <p className="mt-8 whitespace-pre-line text-center typo-subtitle3 text-gray-medium">
        {subtitle}
      </p>
    </div>
  ));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="min-h-0 flex-1">
        <Carousel
          slides={slides}
          slidesPerView={1}
          spaceBetween={0}
          pagination
          loop
          slideClassName="!h-auto"
        />
      </div>
      <div className="shrink-0 px-5 pb-16 pt-4 space-y-12">
        <Link
          to="/login"
          className="flex items-center justify-center gap-8 w-full rounded-xl border border-stroke-eee py-3.5 text-center typo-button1 text-dice-black transition-opacity hover:opacity-90 active:opacity-80"
        >
          <DiceIcon className="w-24 h-24" />
          <span>다이스 아이디로 로그인</span>
        </Link>

        <div className="flex items-center justify-center">
          <Link to="/signup" className="typo-button1 text-gray-medium underline px-16 py-[13.5px]">
            회원으로 가입하기
          </Link>

          <div className="text-gray-medium">|</div>

          <Link
            to="/space"
            replace
            className="typo-button1 text-gray-medium underline px-16 py-[13.5px]"
          >
            게스트로 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}
