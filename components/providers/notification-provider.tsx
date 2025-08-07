"use client";

import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useInterval } from "react-use"; // A handy hook from a library

// Install with: npm install react-use @types/react-use

export function NotificationProvider() {
    const { data: session } = useSession();
    const { showNotification } = useBrowserNotifications();
    const [lastChecked, setLastChecked] = useState(new Date());

    // Poll for new notifications every 30 seconds
    useInterval(async () => {
        if (session?.user?.id) {
            // Fetch only notifications created since the last check
            const response = await fetch(`/api/notifications/new?since=${lastChecked.toISOString()}`);
            if (response.ok) {
                const newNotifications = await response.json();
                if (newNotifications.length > 0) {
                    newNotifications.forEach((notif: any) => {
                        showNotification(notif.title, {
                            body: notif.message,
                            sound: true, // Play the sound
                            icon: '/favicon.ico' // Use your site's favicon
                        });
                    });
                }
                // Update the timestamp for the next poll
                setLastChecked(new Date());
            }
        }
    }, 30000); // 30 seconds

    return null; // This component doesn't render anything itself
}