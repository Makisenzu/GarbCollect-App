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

const echoConfig = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
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

window.Echo = new Echo(echoConfig);