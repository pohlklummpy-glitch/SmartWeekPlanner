import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DAYS } from '../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // iOS: show as banner even when app is in foreground
    shouldPresentAlert: true,
    shouldPresentSound: true,
    shouldPresentBadge: true,
  }),
});

export async function setupNotifications() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true, // Request critical alert permission on iOS
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-alarm', {
      name: 'Taskn-Alarm',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lightColor: '#6C63FF',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
    await Notifications.setNotificationChannelAsync('pre-reminder', {
      name: 'Vorerinnerung',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
      sound: 'default',
    });
  }
}

// Build iOS-specific alarm content options
function buildAlarmContent(title, body, data) {
  const content = {
    title,
    body,
    data,
    sound: true,
  };
  // iOS 15+: interruptionLevel 'timeSensitive' breaks through Focus modes
  if (Platform.OS === 'ios') {
    content.interruptionLevel = 'timeSensitive';
  }
  return content;
}

export async function scheduleTaskNotification(task) {
  try {
    const [hours, minutes] = task.time.split(':').map(Number);
    const now = new Date();
    
    // Berechne den Wochentag
    const currentDayJS = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const currentDayApp = currentDayJS === 0 ? 6 : currentDayJS - 1; // 0=Mon, ..., 6=Sun
    const targetDayApp = task.day; // 0=Mon, ..., 6=Sun
    
    // Berechne das Ziel-Datum
    const taskDate = new Date();
    taskDate.setHours(hours, minutes, 0, 0);
    
    let daysUntilTask = targetDayApp - currentDayApp;
    
    // Wenn Task heute ist, aber Zeit schon vorbei
    if (daysUntilTask === 0 && taskDate <= now) {
      if (task.repeat === 'weekly') {
        daysUntilTask = 7; // Nächste Woche
      } else {
        console.log('⚠️ Task ist in der Vergangenheit und "once" - keine Notification geplant');
        return null;
      }
    }
    // Wenn Task in der Vergangenheit dieser Woche
    else if (daysUntilTask < 0) {
      if (task.repeat === 'weekly') {
        daysUntilTask += 7; // Nächste Woche
      } else {
        console.log('⚠️ Task ist in der Vergangenheit und "once" - keine Notification geplant');
        return null;
      }
    }
    
    taskDate.setDate(taskDate.getDate() + daysUntilTask);
    
    const secondsUntil = Math.round((taskDate - now) / 1000);
    const minutesUntil = Math.round(secondsUntil / 60);
    
    console.log('📅 Scheduling notification:', {
      task: task.title,
      time: task.time,
      now: now.toLocaleTimeString('de-DE'),
      targetDate: taskDate.toLocaleString('de-DE'),
      repeat: task.repeat,
      minutesUntil: minutesUntil + ' Min',
    });
    
    // Trigger: Verwende immer date-based trigger für präzises Timing
    const trigger = {
      date: taskDate,
    };
    
    const notifId = await Notifications.scheduleNotificationAsync({
      content: buildAlarmContent(
        task.title,
        `⏰ ${task.time} Uhr`,
        { taskId: task.id },
      ),
      trigger: Platform.OS === 'android'
        ? { ...trigger, channelId: 'task-alarm' }
        : trigger,
    });
    
    console.log('✅ Notification scheduled! Kommt in', minutesUntil, 'Minuten');
    
    // Vorklingeln (Pre-Reminder)
    if (task.preReminder) {
      const preMinutes = task.preReminder;
      const preReminderDate = new Date(taskDate.getTime() - preMinutes * 60 * 1000);
      
      // Nur planen wenn Vorklingeln in der Zukunft liegt
      if (preReminderDate > now) {
        const preSecondsUntil = Math.round((preReminderDate - now) / 1000);
        const preMinutesUntil = Math.round(preSecondsUntil / 60);
        
        console.log('🔔 Scheduling pre-reminder:', {
          task: task.title,
          preMinutes: preMinutes + ' Min vorher',
          preReminderDate: preReminderDate.toLocaleString('de-DE'),
          minutesUntil: preMinutesUntil + ' Min',
        });
        
        const preContent = buildAlarmContent(
          `Vorklingeln für ${task.title}`,
          `In ${preMinutes} Minuten – ${task.time} Uhr`,
          { taskId: task.id, type: 'pre-reminder' },
        );
        
        const preTrigger = {
          date: preReminderDate,
        };
        
        await Notifications.scheduleNotificationAsync({
          content: Platform.OS === 'android'
            ? { ...preContent, channelId: 'pre-reminder' }
            : preContent,
          trigger: Platform.OS === 'android'
            ? { ...preTrigger, channelId: 'pre-reminder' }
            : preTrigger,
        });
        
        console.log('✅ Pre-reminder scheduled! Kommt in', preMinutesUntil, 'Minuten');
      } else {
        console.log('⚠️ Pre-reminder wäre in der Vergangenheit, nicht geplant');
      }
    }
    
    return notifId;
  } catch (e) {
    console.error('❌ Error scheduling notification:', e);
    return null;
  }
}

export async function cancelNotification(notificationId) {
  try {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (e) {
    console.error('Error canceling notification:', e);
  }
}

export async function cancelAllTaskNotifications(notificationIds = []) {
  try {
    await Promise.all(notificationIds.filter(Boolean).map(id =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    ));
  } catch (e) {
    console.error('Error canceling notifications:', e);
  }
}

export async function scheduleSnooze(task, minutes) {
  try {
    const trigger = new Date(Date.now() + minutes * 60 * 1000);
    const content = buildAlarmContent(
      task.title,
      `⏰ Snooze – ${minutes} Min`,
      { taskId: task.id },
    );
    await Notifications.scheduleNotificationAsync({
      content: Platform.OS === 'android'
        ? { ...content, channelId: 'task-alarm' }
        : content,
      trigger,
    });
  } catch (e) {
    console.error('Error scheduling snooze:', e);
  }
}
