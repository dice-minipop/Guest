import { apiClient } from "../axios";
import type { GetAlarmsResponse } from "./response";

/** 알림 조회 */
export async function getAlarms(): Promise<GetAlarmsResponse> {
  const response = await apiClient.get<GetAlarmsResponse>("/v1/alarms");
  return response.data;
}

/** 알림 읽기(전체) */
export async function readAllAlarms(): Promise<void> {
  await apiClient.post("/v1/alarms");
}

/** 알림 읽기(단일) */
export async function readAlarm(alarmId: number): Promise<void> {
  await apiClient.post(`/v1/alarms/${alarmId}`);
}

/** 알림 삭제 */
export async function deleteAlarm(alarmId: number): Promise<void> {
  await apiClient.delete(`/v1/alarms/${alarmId}`);
}

export type { AlarmItem, GetAlarmsResponse } from "./response";
