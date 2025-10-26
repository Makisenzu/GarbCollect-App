import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// console.log('Reverb Config:', {
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     host: import.meta.env.VITE_REVERB_HOST,
//     port: import.meta.env.VITE_REVERB_PORT
// });

const getCsrfToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
};

const csrfToken = getCsrfToken();

// console.log('CSRF Token available:', !!csrfToken);

// const echoConfig = {
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: window.location.hostname,
//     wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
//     wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
//     forceTLS: false,
//     enabledTransports: ['ws', 'wss'],
// };

const echoConfig = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
};
if (csrfToken) {
    echoConfig.auth = {
        headers: {
            'X-CSRF-TOKEN': csrfToken,
        },
    };
} else {
    // console.warn('CSRF token not found. Private channels may not work.');
}


let echoInstance = null;

export const initEcho = () => {
    if (typeof window !== 'undefined' && !echoInstance) {
        echoInstance = new Echo(echoConfig);
    }
    return echoInstance;
};

export const getEcho = () => {
    return echoInstance;
};

window.Echo = new Echo(echoConfig);