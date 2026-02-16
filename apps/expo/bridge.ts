import { createWebView, bridge } from "@webview-bridge/react-native";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";

import { setAccessToken as setStoreAccessToken } from "./accessTokenStore";
import { setBackGestureEnabled as setStoreBackGestureEnabled } from "./backGestureEnabledStore";
import { setTopSafeAreaColor as setStoreColor } from "./topSafeAreaColorStore";
import type { PickedImage } from "@dice-v2/bridge";

async function requestMediaPermissions(type: "camera" | "photo"): Promise<boolean> {
  const permission =
    type === "camera"
      ? ImagePicker.requestCameraPermissionsAsync()
      : ImagePicker.requestMediaLibraryPermissionsAsync();
  const { status } = await permission;
  return status === "granted";
}

function assetToPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage | null {
  const base64 = asset.base64;
  if (!base64) return null;
  const mimeType =
    (asset as ImagePicker.ImagePickerAsset & { mimeType?: string }).mimeType ?? "image/jpeg";
  const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
  return { base64, mimeType, fileName };
}

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
  async setAccessToken(accessToken: string) {
    setStoreAccessToken(accessToken);
  },
  async clearAccessToken() {
    setStoreAccessToken(null);
  },
  async pickImageFromGallery(): Promise<PickedImage | null> {
    const granted = await requestMediaPermissions("photo");
    if (!granted) return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.9,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return assetToPickedImage(result.assets[0]);
  },
  async pickImageFromCamera(): Promise<PickedImage | null> {
    const granted = await requestMediaPermissions("camera");
    if (!granted) return null;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return assetToPickedImage(result.assets[0]);
  },
});

export const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});
