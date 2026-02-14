import type React from "react";
import { checkEmail, checkPhoneNumber } from "@/api";

export type MessageColor = "text-gray-deep" | "text-system-green" | "text-system-red";

export const validateEmail = async (
  value: string,
  domain: string,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setMessageColor: React.Dispatch<React.SetStateAction<MessageColor>>
) => {
  if (domain === undefined || domain === "") {
    setMessage("");
    setMessageColor("text-gray-deep");
    return;
  }

  try {
    await checkEmail({ email: value });
    setMessage("사용 가능한 이메일입니다.");
    setMessageColor("text-system-green");
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 409) {
      setMessage("이미 가입된 이메일입니다.");
      setMessageColor("text-system-red");
    } else {
      setMessage("");
      setMessageColor("text-gray-deep");
    }
  }
};

export const validatePassword = (
  value: string,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setMessageColor: React.Dispatch<React.SetStateAction<MessageColor>>
) => {
  if (value.length === 0) {
    setMessage("비밀번호는 8자 이상 / 영문, 숫자, 특수문자를 포함해야 합니다.");
    setMessageColor("text-gray-deep");
  } else if (value.length < 8) {
    setMessage("최소 8자 이상 입력해야 합니다.");
    setMessageColor("text-system-red");
  } else {
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+=-]/.test(value);
    if (hasLetter && hasNumber && hasSpecial) {
      setMessage("사용 가능한 비밀번호입니다.");
      setMessageColor("text-system-green");
    } else {
      setMessage("영문, 숫자, 특수문자만 허용되며, 3개 모두 사용해야 합니다.");
      setMessageColor("text-system-red");
    }
  }
};

export const validatePasswordCheck = (
  password: string,
  value: string,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setMessageColor: React.Dispatch<React.SetStateAction<MessageColor>>
) => {
  if (value.length === 0) {
    setMessage("");
    setMessageColor("text-gray-deep");
    return;
  }

  if (value === password) {
    setMessage("동일한 비밀번호입니다.");
    setMessageColor("text-system-green");
  } else {
    setMessage("동일한 비밀번호를 입력해야 합니다.");
    setMessageColor("text-system-red");
  }
};

export const validatePhone = async (
  value: string,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setMessageColor: React.Dispatch<React.SetStateAction<MessageColor>>
) => {
  if (value.length !== 11) {
    setMessage("");
    setMessageColor("text-gray-deep");
    return;
  }

  try {
    await checkPhoneNumber({ phone: value });
    setMessage("사용 가능한 휴대폰 번호입니다.");
    setMessageColor("text-system-green");
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 409) {
      setMessage("중복된 휴대폰 번호입니다.");
      setMessageColor("text-system-red");
    } else {
      setMessage("");
      setMessageColor("text-gray-deep");
    }
  }
};
