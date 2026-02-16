import { bridge } from "@/bridge";

/**
 * base64 데이터를 웹에서 사용할 File 객체로 변환합니다.
 */
export function base64ToFile(
  base64: string,
  mimeType: string,
  fileName: string
): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], fileName || "image.jpg", { type: mimeType });
}

/**
 * 앱(WebView) 환경에서 네이티브 갤러리/카메라를 사용할 수 있는지 여부
 */
export function isNativeImagePickerAvailable(): boolean {
  return (
    typeof bridge?.isNativeMethodAvailable === "function" &&
    (bridge.isNativeMethodAvailable("pickImageFromGallery") ||
      bridge.isNativeMethodAvailable("pickImageFromCamera"))
  );
}

/**
 * 앱 환경이면 브릿지로 갤러리에서 이미지 선택, 아니면 null 반환 (호출 측에서 input[type=file] 사용)
 */
export async function pickImageFromNativeGallery(): Promise<File | null> {
  if (
    typeof bridge?.isNativeMethodAvailable !== "function" ||
    !bridge.isNativeMethodAvailable("pickImageFromGallery")
  ) {
    return null;
  }
  const result = await bridge.pickImageFromGallery();
  if (!result) return null;
  return base64ToFile(
    result.base64,
    result.mimeType,
    result.fileName ?? "image.jpg"
  );
}

/**
 * 앱 환경이면 브릿지로 카메라 촬영, 아니면 null 반환
 */
export async function pickImageFromNativeCamera(): Promise<File | null> {
  if (
    typeof bridge?.isNativeMethodAvailable !== "function" ||
    !bridge.isNativeMethodAvailable("pickImageFromCamera")
  ) {
    return null;
  }
  const result = await bridge.pickImageFromCamera();
  if (!result) return null;
  return base64ToFile(
    result.base64,
    result.mimeType,
    result.fileName ?? "image.jpg"
  );
}

/**
 * 앱이면 갤러리 또는 카메라에서 이미지 1장 선택 (소스에 따라).
 * 웹이면 null 반환.
 */
export async function pickImageFromNative(
  source: "gallery" | "camera"
): Promise<File | null> {
  return source === "gallery"
    ? pickImageFromNativeGallery()
    : pickImageFromNativeCamera();
}
