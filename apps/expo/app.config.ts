import { config } from "dotenv";
import type { ExpoConfig } from "expo/config";

config();

const defineConfig: ExpoConfig = {
  owner: "minipop",
  name: "dice",
  slug: "dice-tjqg4qqylrqtw3-cum4wq",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  runtimeVersion: "1.0.0",
  extra: {
    eas: {
      projectId: "340f0603-94f2-4db4-baa1-62900f23fe8d",
    },
  },
  updates: {
    url: "https://u.expo.dev/340f0603-94f2-4db4-baa1-62900f23fe8d",
  },
  ios: {
    supportsTablet: false,
    icon: "./assets/images/icon.png",
    bundleIdentifier: "com.minipop.dice2",
    buildNumber: "1",
    entitlements: {
      "aps-environment": "production",
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSUserNotificationUsageDescription: "푸시 알림을 통해 중요한 알림을 받을 수 있습니다.",
      NSPhotoLibraryUsageDescription:
        "회원가입 또는 프로필·브랜드 이미지 업데이트 시 사진을 업로드하기 위해 사진 라이브러리 접근이 필요합니다.",
      NSCameraUsageDescription: "프로필·브랜드 이미지 촬영을 위해 카메라 접근이 필요합니다.",
      NSUserTrackingUsageDescription: "더 나은 서비스 제공을 위해 사용자 활동을 추적합니다.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      UIBackgroundModes: ["remote-notification"],
      aps: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST ?? "./GoogleService-Info.plist",
  },
  android: {
    package: "com.cmc.dice.minipop.expo",
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: "./assets/images/android_logo.png",
      backgroundColor: "#000000",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-tracking-transparency",
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "@react-native-firebase/app",
      {
        ios: {
          googleServicesFile:
            process.env.GOOGLE_SERVICES_INFO_PLIST ?? "./GoogleService-Info.plist",
        },
      },
    ],
    [
      "@react-native-firebase/messaging",
      {
        ios: {
          capabilities: ["remote-notification"],
          backgroundModes: ["remote-notification"],
        },
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          podfileProperties: {
            "use_modular_headers!": true,
          },
          // RNFB non-modular 헤더 에러 회피 (expo/expo#39607). forceStaticLinking만으로 해결 안 될 때 사용.
          buildReactNativeFromSource: true,
        },
      },
    ],
    [
      "expo-notifications",
      {
        ios: { skipNativeNotificationListener: true },
        android: { skipNativeNotificationListener: true },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon-light.png",
        imageWidth: 180,
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
    "./plugins/withRNFBPodfileFix.js",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default defineConfig;
