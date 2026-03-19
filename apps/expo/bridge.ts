import { createWebView, bridge } from "@webview-bridge/react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { ActionSheetIOS, Alert, Linking, Platform } from "react-native";

import { setAccessToken as setStoreAccessToken } from "./accessTokenStore";
import { setTopSafeAreaColor as setStoreColor } from "./topSafeAreaColorStore";
import type { ImagePickSource, PickedImage } from "@dice-v2/bridge";

async function requestMediaPermissions(type: "camera" | "photo"): Promise<boolean> {
  const permission =
    type === "camera"
      ? ImagePicker.requestCameraPermissionsAsync()
      : ImagePicker.requestMediaLibraryPermissionsAsync();
  const { status } = await permission;
  return status === "granted";
}

async function assetToPickedImage(
  asset: ImagePicker.ImagePickerAsset
): Promise<PickedImage | null> {
  const base64 =
    asset.base64 ??
    (asset.uri
      ? await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        }).catch(() => null)
      : null);

  if (!base64) return null;
  const mimeType =
    (asset as ImagePicker.ImagePickerAsset & { mimeType?: string }).mimeType ?? "image/jpeg";
  const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
  return { base64, mimeType, fileName };
}

async function selectImageSource(): Promise<ImagePickSource | null> {
  if (Platform.OS === "ios") {
    return new Promise((resolve) => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "이미지 선택",
          options: ["앨범에서 사진 선택", "사진 찍기"],
          userInterfaceStyle: "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) resolve("gallery");
          else if (buttonIndex === 1) resolve("camera");
          else resolve(null);
        }
      );
    });
  }

  return new Promise((resolve) => {
    Alert.alert("이미지 추가", "가져올 방식을 선택해주세요.", [
      { text: "앨범에서 사진 선택", onPress: () => resolve("gallery") },
      { text: "사진 찍기", onPress: () => resolve("camera") },
    ]);
  });
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
  async setTopSafeAreaColor(color: string) {
    setStoreColor(color);
  },
  async setAccessToken(accessToken: string) {
    setStoreAccessToken(accessToken);
  },
  async clearAccessToken() {
    setStoreAccessToken(null);
  },
  async selectImageSource(): Promise<ImagePickSource | null> {
    return selectImageSource();
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
    return await assetToPickedImage(result.assets[0]);
  },
  async pickImageFromCamera(): Promise<PickedImage | null> {
    const granted = await requestMediaPermissions("camera");
    if (!granted) return null;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return await assetToPickedImage(result.assets[0]);
  },
});

export const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});
