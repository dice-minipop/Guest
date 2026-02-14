import { createWebView, bridge } from "@webview-bridge/react-native";
import * as WebBrowser from "expo-web-browser";

import { setBackGestureEnabled as setStoreBackGestureEnabled } from "./backGestureEnabledStore";
import { setTopSafeAreaColor as setStoreColor } from "./topSafeAreaColorStore";

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
  async getBridgeVersion() {
    return "1.0.0";
  },
  async setTopSafeAreaColor(color: string) {
    setStoreColor(color);
  },
  async setBackGestureEnabled(enabled: boolean) {
    setStoreBackGestureEnabled(enabled);
  },
});

export const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});
