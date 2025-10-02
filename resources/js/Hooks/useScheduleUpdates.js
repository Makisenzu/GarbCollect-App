import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function useScheduleUpdates() {
    const { props } = usePage();
    const [schedules, setSchedules] = useState(props.schedules || []);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const driverId = props.auth?.user?.driver?.id;

        if (!driverId) {
            console.log('No driver ID found');
            return;
        }

        if (!window.Echo) {
            console.log('Echo not available');
            return;
        }

        console.log('Setting up real-time listener for driver:', driverId);

        try {
            window.Echo.private(`driver.${driverId}`)
                .listen('.new.schedule', (e) => {
                    console.log('New schedule event received:', e);
                    setSchedules(prev => [e.schedule, ...prev]);
                    setNotification({
                        type: 'success',
                        title: 'New Schedule Assigned',
                        message: e.message,
                        schedule: e.schedule
                    });

                    setTimeout(() => {
                        setNotification(null);
                    }, 5000);
                });

            console.log('Successfully subscribed to channel:', `driver.${driverId}`);
        } catch (error) {
            console.error('Error setting up Echo listener:', error);
        }

        return () => {
            if (window.Echo) {
                window.Echo.leave(`driver.${driverId}`);
                console.log('Left channel:', `driver.${driverId}`);
            }
        };
    }, [props.auth?.user?.driver?.id]);

    return { schedules, notification, setNotification };
}