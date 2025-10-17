# 💬 Shoutbox

A simple real-time shoutbox application built with:
- **Backend**: Laravel 12 (REST API)
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL
- **Real-time**: Laravel Reverb (WebSocket)

---

## Prerequisites

- PHP ≥ 8.2, Composer
- Node.js ≥ 18, pnpm or npm
- PostgreSQL
- Git

---

## Installation & Setup

### 1. Clone & Setup Backend

```bash
git clone <your-repo> shoutbox
cd shoutbox
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Configure Database

Edit `.env` file:

```env
APP_NAME=Shoutbox
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=shoutbox
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Create database:

```sql
CREATE DATABASE shoutbox;
```

Run migrations:

```bash
php artisan migrate
```

### 3. Setup Frontend

```bash
cd frontend
pnpm install
# or: npm install
```

Configure API endpoint in `frontend/src/config/index.js`:

```js
export const BASE_URL = "http://localhost:8000";
export const API_URL = `${BASE_URL}/api`;
```

---

## Running the Application

### Basic Setup (Polling)

**Terminal 1 - Backend:**
```bash
php artisan serve
# Access: http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
# Access: http://localhost:5173
```

### Real-time Setup (WebSocket)

**Terminal 1 - Backend:**
```bash
php artisan serve
```

**Terminal 2 - Reverb Server:**
```bash
php artisan reverb:start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
pnpm dev
```

Open `http://localhost:5173` in your browser.

---

## Features

### Phase 1: Basic Implementation (Polling)
- ✅ Send and receive messages
- ✅ Auto-refresh every 5 seconds
- ✅ Username persistence (localStorage)
- ✅ Input validation
- ✅ Auto-scroll to latest message

### Phase 2: Real-time (WebSocket)
- ✅ Instant message updates via Laravel Reverb
- ✅ No polling required
- ✅ Multi-tab synchronization

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get all messages |
| POST | `/api/messages` | Create new message |

### Request Example

```bash
# Get messages
curl http://localhost:8000/api/messages

# Send message
curl -X POST http://localhost:8000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","content":"Hello!"}'
```

---

## Real-time Implementation (Laravel Reverb)

### Backend Setup

1. **Install Laravel Reverb:**

```bash
composer require laravel/reverb:@beta
php artisan reverb:install
```

2. **Configure `.env`:**

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

3. **Create Broadcast Event:**

```bash
php artisan make:event MessageCreated
```

### Frontend Setup

1. **Install Dependencies:**

```bash
cd frontend
pnpm add laravel-echo pusher-js
```

2. **Create `.env` file:**

```env
VITE_REVERB_APP_KEY=my-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

---

## Project Structure

```
shoutbox/
├── app/
│   ├── Http/Controllers/MessageController.php
│   ├── Models/Message.php
│   └── Events/MessageCreated.php
├── database/migrations/
│   └── 2025_10_10_170921_create_messages_table.php
├── routes/api.php
├── frontend/
│   ├── src/
│   │   ├── components/shoutbox.jsx
│   │   ├── config/
│   │   │   ├── index.js
│   │   │   └── echo.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── .env
└── .env
```

---

## Troubleshooting

### Database Issues
- Check `.env` configuration (host, port, username, password, database name)
- Ensure PostgreSQL service is running
- Re-run migrations: `php artisan migrate:fresh`

### CORS Issues
- Ensure `http://localhost:5173` is allowed in backend CORS configuration
- Check Laravel CORS middleware is enabled

### Frontend Connection Issues
- Verify `frontend/src/config/index.js` has correct `BASE_URL`
- Check browser console and Network tab for errors
- Ensure backend is running at `http://localhost:8000`

### Reverb/WebSocket Issues
- **Connection refused**: Ensure Reverb server is running on port 8080
- **Event not received**: Check channel and event names match exactly
- **Reverb crashes**: Restart with debug mode: `php artisan reverb:start --debug`

---

## Next Steps (Optional)

- [x] Real-time via WebSocket (Laravel Reverb)
- [ ] Rate limiting for anti-spam
- [ ] Delete/Edit own messages
- [ ] Authentication (Laravel Sanctum)
- [ ] Pagination & infinite scroll
- [ ] Emoji picker, file attachments

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
