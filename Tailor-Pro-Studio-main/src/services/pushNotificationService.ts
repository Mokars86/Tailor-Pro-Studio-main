import { AppNotification, PushNotificationType } from '../types';
import { supabase } from '../lib/supabase';

const NOTIFICATIONS_STORAGE_KEY = 'tailor_push_notifications_history';
const NOTIFICATIONS_SOUND_KEY = 'tailor_notification_sound_enabled';
const REALTIME_CHANNEL_NAME = 'tailorpro_realtime_notifications';
const LOCAL_BROADCAST_NAME = 'tailorpro_local_broadcast';

// Audio Context Singleton for synthesized notification chime
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a high-quality bespoke studio chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const isSoundEnabled = localStorage.getItem(NOTIFICATIONS_SOUND_KEY) !== 'false';
    if (!isSoundEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic Dual-Tone Atelier Chime (E5 659.25Hz -> B5 987.77Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.05); // B5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35); // E6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);

    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('[Notification Audio] Could not play synthesized chime:', err);
  }
}

/**
 * Trigger physical tactile vibration on mobile devices
 */
export function triggerDeviceVibration(pattern: number[] = [180, 80, 180]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (err) {
    // Ignore unsupported vibration errors
  }
}

/**
 * Check current native push notification permission
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request native device push notification permission (Cross-Platform iOS & Android)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await new Promise<NotificationPermission>((resolve) => {
        try {
          const p = Notification.requestPermission((res) => {
            resolve(res);
          });
          if (p && typeof (p as any).then === 'function') {
            (p as any).then(resolve).catch(() => resolve(Notification.permission));
          }
        } catch {
          resolve(Notification.permission);
        }
      });
    }
    return permission === 'granted';
  } catch (err) {
    console.warn('[Push Notification] Permission request error:', err);
    return false;
  }
}

/**
 * Display native system/phone notification banner in OS tray / status bar
 */
export async function showNativeSystemNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const options: any = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/favicon-32x32.png',
      tag: `tailorpro-${Date.now()}`,
      vibrate: [200, 100, 200],
      data: data || {},
      requireInteraction: false
    };

    // 1. Try ServiceWorkerRegistration.showNotification first (Required for mobile Android / Chrome / PWA)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
        ]);
        if (registration && typeof (registration as any).showNotification === 'function') {
          await (registration as any).showNotification(title, options);
          return;
        }
      } catch (swErr) {
        console.warn('[Push Notification] SW showNotification note:', swErr);
      }
    }

    // 2. Standard constructor fallback (Desktop browsers)
    try {
      new Notification(title, options);
    } catch {
      // Ignored on Android mobile browser where ServiceWorker is required
    }
  } catch (err) {
    console.warn('[Push Notification] Native notification error:', err);
  }
}

/**
 * Retrieve saved notification history from localStorage
 */
export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save notification list to localStorage
 */
export function saveNotificationsToStorage(notifications: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    // Limit to latest 100 notifications to prevent unbounded growth
    const trimmed = notifications.slice(0, 100);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[Push Notification] Failed to persist notifications:', err);
  }
}

/**
 * Mark a specific notification as read
 */
export function markNotificationAsRead(id: string): AppNotification[] {
  const list = getStoredNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotificationsToStorage(list);
  return list;
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): AppNotification[] {
  const list = getStoredNotifications().map((n) => ({ ...n, read: true }));
  saveNotificationsToStorage(list);
  return list;
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): AppNotification[] {
  saveNotificationsToStorage([]);
  return [];
}

/**
 * Toggle sound setting
 */
export function setNotificationSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_SOUND_KEY, enabled ? 'true' : 'false');
}

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(NOTIFICATIONS_SOUND_KEY) !== 'false';
}

// Local BroadcastChannel instance for cross-tab communication
let localBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    localBroadcastChannel = new BroadcastChannel(LOCAL_BROADCAST_NAME);
  } catch {
    localBroadcastChannel = null;
  }
}

// Global active notification listeners
type NotificationCallback = (notification: AppNotification) => void;
const listeners: Set<NotificationCallback> = new Set();

export function subscribeToNotificationEvents(callback: NotificationCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Internal handler when an incoming notification is received
 */
function handleIncomingNotification(
  notification: AppNotification,
  currentUserRole: 'master' | 'apprentice' | 'all',
  currentUserName?: string
) {
  // Check if notification is targeted to current user role
  const matchesRole =
    notification.targetRole === 'all' ||
    notification.targetRole === currentUserRole ||
    (currentUserRole === 'all');

  // Check if targeted to specific user
  const matchesUser =
    !notification.targetUserId && !notification.targetUserName
      ? true
      : notification.targetUserName && currentUserName
      ? notification.targetUserName.toLowerCase() === currentUserName.toLowerCase()
      : true;

  if (!matchesRole || !matchesUser) {
    return;
  }

  // Save to local storage
  const currentList = getStoredNotifications();
  // Prevent duplicates
  if (!currentList.some((n) => n.id === notification.id)) {
    const updated = [notification, ...currentList];
    saveNotificationsToStorage(updated);
  }

  // Sound and Vibration
  playNotificationChime();
  triggerDeviceVibration();

  // Native phone/browser notification
  showNativeSystemNotification(notification.title, notification.body, notification.metadata);

  // Notify registered in-app React listeners
  listeners.forEach((cb) => {
    try {
      cb(notification);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Initialize Realtime & Multi-tab listener for push notifications
 */
export function initPushNotificationService(
  currentUserRole: 'master' | 'apprentice' | 'all',
  currentUserName?: string
): () => void {
  // 1. Listen via Supabase Realtime Broadcast Channel
  const realtimeChannel = supabase.channel(REALTIME_CHANNEL_NAME);

  realtimeChannel
    .on('broadcast', { event: 'push_notification' }, ({ payload }) => {
      if (payload && payload.id) {
        handleIncomingNotification(payload as AppNotification, currentUserRole, currentUserName);
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connected to realtime push network
      }
    });

  // 2. Listen via Local BroadcastChannel (cross-tab sync)
  const handleLocalMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'PUSH_NOTIFICATION_DISPATCH' && event.data.notification) {
      handleIncomingNotification(event.data.notification as AppNotification, currentUserRole, currentUserName);
    }
  };

  if (localBroadcastChannel) {
    localBroadcastChannel.addEventListener('message', handleLocalMessage);
  }

  // Return teardown function
  return () => {
    supabase.removeChannel(realtimeChannel);
    if (localBroadcastChannel) {
      localBroadcastChannel.removeEventListener('message', handleLocalMessage);
    }
  };
}

/**
 * Dispatch a Push Notification across the studio network (Realtime + Local + Native)
 */
export async function dispatchPushNotification(
  notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
): Promise<AppNotification> {
  const fullNotification: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  // 1. Save to local storage for current client
  const existing = getStoredNotifications();
  saveNotificationsToStorage([fullNotification, ...existing]);

  // 2. Broadcast via Supabase Realtime
  try {
    const channel = supabase.channel(REALTIME_CHANNEL_NAME);
    await channel.send({
      type: 'broadcast',
      event: 'push_notification',
      payload: fullNotification
    });
  } catch (err) {
    console.warn('[Push Notification] Realtime broadcast warning:', err);
  }

  // 3. Broadcast to other local browser tabs
  try {
    if (localBroadcastChannel) {
      localBroadcastChannel.postMessage({
        type: 'PUSH_NOTIFICATION_DISPATCH',
        notification: fullNotification
      });
    }
  } catch (err) {
    console.warn('[Push Notification] Local broadcast warning:', err);
  }

  // 4. Try saving to Supabase DB table `studio_notifications` if available
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      void supabase.from('studio_notifications').insert({
        id: fullNotification.id,
        type: fullNotification.type,
        title: fullNotification.title,
        body: fullNotification.body,
        target_role: fullNotification.targetRole,
        target_user_name: fullNotification.targetUserName || null,
        sender_name: fullNotification.senderName,
        sender_role: fullNotification.senderRole,
        metadata: fullNotification.metadata || {},
        created_at: fullNotification.timestamp
      });
    }
  } catch {
    // Non-blocking
  }

  // 5. Notify local listeners
  listeners.forEach((cb) => {
    try {
      cb(fullNotification);
    } catch (e) {
      console.error(e);
    }
  });

  return fullNotification;
}

// =========================================================================
// SPECIALIZED STUDIO NOTIFICATION TRIGGERS
// =========================================================================

/**
 * 1. Master assigns a task to an Apprentice
 * -> Apprentice receives push notification on phone
 */
export async function notifyTaskAssigned(params: {
  taskTitle: string;
  apprenticeName: string;
  masterName: string;
  category?: string;
  dueDate?: string;
}) {
  const { taskTitle, apprenticeName, masterName, category, dueDate } = params;

  return dispatchPushNotification({
    type: 'TASK_ASSIGNED',
    title: '📋 New Workshop Duty Assigned!',
    body: `Master ${masterName} assigned: "${taskTitle}"${category ? ` (${category})` : ''}.${dueDate ? ` Due: ${dueDate}` : ''}`,
    targetRole: 'apprentice',
    targetUserName: apprenticeName === 'all' ? undefined : apprenticeName,
    senderName: masterName,
    senderRole: 'Master',
    metadata: {
      taskTitle,
      category,
      dueDate,
      assignedTo: apprenticeName
    }
  });
}

/**
 * 2. Apprentice completes & submits assigned task for review
 * -> Master receives push notification on phone
 */
export async function notifyTaskSubmitted(params: {
  taskTitle: string;
  apprenticeName: string;
  masterName?: string;
  taskId?: string;
}) {
  const { taskTitle, apprenticeName, masterName, taskId } = params;

  return dispatchPushNotification({
    type: 'TASK_SUBMITTED',
    title: '⏳ Task Submitted for Review!',
    body: `Apprentice ${apprenticeName} has completed "${taskTitle}" and submitted it for your master review.`,
    targetRole: 'master',
    senderName: apprenticeName,
    senderRole: 'Apprentice',
    metadata: {
      taskId,
      taskTitle,
      apprenticeName
    }
  });
}

/**
 * 3. Master passes / approves apprentice's task
 * -> Apprentice receives celebratory push notification on phone
 */
export async function notifyTaskPassed(params: {
  taskTitle: string;
  apprenticeName: string;
  masterName: string;
  taskId?: string;
}) {
  const { taskTitle, apprenticeName, masterName, taskId } = params;

  return dispatchPushNotification({
    type: 'TASK_PASSED',
    title: '🎉 Task Passed & Approved!',
    body: `Master ${masterName} has reviewed and PASSED your task: "${taskTitle}"! 🌟`,
    targetRole: 'apprentice',
    targetUserName: apprenticeName === 'all' ? undefined : apprenticeName,
    senderName: masterName,
    senderRole: 'Master',
    metadata: {
      taskId,
      taskTitle,
      apprenticeName
    }
  });
}

/**
 * 4. Apprentice takes or updates a client body measurement
 * -> Master receives push notification on phone
 */
export async function notifyMeasurementRecorded(params: {
  clientName: string;
  garmentTag?: string;
  apprenticeName: string;
  masterName?: string;
  clientId?: string;
}) {
  const { clientName, garmentTag, apprenticeName, clientId } = params;

  return dispatchPushNotification({
    type: 'MEASUREMENT_RECORDED',
    title: '📏 Client Measurements Recorded!',
    body: `Apprentice ${apprenticeName} recorded new tape measurements for "${clientName}"${garmentTag ? ` (${garmentTag})` : ''}.`,
    targetRole: 'master',
    senderName: apprenticeName,
    senderRole: 'Apprentice',
    metadata: {
      clientId,
      clientName,
      garmentTag,
      apprenticeName
    }
  });
}

/**
 * 5. Garment Runway Production Stage Advanced (e.g. CONSULT -> CUTTING -> SEWING)
 * -> Master receives push notification
 */
export async function notifyGarmentStageUpdated(params: {
  clientName: string;
  newStage: string;
  apprenticeName: string;
  masterName?: string;
  clientId?: string;
}) {
  const { clientName, newStage, apprenticeName, clientId } = params;

  return dispatchPushNotification({
    type: 'GARMENT_STAGE_UPDATED',
    title: '✂️ Garment Stage Updated!',
    body: `Apprentice ${apprenticeName} moved "${clientName}"'s order to [${newStage}] stage.`,
    targetRole: 'master',
    senderName: apprenticeName,
    senderRole: 'Apprentice',
    metadata: {
      clientId,
      clientName,
      newStage,
      apprenticeName
    }
  });
}

/**
 * 6. Apprentice links to Atelier via Workshop Code
 * -> Master receives push notification
 */
export async function notifyApprenticeLinked(params: {
  apprenticeName: string;
  masterName: string;
  workshopCode: string;
}) {
  const { apprenticeName, masterName, workshopCode } = params;

  return dispatchPushNotification({
    type: 'APPRENTICE_LINKED',
    title: '🤝 New Apprentice Linked!',
    body: `${apprenticeName} has joined your atelier workshop using Code: ${workshopCode}.`,
    targetRole: 'master',
    senderName: apprenticeName,
    senderRole: 'Apprentice',
    metadata: {
      apprenticeName,
      workshopCode
    }
  });
}

/**
 * 7. Master unlocks Handshake for Certification
 * -> Apprentice receives push notification
 */
export async function notifyCertificateUnlocked(params: {
  apprenticeName: string;
  masterName: string;
}) {
  const { apprenticeName, masterName } = params;

  return dispatchPushNotification({
    type: 'CERTIFICATE_UNLOCKED',
    title: '🎓 Master Handshake Unlocked!',
    body: `Master ${masterName} has officially unlocked your Atelier Master Certification!`,
    targetRole: 'apprentice',
    targetUserName: apprenticeName,
    senderName: masterName,
    senderRole: 'Master',
    metadata: {
      apprenticeName
    }
  });
}

/**
 * Quick Test Notification utility
 */
export async function sendTestPushNotification(role: 'master' | 'apprentice' = 'master') {
  if (role === 'master') {
    return dispatchPushNotification({
      type: 'TASK_SUBMITTED',
      title: '🔔 Test Notification: Master Alert',
      body: 'Push notifications are active! You will receive live alerts when apprentices take measurements, submit tasks, or advance orders.',
      targetRole: 'master',
      senderName: 'TailorPro System',
      senderRole: 'System'
    });
  } else {
    return dispatchPushNotification({
      type: 'TASK_ASSIGNED',
      title: '🔔 Test Notification: Apprentice Alert',
      body: 'Push notifications are active! You will receive instant phone notifications when your Master assigns duties or passes your tasks.',
      targetRole: 'apprentice',
      senderName: 'Master Trainer',
      senderRole: 'Master'
    });
  }
}
