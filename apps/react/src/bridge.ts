import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "@dice-v2/bridge";

export const bridge = linkBridge<AppBridge>({
  onReady: async (method) => {
    console.log("bridge is ready");
    const version = await method.getBridgeVersion();
    console.log("currentBridgeVersion", version);
  },
});
