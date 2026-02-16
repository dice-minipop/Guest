# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## 빌드 및 실행 명령어

### 로컬 개발 빌드를 기기에 설치해 실행

네이티브 폴더(`android`/`ios`)는 **apps/expo** 안에 있어야 합니다. 루트에서 prebuild 후 아래처럼 실행하세요.

**1) 네이티브 프로젝트 생성 (최초 1회 또는 설정 변경 시)**

```bash
# 프로젝트 루트에서
pnpm expo:prebuild        # 생성/갱신
pnpm expo:prebuild:clean  # 기존 삭제 후 재생성
```

**2) 기기/에뮬레이터에서 실행**

```bash
# 프로젝트 루트에서
pnpm android   # Android (연결된 기기 또는 에뮬레이터)
pnpm ios       # iOS (연결된 기기 또는 시뮬레이터)
```

또는 **apps/expo**에서 직접:

```bash
cd apps/expo
npx expo run:android   # Android
npx expo run:ios      # iOS (실기기: --device)
```

---

### EAS Build (클라우드 빌드)

```bash
# apps/expo로 이동하거나 루트에서 --working-dir 사용
cd apps/expo

# 개발 빌드 (내부 테스트용)
eas build --profile development --platform ios
eas build --profile development --platform android

# 미리보기 (내부 배포, Android는 APK)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# 프로덕션 (스토어 제출용)
eas build --profile production --platform ios
eas build --profile production --platform android
eas build --profile production --platform all
```

---

### EAS Submit (스토어 제출)

빌드가 끝난 후 같은 프로젝트에서:

```bash
cd apps/expo

# iOS (App Store Connect)
eas submit --platform ios --profile production

# Android (Google Play, 내부 트랙)
eas submit --platform android --profile production
```

`eas.json`의 `submit.production`에 `appleId`, `ascAppId`, `appleTeamId`(iOS), `serviceAccountKeyPath`(Android) 등을 채워 두어야 합니다.

---

### iOS: `pod install` 실패 (Firebase / GoogleUtilities)

**에러 예:**

```text
The Swift pod `FirebaseCoreInternal` depends upon `GoogleUtilities`, which does not define modules.
To opt into those targets generating module maps... you may set `use_modular_headers!` globally in your Podfile
```

**이유:**  
React Native Firebase(iOS)는 Swift 정적 라이브러리로 링크되는데, `GoogleUtilities` 등 일부 Pod가 모듈 맵을 제공하지 않아 Swift에서 import할 수 없습니다. 그래서 Podfile에 `use_modular_headers!`(또는 특정 의존성에 `:modular_headers => true`)를 넣어 모듈 맵을 생성해 줘야 합니다.

**조치:**  
이 프로젝트에는 `expo-build-properties` 플러그인으로 다음을 적용해 두었습니다.

- `useFrameworks: "static"`
- `podfileProperties["use_modular_headers!"]: true`

설치 후 **한 번 더** prebuild를 실행하세요.

```bash
pnpm install
pnpm expo:prebuild:clean
```

**xcodebuild 단계에서** `include of non-modular header inside framework module 'RNFBApp...'` 에러가 나면, `expo-build-properties`에 `forceStaticLinking: ["RNFBApp", "RNFBMessaging"]`가 적용돼 있는지 확인한 뒤 **prebuild를 다시** 실행하세요. 그래도 실패하면 [expo/expo#39607](https://github.com/expo/expo/issues/39607)의 `buildReactNativeFromSource: true` 워크어라운드를 참고하세요.

---

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
