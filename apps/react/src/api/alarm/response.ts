export interface AlarmItem {
  alarmId: number;
  title: string;
  content: string;
  isRead: boolean;
}

export type GetAlarmsResponse = AlarmItem[];
