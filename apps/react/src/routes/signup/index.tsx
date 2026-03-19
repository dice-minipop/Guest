import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { signUp } from "@/api";
import type { SignUpRequest } from "@/api";
import RightArrowIcon from "@/assets/icons/Arrow/right.svg?react";
import XIcon from "@/assets/icons/Onboarding/round-x.svg?react";
import EyeOpenIcon from "@/assets/icons/Onboarding/eye-open.svg?react";
import EyeCloseIcon from "@/assets/icons/Onboarding/eye-close.svg?react";
import {
  validateEmail,
  validatePassword,
  validatePasswordCheck,
  validatePhone,
} from "@/lib/signupValidation";
import { backWithHistory } from "@/shared/navigation/back";

export const Route = createFileRoute("/signup/")({
  validateSearch: (search: Record<string, unknown>) => ({
    fromGuestBrowse: search.fromGuestBrowse === true || search.fromGuestBrowse === "true",
  }),
  component: SignupLayout,
});

function SignupLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/signup/brand-profile") {
    return <Outlet />;
  }
  return <SignupPage />;
}

const PASSWORD_MIN_LENGTH = 8;

type MessageColor = "text-gray-deep" | "text-system-green" | "text-system-red";

function SignupPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [emailMessage, setEmailMessage] = useState("");
  const [emailMessageColor, setEmailMessageColor] = useState<MessageColor>("text-gray-deep");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageColor, setPasswordMessageColor] = useState<MessageColor>("text-gray-deep");
  const [passwordCheckMessage, setPasswordCheckMessage] = useState("");
  const [passwordCheckMessageColor, setPasswordCheckMessageColor] =
    useState<MessageColor>("text-gray-deep");
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneMessageColor, setPhoneMessageColor] = useState<MessageColor>("text-gray-deep");

  const mutation = useMutation({
    mutationFn: (data: SignUpRequest) => signUp(data),
    onSuccess: () => {
      navigate({ to: "/signup/brand-profile", state: { transitionDirection: "forward" } });
    },
  });

  const emailDomain = email.includes("@") ? (email.split("@")[1] ?? "") : "";

  useEffect(() => {
    validateEmail(email, emailDomain, setEmailMessage, setEmailMessageColor);
  }, [email, emailDomain]);

  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      validatePhone(digits, setPhoneMessage, setPhoneMessageColor);
    }
  }, [phone]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value.replace(/\D/g, "").length !== 11) {
      setPhoneMessage("");
      setPhoneMessageColor("text-gray-deep");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value, setPasswordMessage, setPasswordMessageColor);
    if (passwordConfirm) {
      validatePasswordCheck(
        value,
        passwordConfirm,
        setPasswordCheckMessage,
        setPasswordCheckMessageColor
      );
    }
  };

  const handlePasswordCheckChange = (value: string) => {
    setPasswordConfirm(value);
    validatePasswordCheck(password, value, setPasswordCheckMessage, setPasswordCheckMessageColor);
  };

  const isEmailValid = emailMessageColor === "text-system-green";
  const isPasswordValid = passwordMessageColor === "text-system-green";
  const isPasswordCheckValid = passwordCheckMessageColor === "text-system-green";
  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 11 && phoneMessageColor === "text-system-green";

  const isFormValid =
    name.trim() && isEmailValid && isPasswordValid && isPasswordCheckValid && isPhoneValid;

  const handleBack = () => {
    if (window.history.length > 1) {
      backWithHistory(router);
    } else {
      navigate({ to: "/", state: { transitionDirection: "back" } });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || mutation.isPending) return;
    mutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phoneDigits.length === 11 ? phoneDigits : phone.trim() || undefined,
      userRole: 0,
    });
  };

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (isAxiosError(mutation.error)) {
      const msg =
        (mutation.error.response?.data as { message?: string })?.message ?? mutation.error.message;
      return msg || "회원가입에 실패했습니다. 입력 내용을 확인해 주세요.";
    }
    return mutation.error instanceof Error ? mutation.error.message : "회원가입에 실패했습니다.";
  })();

  const inputBase =
    "typo-body2 w-full appearance-none rounded-lg border bg-white px-4 py-3 text-[16px] text-(--gray-dark) placeholder:text-(--gray-light) focus:outline-none focus:ring-1";

  const getBorderByMessageColor = (messageColor: MessageColor) => {
    switch (messageColor) {
      case "text-gray-deep":
        return "border-(--gray-light) focus:border-(--dice-black) focus:ring-(--dice-black)";
      case "text-system-green":
        return "border-system-green focus:border-system-green focus:ring-system-green";
      case "text-system-red":
        return "border-system-red focus:border-system-red focus:ring-system-red";
    }
  };

  const inputClass = (hasValue: boolean) =>
    `${inputBase} pr-8 ${
      hasValue
        ? "border-(--dice-black) focus:border-(--dice-black) focus:ring-(--dice-black)"
        : "border-(--gray-light) focus:border-(--dice-black) focus:ring-(--dice-black)"
    }`;

  const inputClassByMessageColor = (messageColor: MessageColor) =>
    `${inputBase} pr-8 ${getBorderByMessageColor(messageColor)}`;

  const inputWithIconClassByMessageColor = (messageColor: MessageColor) =>
    `${inputBase} pr-9 ${getBorderByMessageColor(messageColor)}`;

  return (
    <div className="relative w-full">
      <div className="h-screen overflow-y-auto">
        <div className="flex min-h-screen flex-col pb-[72px] pt-[48px]">
          <header className="fixed left-0 right-0 top-0 z-20 mx-auto flex w-full max-w-(--common-max-width) shrink-0 items-center justify-between bg-white">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-dice-black transition-colors hover:bg-neutral-100"
              aria-label="뒤로가기"
            >
              <RightArrowIcon className="h-6 w-6" aria-hidden />
            </button>

            <h1 className="typo-subtitle3 absolute left-0 right-0 text-center text-dice-black pointer-events-none">
              회원가입
            </h1>
            <div className="h-[48px] w-[48px] shrink-0" aria-hidden />
          </header>

          <div className="flex flex-1 flex-col bg-white px-5 pt-8">
            <h2 className="typo-h2 mb-6 text-dice-black">회원 정보를 입력해주세요</h2>

            <form id="signup-form" onSubmit={handleSubmit} className="flex flex-col">
              <div className="mb-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-name" className="typo-caption1 text-gray-dark">
                    이름<span className="text-system-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력해주세요"
                      className={inputClass(!!name.trim())}
                      required
                      disabled={mutation.isPending}
                    />
                    {name.trim() && (
                      <button
                        type="button"
                        onClick={() => setName("")}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label="이름 지우기"
                      >
                        <XIcon className="h-[18px] w-[18px]" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-email" className="typo-caption1 text-gray-dark">
                    이메일<span className="text-system-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력해주세요"
                      className={inputClassByMessageColor(emailMessageColor)}
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
                  {emailMessage && (
                    <p className={`typo-caption2 ${emailMessageColor}`}>{emailMessage}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-password" className="typo-caption1 text-gray-dark">
                    비밀번호<span className="text-system-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="비밀번호 (8자 이상)"
                      className={inputWithIconClassByMessageColor(passwordMessageColor)}
                      required
                      minLength={PASSWORD_MIN_LENGTH}
                      disabled={mutation.isPending}
                    />
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      {password && (
                        <button
                          type="button"
                          onClick={() => setPassword("")}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                          aria-label="비밀번호 지우기"
                        >
                          <XIcon className="h-[18px] w-[18px]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
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
                  {passwordMessage && (
                    <p className={`typo-caption2 ${passwordMessageColor}`}>{passwordMessage}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-password-confirm" className="typo-caption1 text-gray-dark">
                    비밀번호 확인<span className="text-system-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password-confirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordConfirm}
                      onChange={(e) => handlePasswordCheckChange(e.target.value)}
                      placeholder="비밀번호 확인"
                      className={inputWithIconClassByMessageColor(passwordCheckMessageColor)}
                      required
                      disabled={mutation.isPending}
                    />
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      {passwordConfirm && (
                        <button
                          type="button"
                          onClick={() => setPasswordConfirm("")}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                          aria-label="비밀번호 확인 지우기"
                        >
                          <XIcon className="h-[18px] w-[18px]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label={showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {showPasswordConfirm ? (
                          <EyeCloseIcon className="h-[18px] w-[18px]" />
                        ) : (
                          <EyeOpenIcon className="h-[18px] w-[18px]" />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordCheckMessage && (
                    <p className={`typo-caption2 ${passwordCheckMessageColor}`}>
                      {passwordCheckMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-phone" className="typo-caption1 text-gray-dark">
                    휴대폰<span className="text-system-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="휴대폰 번호를 입력해주세요 (숫자 11자리)"
                      className={inputClassByMessageColor(phoneMessageColor)}
                      required
                      disabled={mutation.isPending}
                    />
                    {phone.trim() && (
                      <button
                        type="button"
                        onClick={() => setPhone("")}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label="휴대폰 번호 지우기"
                      >
                        <XIcon className="h-[18px] w-[18px]" />
                      </button>
                    )}
                  </div>
                  {phoneMessage && (
                    <p className={`typo-caption2 ${phoneMessageColor}`}>{phoneMessage}</p>
                  )}
                </div>
              </div>

              {errorMessage && <p className="mb-1 text-sm text-red-600">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto w-full max-w-(--common-max-width) bg-white px-5 pt-1"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="submit"
          form="signup-form"
          disabled={mutation.isPending || !isFormValid}
          className="w-full rounded-lg bg-dice-black px-4 py-[15.5px] typo-button1 text-dice-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? "가입 중..." : "다음"}
        </button>
      </div>
    </div>
  );
}
