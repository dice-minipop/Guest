import { createContext, useContext } from "react";

export type StackedBackContextValue = {
  requestBack: () => void;
};

export const StackedBackContext = createContext<StackedBackContextValue | null>(null);

export function useStackedBack() {
  const ctx = useContext(StackedBackContext);
  return ctx;
}
