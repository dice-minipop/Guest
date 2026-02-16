import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { isAxiosError } from "axios";
import { login } from "../api";
import type { LoginRequest } from "../api";
import { bridge } from "@/bridge";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import EyeOpenIcon from "@/assets/icons/Onboarding/eye-open.svg?react";
import EyeCloseIcon from "@/assets/icons/Onboarding/eye-close.svg?react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const TOKEN_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
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
    <div className="relative mx-auto flex min-h-screen max-w-sm flex-col px-6 py-12">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="absolute left-6 top-12 flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        aria-label="닫기"
      >
        <span className="text-2xl leading-none">×</span>
      </button>
      <div className="flex flex-1 flex-col justify-center bg-white p-8 dark:bg-neutral-800">
        <h1 className="typo-h1 mb-32 text-(--dice-black)">로그인</h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-32 flex flex-col gap-12">
            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 아이디를 입력해주세요"
                className={`typo-body2 w-full appearance-none rounded-lg border bg-white px-16 py-3 pr-32 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:outline-none focus:ring-1 ${
                  email.trim()
                    ? "border-(--dice-black) focus:border-(--dice-black) focus:ring-(--dice-black)"
                    : "border-(--gray-light) focus:border-(--dice-black) focus:ring-(--dice-black)"
                }`}
                required
                disabled={mutation.isPending}
              />
              {email.trim() && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="absolute right-12 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
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
                className={`typo-body2 w-full appearance-none rounded-lg border bg-white px-16 py-3 pr-36 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:outline-none focus:ring-1 ${
                  password
                    ? "border-(--dice-black) focus:border-(--dice-black) focus:ring-(--dice-black)"
                    : "border-(--gray-light) focus:border-(--dice-black) focus:ring-(--dice-black)"
                }`}
                required
                disabled={mutation.isPending}
              />
              <div className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-4">
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword("")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    aria-label="비밀번호 지우기"
                  >
                    <XIcon className="h-[18px] w-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
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

          {errorMessage && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !email.trim() || !password}
            className="w-full mb-12 rounded-lg bg-dice-black px-16 py-[15.5px] typo-button1 text-dice-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "로그인 중..." : "로그인"}
          </button>

          <Link to="/login" className="self-center typo-button1 text-gray-medium px-16 py-[13.5px]">
            비밀번호 찾기
          </Link>
        </form>
      </div>
    </div>
  );
}
