import {
  createFileRoute,
  //Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { isAxiosError } from "axios";
import { login } from "@/api";
import type { LoginRequest } from "@/api";
import { clearGuestMode } from "@/api/axios";
import { bridge } from "@/bridge";
import CloseIcon from "@/assets/x.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import EyeOpenIcon from "@/assets/icons/Onboarding/eye-open.svg?react";
import EyeCloseIcon from "@/assets/icons/Onboarding/eye-close.svg?react";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/login/")({
  validateSearch: (search: Record<string, unknown>) => ({
    fromGuestBrowse: search.fromGuestBrowse === true || search.fromGuestBrowse === "true",
  }),
  component: LoginPage,
});

const TOKEN_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    if (search.fromGuestBrowse) {
      navigate({ to: "/", replace: true, state: { transitionDirection: "back" } });
      return;
    }
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/" });
    }
  };

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      clearGuestMode();
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
      navigate({ to: "/space", replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return;
    }
    mutation.mutate({ email: email.trim(), password });
  };

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (isAxiosError(mutation.error)) {
      const msg =
        (mutation.error.response?.data as { message?: string })?.message ?? mutation.error.message;
      return msg || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.";
    }
    return mutation.error instanceof Error ? mutation.error.message : "로그인에 실패했습니다.";
  })();

  return (
    <div className="relative flex min-h-screen w-full flex-col px-1.5 py-3">
      <button
        type="button"
        onClick={handleBack}
        className="absolute left-1.5 top-3 flex items-center justify-center p-3 text-dice-black transition-opacity hover:opacity-80 active:opacity-70"
        aria-label="닫기"
      >
        <CloseIcon className="h-6 w-6" />
      </button>
      <div className="flex flex-1 flex-col justify-center bg-white p-2">
        <h1 className="typo-h1 mb-8 text-dice-black">로그인</h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-8 flex flex-col gap-3">
            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 아이디를 입력해주세요"
                className={`typo-body2 w-full appearance-none rounded-lg border bg-white px-4 py-3 pr-8 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:outline-none focus:ring-1 ${
                  email.trim()
                    ? "border-dice-black focus:border-dice-black focus:ring-dice-black"
                    : "border-gray-light focus:border-dice-black focus:ring-dice-black"
                }`}
                required
                disabled={mutation.isPending}
              />
              {email.trim() && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="이메일 지우기"
                >
                  <XIcon className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className={`typo-body2 w-full appearance-none rounded-lg border bg-white px-4 py-3 pr-9 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:outline-none focus:ring-1 ${
                  password
                    ? "border-dice-black focus:border-dice-black focus:ring-dice-black"
                    : "border-gray-light focus:border-dice-black focus:ring-dice-black"
                }`}
                required
                disabled={mutation.isPending}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword("")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-medium"
                    aria-label="비밀번호 지우기"
                  >
                    <XIcon className="h-[18px] w-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-medium"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    <EyeCloseIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeOpenIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {errorMessage && <p className="mb-1 text-system-red">{errorMessage}</p>}

          <button
            type="submit"
            disabled={mutation.isPending || !email.trim() || !password}
            className="w-full mb-3 rounded-lg bg-dice-black px-4 py-[15.5px] typo-button1 text-dice-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "로그인 중..." : "로그인"}
          </button>

          {/* <Link
            to="/login"
            search={{ fromGuestBrowse: search.fromGuestBrowse }}
            className="self-center typo-button1 text-gray-medium px-4 py-[13.5px]"
          >
            비밀번호 찾기
          </Link> */}
        </form>
      </div>
    </div>
  );
}
