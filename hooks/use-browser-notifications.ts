"use client";

import { useState, useEffect, useCallback } from 'react';

// Path to your notification sound file in the /public directory
const NOTIFICATION_SOUND_PATH = '/notification.mp3'; 

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Set initial permission state
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  const showNotification = useCallback((title: string, options: NotificationOptions & { sound?: boolean }) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, options);
    
    if (options.sound) {
        const audio = new Audio(NOTIFICATION_SOUND_PATH);
        audio.play().catch(e => console.error("Error playing sound:", e));
    }

    // Optional: Auto-close notification after a few seconds
    setTimeout(() => notification.close(), 5000);

  }, [permission]);

  return { permission, requestPermission, showNotification };
}