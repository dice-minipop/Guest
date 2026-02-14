export interface SendEmailVerifyRequest {
  email: string;
}

export interface VerifyEmailRequest {
  code: string;
  email: string;
}

export interface CheckPhoneNumberRequest {
  phone: string;
}

export interface CheckEmailRequest {
  email: string;
}

export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
  userRole: 0 | 1;
}

export interface ReissueTokenRequest {
  refreshToken: string;
}

export interface UpdatePasswordRequest {
  password: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  code: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
