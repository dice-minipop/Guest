import { apiClient, guestApiClient } from "../axios";
import type {
  CheckEmailRequest,
  CheckPhoneNumberRequest,
  LoginRequest,
  ReissueTokenRequest,
  ResetPasswordRequest,
  SendEmailVerifyRequest,
  SignUpRequest,
  UpdatePasswordRequest,
  VerifyEmailRequest,
} from "./request";
import type {
  LoginResponse,
  ReissueTokenResponse,
  ResetPasswordResponse,
  SignUpResponse,
  VerifyEmailResponse,
} from "./response";

// 회원 탈퇴 (인증 필요)
export async function withdraw(): Promise<void> {
  await apiClient.post("/v1/auth/withdraw");
}

// 이메일 인증 전송 (비인증)
export async function sendEmailVerify(data: SendEmailVerifyRequest): Promise<void> {
  await guestApiClient.post("/v1/auth/verify", data);
}

// 이메일 인증 확인 (비인증)
export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const response = await guestApiClient.post<VerifyEmailResponse>("/v1/auth/verify/code", data);
  return response.data;
}

// 휴대폰 번호 중복 확인 (비인증)
export async function checkPhoneNumber(data: CheckPhoneNumberRequest): Promise<void> {
  await guestApiClient.post("/v1/auth/validate/phone", data);
}

// 이메일 중복 확인 (비인증)
export async function checkEmail(data: CheckEmailRequest): Promise<void> {
  await guestApiClient.post("/v1/auth/validate/email", data);
}

// 회원가입 (비인증)
export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await guestApiClient.post<SignUpResponse>("/v2/auth/signup", data);
  return response.data;
}

// 토큰 재발급 (인증 필요 — refreshToken을 body로 전달)
export async function reissueToken(data: ReissueTokenRequest): Promise<ReissueTokenResponse> {
  const response = await apiClient.post<ReissueTokenResponse>("/v1/auth/reissue", data);
  return response.data;
}

// 비밀번호 변경 (인증 필요)
export async function updatePassword(data: UpdatePasswordRequest): Promise<void> {
  await apiClient.post("/v1/auth/password-update", data);
}

// 비밀번호 재설정 (비인증)
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await guestApiClient.post<ResetPasswordResponse>(
    "/v1/auth/password-reset",
    data
  );
  return response.data;
}

// 로그아웃 (인증 필요)
export async function logout(): Promise<void> {
  await apiClient.post("/v1/auth/logout");
}

// 이메일 로그인 (비인증)
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await guestApiClient.post<LoginResponse>("/v1/auth/login", data);
  return response.data;
}

export type {
  SendEmailVerifyRequest,
  VerifyEmailRequest,
  CheckPhoneNumberRequest,
  CheckEmailRequest,
  SignUpRequest,
  ReissueTokenRequest,
  UpdatePasswordRequest,
  ResetPasswordRequest,
  LoginRequest,
} from "./request";
export type {
  VerifyEmailResponse,
  SignUpResponse,
  ReissueTokenResponse,
  ResetPasswordResponse,
  LoginResponse,
} from "./response";
