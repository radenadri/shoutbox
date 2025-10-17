# 💬 Shoutbox Frontend

React + Vite frontend for the Shoutbox application with real-time messaging capabilities.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool with HMR
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Laravel Echo** - WebSocket client
- **Pusher JS** - WebSocket protocol

---

## Installation

```bash
pnpm install
# or: npm install
```

---

## Configuration

### 1. API Endpoint Configuration

Edit `src/config/index.js`:

```js
export const BASE_URL = "http://localhost:8000";
export const API_URL = `${BASE_URL}/api`;
```

**Note**: Change to your backend URL. Default is set to `https://shoutbox.test` in the repo.

### 2. WebSocket Configuration (Real-time)

Create `.env` file in the frontend directory:

```env
VITE_REVERB_APP_KEY=my-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

**Important**: These values must match your Laravel backend `.env` configuration.

---

## Running the Application

### Development Mode

```bash
pnpm dev
# or: npm run dev
```

Access at: `http://localhost:5173`

### Build for Production

```bash
pnpm build
# or: npm run build
```

### Preview Production Build

```bash
pnpm preview
# or: npm run preview
```

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── shoutbox.jsx       # Main shoutbox component
│   ├── config/
│   │   ├── index.js            # API endpoint config
│   │   └── echo.js             # Laravel Echo config
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
├── index.html
├── .env                        # Environment variables
└── package.json
```

---

## Features

### Shoutbox Component (`src/components/shoutbox.jsx`)

**Core Features:**
- Send and receive messages
- Username persistence (localStorage)
- Auto-scroll to latest message
- Input validation with error display
- Real-time updates via WebSocket

**Two Modes:**

1. **Polling Mode** (Phase 1):
   - Fetches messages every 5 seconds
   - Simple HTTP requests

2. **Real-time Mode** (Phase 2):
   - Instant updates via Laravel Reverb
   - No polling required
   - Multi-tab synchronization

---

## Real-time Implementation

### Install Dependencies

```bash
pnpm add laravel-echo pusher-js
```

### Echo Configuration (`src/config/echo.js`)

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Subscribe to Channel

```jsx
import { echo } from '../config/echo';

useEffect(() => {
    const channel = echo.channel('shoutbox')
        .listen('MessageCreated', (e) => {
            console.log('New message received:', e);
            setMessages((prev) => [...prev, e]);
            
            // Auto scroll
            setTimeout(() => {
                messageEndsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

    return () => {
        echo.leave('shoutbox');
    };
}, []);
```

---

## Troubleshooting

### API Connection Issues

**Problem**: Cannot fetch messages from backend

**Solutions**:
- Verify `src/config/index.js` has correct `BASE_URL`
- Ensure backend is running at the specified URL
- Check browser console for CORS errors
- Verify Network tab in DevTools

### WebSocket Connection Issues

**Problem**: Real-time updates not working

**Solutions**:
- Ensure `.env` file exists with correct Reverb credentials
- Verify Reverb server is running: `php artisan reverb:start`
- Check browser console for WebSocket connection errors
- Confirm channel and event names match backend

### Build Issues

**Problem**: Build fails or warnings

**Solutions**:
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for conflicting dependencies

---

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to React components will reflect immediately without full page reload.

### Styling with Tailwind

This project uses Tailwind CSS utility classes. Refer to [Tailwind documentation](https://tailwindcss.com/docs) for available classes.

### State Management

Currently uses React hooks (`useState`, `useEffect`). For larger applications, consider:
- React Context API
- Zustand
- Redux Toolkit

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_REVERB_APP_KEY` | Reverb application key | - |
| `VITE_REVERB_HOST` | Reverb server host | `localhost` |
| `VITE_REVERB_PORT` | Reverb server port | `8080` |
| `VITE_REVERB_SCHEME` | Protocol (http/https) | `http` |

---

## Contributing

When contributing to the frontend:

1. Follow existing code style
2. Use functional components with hooks
3. Keep components small and focused
4. Add comments for complex logic
5. Test in multiple browsers

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
