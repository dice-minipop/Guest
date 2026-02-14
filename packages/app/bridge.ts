import { createWebView, bridge } from "@webview-bridge/react-native";
import * as WebBrowser from "expo-web-browser";

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
});

export type AppBridge = typeof appBridge;

export const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});
