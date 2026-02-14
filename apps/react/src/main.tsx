import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { refreshTokensOnLoad } from "./api/axios";
import "./main.css";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
});

export function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    refreshTokensOnLoad().then((didRefresh) => {
      if (didRefresh) {
        const path = window.location.pathname;
        if (path === "/login" || path === "/") {
          window.history.replaceState(null, "", "/space");
        }
      }
      console.log("[auth] 앱 로드 인증 준비 완료");
      setAuthReady(true);
    });
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-white)">
        <p className="typo-body2 text-gray-deep">로딩 중...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
