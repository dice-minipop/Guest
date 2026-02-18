import { Colors } from "@/constants/theme";

export function useThemeColor(props: { light?: string }, colorName: keyof typeof Colors) {
  return props.light ?? Colors[colorName];
}
