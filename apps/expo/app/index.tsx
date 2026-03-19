import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Platform, BackHandler, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { WebViewNavigation } from "react-native-webview";

import { WebView } from "@/bridge";
import { getTopSafeAreaColor, subscribeTopSafeAreaColor } from "../topSafeAreaColorStore";
import type { BridgeWebView } from "@webview-bridge/react-native";

const WEB_URI = "https://dice-guest-react.vercel.app";

export default function Index() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<BridgeWebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const topColor = useSyncExternalStore(
    subscribeTopSafeAreaColor,
    getTopSafeAreaColor,
    getTopSafeAreaColor
  );
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      }
      return false;
    });

    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  return (
    <View style={{ flex: 1, backgroundColor: topColor }}>
      {/* StatusBar 스타일은 _layout.tsx에서 store 구독으로 한 곳에서만 제어 */}
      <View
        style={{
          height: insets.top,
          backgroundColor: topColor,
        }}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["left", "right", "bottom"]}
      >
        <View style={{ flex: 1, backgroundColor: topColor }}>
          <WebView
            ref={webviewRef}
            source={{ uri: WEB_URI }}
            style={{ flex: 1, backgroundColor: topColor }}
            onNavigationStateChange={handleNavigationStateChange}
            allowsBackForwardNavigationGestures={Platform.OS === "ios"}
            bounces={false}
            overScrollMode="never"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
