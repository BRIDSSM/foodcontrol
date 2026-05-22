import { Platform } from 'react-native';

import { isExpoGo } from '@/lib/platform';

function loadNotifications(): typeof import('expo-notifications') {
  return require('expo-notifications');
}

export async function setupNotificationChannel(): Promise<void> {
  if (isExpoGo) return;
  if (Platform.OS !== 'android') return;
  const Notifications = loadNotifications();
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Alertas de validade',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) return false;
  const Notifications = loadNotifications();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
