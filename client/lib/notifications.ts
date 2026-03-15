import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const HABIT_REMINDER_CHANNEL_ID = 'habit-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return null;
  }

  return Notifications.setNotificationChannelAsync(HABIT_REMINDER_CHANNEL_ID, {
    name: 'Habit reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    return result.status === 'granted';
  }
  return true;
}

export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number,
) {
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return null;
  }

  await ensureNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
      ...(Platform.OS === 'android' ? { channelId: HABIT_REMINDER_CHANNEL_ID } : {}),
    },
  });
}
