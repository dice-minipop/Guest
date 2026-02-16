import { getAccessToken } from "../../accessTokenStore";

const FCM_REGISTER_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/v1/fcm/token`
  : "";

/**
 * FCM 토큰을 서버에 등록합니다.
 * 웹에서 setAccessToken으로 전달한 AccessToken이 있으면 Authorization 헤더에 붙여 요청합니다.
 */
export const saveFCMToken = async (token: string): Promise<void> => {
  const accessToken = getAccessToken();
  if (!FCM_REGISTER_URL) {
    console.log("📤 FCM token (no API URL):", token, "accessToken:", !!accessToken);
    return;
  }
  try {
    const res = await fetch(FCM_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ fcmToken: token }),
    });
    if (!res.ok) {
      console.warn("📤 FCM 등록 실패:", res.status, await res.text());
      return;
    }
    console.log("📤 FCM token 등록 완료");
  } catch (e) {
    console.error("📤 FCM token 등록 오류:", e);
  }
};
