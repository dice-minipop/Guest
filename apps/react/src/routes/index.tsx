import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import Lottie from "lottie-react";
import { Carousel } from "../components/Carousel";
import { LottieItems } from "../data/lottieItems";
import { login } from "@/api";
import { clearTokens, setGuestMode } from "@/api/axios";
import { bridge } from "@/bridge";
import DiceIcon from "@/assets/icons/dice.svg?react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const TOKEN_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

const GUEST_CREDENTIALS = {
  email: "guest",
  password: "guest123",
} as const;

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
  const navigate = useNavigate();
  const screenWidth = useScreenWidth();
  const lottieWidth = Math.min(screenWidth, 500);
  const calculatedHeight = (screenWidth * 378) / 375;
  const lottieHeight = Math.min(calculatedHeight, 500);
  const [guestLoginError, setGuestLoginError] = useState<string | null>(null);

  const guestLoginMutation = useMutation({
    mutationFn: () => login(GUEST_CREDENTIALS),
    onSuccess: (res) => {
      clearTokens();
      if (res.token?.accessToken) {
        localStorage.setItem(TOKEN_KEYS.access, res.token.accessToken);
        if (
          typeof bridge?.isNativeMethodAvailable === "function" &&
          bridge.isNativeMethodAvailable("setAccessToken")
        ) {
          bridge.setAccessToken(res.token.accessToken).catch(() => {});
        }
      }
      if (res.token?.refreshToken) {
        localStorage.setItem(TOKEN_KEYS.refresh, res.token.refreshToken);
      }
      setGuestMode();
      setGuestLoginError(null);
      navigate({ to: "/space", replace: true });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string })?.message ?? error.message;
        setGuestLoginError(msg || "게스트 로그인에 실패했습니다.");
        return;
      }
      setGuestLoginError(error instanceof Error ? error.message : "게스트 로그인에 실패했습니다.");
    },
  });

  const handleGuestBrowseClick = () => {
    setGuestLoginError(null);
    guestLoginMutation.mutate();
  };

  const slides = LottieItems.map(({ path, title, subtitle }) => (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center"
        style={{ width: lottieWidth, height: lottieHeight }}
      >
        <Lottie animationData={path} loop className="h-full w-full" />
      </div>
      <h2 className="mt-8 typo-subtitle1 text-dice-black">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-center typo-subtitle3 text-gray-medium">
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
          pagination={{
            clickable: true,
            bulletClass: "home-carousel-bullet",
            bulletActiveClass: "home-carousel-bullet-active",
          }}
          loop
          className="home-carousel"
          slideClassName="!h-auto"
        />
      </div>
      <div className="shrink-0 px-5 pb-4 pt-1 space-y-3">
        <Link
          to="/login"
          search={{ fromGuestBrowse: false }}
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-stroke-eee py-3.5 text-center typo-button1 text-dice-black transition-opacity hover:opacity-90 active:opacity-80"
        >
          <DiceIcon className="w-6 h-6" />
          <span>다이스 아이디로 로그인</span>
        </Link>

        <div className="flex items-center justify-center">
          <Link
            to="/signup"
            search={{ fromGuestBrowse: false }}
            state={{ transitionDirection: "forward" }}
            className="typo-button1 text-gray-medium underline px-4 py-[13.5px]"
          >
            회원으로 가입하기
          </Link>

          <div className="text-gray-medium">|</div>

          <button
            type="button"
            onClick={handleGuestBrowseClick}
            disabled={guestLoginMutation.isPending}
            className="typo-button1 text-gray-medium underline px-4 py-[13.5px]"
          >
            {guestLoginMutation.isPending ? "게스트 로그인 중..." : "게스트로 둘러보기"}
          </button>
        </div>
        {guestLoginError && <p className="text-center text-sm text-red-600">{guestLoginError}</p>}
      </div>
    </div>
  );
}
