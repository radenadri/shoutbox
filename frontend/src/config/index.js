import Echo from "laravel-echo";
import Pusher from "pusher-js";

export const BASE_URL = "https://shoutbox.test";
export const API_URL = `${BASE_URL}/api`;

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
});

// Debug: Monitor connection status
echo.connector.pusher.connection.bind("connected", () => {
    console.log("✅ WebSocket connected!");
});

echo.connector.pusher.connection.bind("disconnected", () => {
    console.log("❌ WebSocket disconnected!");
});

echo.connector.pusher.connection.bind("error", (err) => {
    console.error("❌ WebSocket error:", err);
});
