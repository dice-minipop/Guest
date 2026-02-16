import analytics from "@react-native-firebase/analytics";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import * as TrackingTransparency from "expo-tracking-transparency";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { requestUserPermission } from "@/hooks/useFCM";
import { getTopSafeAreaColor, subscribeTopSafeAreaColor } from "../topSafeAreaColorStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function createNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

function isFirebaseUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("No Firebase App") || message.includes("has been created");
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const topColor = useSyncExternalStore(
    subscribeTopSafeAreaColor,
    getTopSafeAreaColor,
    getTopSafeAreaColor
  );
  const isDarkTop = topColor === "#000000";
  const messagingUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "ios") {
          const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
          try {
            if (status === "granted") {
              await analytics().setAnalyticsCollectionEnabled(true);
            } else {
              await analytics().setAnalyticsCollectionEnabled(false);
            }
          } catch (error) {
            if (!isFirebaseUnavailableError(error)) console.error("추적 동의 요청 실패:", error);
          }
        } else {
          try {
            await analytics().setAnalyticsCollectionEnabled(true);
          } catch (error) {
            if (!isFirebaseUnavailableError(error)) console.error("Analytics 활성화 실패:", error);
          }
        }

        await requestUserPermission();
        await createNotificationChannel();

        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
          const { title, body } = remoteMessage.notification ?? {};
          await Notifications.scheduleNotificationAsync({
            content: {
              title: title ?? "알림",
              body: body ?? "",
              sound: true,
            },
            trigger: null,
          });
        });
        messagingUnsubscribeRef.current = unsubscribe;
      } catch (error) {
        if (!isFirebaseUnavailableError(error)) throw error;
      }
    })();

    return () => {
      messagingUnsubscribeRef.current?.();
      messagingUnsubscribeRef.current = null;
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* 웹뷰에서 전달한 상단 색상에 따라 StatusBar 제어 (layout에서 한 번만 설정해 충돌 방지) */}
      <StatusBar
        style={isDarkTop ? "light" : "dark"}
        {...(Platform.OS === "android" && { backgroundColor: topColor })}
      />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
