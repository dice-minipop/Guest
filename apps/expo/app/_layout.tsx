import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getTopSafeAreaColor, subscribeTopSafeAreaColor } from "../topSafeAreaColorStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const topColor = useSyncExternalStore(
    subscribeTopSafeAreaColor,
    getTopSafeAreaColor,
    getTopSafeAreaColor
  );
  const isDarkTop = topColor === "#000000";

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
