# Dice v2 — Vite + Expo WebView 모노레포

웹(Vite + React)과 네이티브 앱(Expo + React Native WebView)을 한 저장소에서 관리하는 모노레포입니다.

## 구조

```
dice_v2/
├── package.json          # 루트 워크스페이스
├── apps/
│   ├── react/            # Vite + React (WebView에 로드되는 웹 앱)
│   └── expo/             # Expo + React Native (WebView 셸)
└── packages/
    └── bridge/           # 네이티브 ↔ 웹 브릿지 타입 공통 패키지
```

- **react**: 브라우저/WebView에서 보여줄 React 앱. Vite로 개발·빌드.
- **expo**: iOS/Android 네이티브 셸. `react-native-webview`로 `react` 앱을 로드.
- **bridge**: Expo와 React가 공유하는 브릿지 메서드 타입(`AppBridge`).

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 웹 앱 개발 서버 (WebView에서 로드할 URL)

```bash
pnpm react
```

→ http://localhost:5173 에서 Vite 개발 서버가 뜹니다.

### 3. Expo 앱 실행

다른 터미널에서:

```bash
pnpm expo
```

Expo Go로 스캔하거나:

- iOS 시뮬레이터: `pnpm expo:ios`
- Android 에뮬레이터: `pnpm expo:android`

### 실기기에서 개발할 때

- **iOS**: 시뮬레이터는 `http://localhost:5173` 그대로 사용 가능.
- **Android 에뮬레이터**: 앱 코드에 `http://10.0.2.2:5173` 사용 중 (localhost 대신).
- **실기기**: 같은 Wi‑Fi에서 PC IP로 접근해야 함.  
  `apps/expo/app/(tabs)/web.tsx`의 `WEB_URI`를 `http://<당신의_PC_IP>:5173` 처럼 수정한 뒤, 웹 서버를 `pnpm react`로 띄우고 앱에서 해당 URL을 로드하면 됩니다.

## 스크립트

| 명령어              | 설명                    |
| ------------------- | ----------------------- |
| `pnpm react`        | 웹 앱 개발 서버 (Vite)  |
| `pnpm react:build`  | 웹 앱 프로덕션 빌드     |
| `pnpm expo`         | Expo 개발 서버          |
| `pnpm expo:ios`     | iOS 시뮬레이터 실행     |
| `pnpm expo:android` | Android 에뮬레이터 실행 |

## 프로덕션

1. 웹 앱을 호스팅할 URL 준비 (예: Vercel, Netlify 등에 `apps/react` 배포).
2. `apps/expo/app/(tabs)/web.tsx`에서 `WEB_URI`를 프로덕션 URL로 변경하거나, 환경 변수로 분리해 사용.

## 요구 사항

- Node.js 18+
- iOS: Xcode (맥)
- Android: Android Studio / SDK
