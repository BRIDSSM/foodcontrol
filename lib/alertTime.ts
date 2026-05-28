import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALERT_TIME_KEY = 'alert_time';
export const DEFAULT_ALERT_HOUR = 9;
export const DEFAULT_ALERT_MINUTE = 0;

export async function getAlertTime(): Promise<{ hour: number; minute: number }> {
  const val = await AsyncStorage.getItem(ALERT_TIME_KEY);
  if (!val) return { hour: DEFAULT_ALERT_HOUR, minute: DEFAULT_ALERT_MINUTE };
  const [h, m] = val.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return { hour: DEFAULT_ALERT_HOUR, minute: DEFAULT_ALERT_MINUTE };
  return { hour: h, minute: m };
}

export async function saveAlertTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(ALERT_TIME_KEY, `${hour}:${minute}`);
}

export function formatAlertTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
