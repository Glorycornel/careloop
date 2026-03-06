import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number,
) {
  await requestNotificationPermissions();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { hour, minute, repeats: true },
  });
}
