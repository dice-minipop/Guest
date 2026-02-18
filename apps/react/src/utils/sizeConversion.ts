export const PYEONG_TO_M2 = 3.3058;

/** 평 → m² (× 3.3058), 소수점 셋째자리에서 반올림(소수 둘째자리까지) */
export function pyeongToM2(pyeong: number): number {
  return Math.round(pyeong * PYEONG_TO_M2 * 100) / 100;
}

/** m² → 평 (÷ 3.3058), 소수점 셋째자리에서 반올림(소수 둘째자리까지) */
export function m2ToPyeong(m2: number): number {
  return Math.round((m2 / PYEONG_TO_M2) * 100) / 100;
}
