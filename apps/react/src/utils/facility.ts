/**
 * 시설 키를 API/하이픈 형식에서 camelCase로 정규화
 */
function normalizeFacilityKey(name: string): string {
  return name
    .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    .replace(/^firealarm$/i, "fireAlarm");
}

/**
 * 시설 키에 해당하는 한글 라벨 반환 (개수 포함 여부는 시설별로 다름)
 */
export function getFacilityLabel(name: string, count?: number): string {
  const key = normalizeFacilityKey(name);
  const n = count ?? 0;

  const labels: Record<string, string> = {
    cctv: "CCTV",
    chair: `의자 ${n}개`,
    circleTable: `원형테이블 ${n}개`,
    couch: `쇼파 ${n}개`,
    desktop: `데스크탑 ${n}개`,
    drink: `음료수 보관대 ${n}개`,
    fireExtinguisher: `소화기 ${n}개`,
    fireAlarm: "화재경보기",
    firstAidKit: "구급 상자",
    light: "공간별 조명 밝기 조절 가능",
    monitor: `모니터 ${n}개`,
    printer: `프린터·복사기 ${n}개`,
    projector: `빔프로젝터 ${n}개`,
    shelf: `진열대 ${n}개`,
    speaker: `스피커 ${n}개`,
    squareTable: `사각테이블 ${n}개`,
    standingTable: `스탠딩테이블 ${n}개`,
    tv: `TV ${n}개`,
    waterPurifier: `정수기 ${n}개`,
    wifi: "Wi-fi",
  };

  return labels[key] ?? "";
}
