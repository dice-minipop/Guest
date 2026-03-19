import { createWebView, bridge } from "@webview-bridge/react-native";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";

export const appBridge = bridge({
  async getMessage() {
    return "Hello, I'm native";
  },
  async sum(a: number, b: number) {
    return a + b;
  },
  async openInAppBrowser(url: string) {
    await WebBrowser.openBrowserAsync(url);
  },
  async openExternalUrl(primaryUrl: string, fallbackUrl?: string) {
    try {
      await Linking.openURL(primaryUrl);
      return;
    } catch {
      if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
        return;
      }
      throw new Error("외부 URL을 열 수 없습니다.");
    }
  },
  async getBridgeVersion() {
    return "1.0.0";
  },
});

export type AppBridge = typeof appBridge;

export const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});
