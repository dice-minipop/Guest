import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

import { saveFCMToken } from "@/server/fcm/fcm";

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log("📦 token from getToken:", token);
      await saveFCMToken(token);
    } else {
      console.warn("⚠️ getToken returned null or undefined");
    }
    return token;
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

function isFirebaseUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("No Firebase App") || message.includes("has been created");
}

export const requestUserPermission = async (): Promise<void> => {
  try {
    if (Platform.OS === "android") {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!hasPermission) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }

    await getToken();
  } catch (error) {
    if (isFirebaseUnavailableError(error)) {
      return;
    }
    throw error;
  }
};
