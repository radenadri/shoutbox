# 💬 Tutorial Step-by-Step: Shoutbox (Laravel API + React)

Shoutbox sederhana dengan:
- Backend: Laravel 12 (REST API)
- Frontend: React + Vite + Tailwind
- Database: PostgreSQL
- Refresh: polling 5 detik

---

# Fase 1: Implementasi Dasar (Polling)

## 1) Prasyarat

- PHP ≥ 8.2, Composer
- Node.js ≥ 18, pnpm atau npm
- PostgreSQL
- Git

---

## 2) Clone & Setup Backend (Laravel)

```bash
git clone <repo-anda> shoutbox
cd shoutbox
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` (contoh untuk PostgreSQL):
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

Buat database:
```sql
CREATE DATABASE shoutbox;
```

Jalankan migrasi:
```bash
php artisan migrate
```

Jalankan server:
```bash
php artisan serve
# Akses: http://localhost:8000
```

---

## 3) Skema, Model, Controller, Routes

- Migration: `database/migrations/2025_10_10_170921_create_messages_table.php`
  - Kolom: `id`, `username`, `content`, `timestamps`

- Model: `app/Models/Message.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['username', 'content'];
}
```

- Controller: `app/Http/Controllers/MessageController.php`
  - `index()` -> return semua pesan (terlama dulu)
  - `store()` -> validasi, simpan, return 201
```php
<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index()
    {
        return [
            'success' => true,
            'data' => Message::oldest()->get(),
        ];
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:20',
            'content' => 'required|string|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = Message::create([
            'username' => $request->username,
            'content' => $request->content,
        ]);

        return response()->json([
            'success' => true,
            'data' => $message,
        ], 201);
    }
}
```

- Routes API: `routes/api.php`
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;

Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);
```

Uji cepat API:
```bash
curl http://localhost:8000/api/messages
curl -X POST http://localhost:8000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","content":"Halo!"}'
```

---

## 4) Setup Frontend (React + Vite)

Masuk ke folder frontend:
```bash
cd frontend
pnpm install
# atau: npm install
```

Set konfigurasi endpoint: `frontend/src/config/index.js`
```js
// Saat lokal:
export const BASE_URL = "http://localhost:8000";
export const API_URL = `${BASE_URL}/api`;
```
Catatan: Di repo saat ini di-set ke `"https://shoutbox.test"`. Ganti ke `http://localhost:8000` untuk dev lokal.

Jalankan frontend:
```bash
pnpm dev
# atau: npm run dev
# Akses: http://localhost:5173
```

---

## 5) Komponen Shoutbox (Frontend)

- File: `frontend/src/components/shoutbox.jsx`
- Fitur:
  - Ambil pesan (`GET /api/messages`)
  - Kirim pesan (`POST /api/messages`)
  - Simpan `username` di `localStorage`
  - Auto-refresh tiap 5 detik, auto-scroll ke pesan terbaru

Potongan inti:
```jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export default function Shoutbox() {
  const messageEndsRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => { fetchMessages(); }, []);
  useEffect(() => { localStorage.setItem("username", username); }, [username]);
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    const { data: { data } } = await axios.get(`${API_URL}/messages`);
    setMessages(data);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const { data: { data } } = await axios.post(`${API_URL}/messages`, { username, content });
      setContent("");
      setMessages([...messages, data]);
      setTimeout(() => messageEndsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) {
      setErrors(error.response?.data?.errors || []);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 border rounded">
      <h1 className="text-xl font-bold mb-4 text-center">💬 Shoutbox</h1>
      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-slate-50 rounded">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2 flex flex-col gap-1">
            <strong>{msg.username}</strong>
            <div>{msg.content}</div>
            <span className="text-xs text-slate-400">
              {new Date(msg.created_at).toLocaleTimeString("en-US", { hour12: false }).slice(0, 5)}
            </span>
          </div>
        ))}
        <div ref={messageEndsRef} />
      </div>

      <form onSubmit={sendMessage} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        {errors.username && <div className="text-red-500">{errors.username}</div>}

        <textarea
          value={content}
          rows={3}
          placeholder="Wow, this is amazing..."
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        {errors.content && <div className="text-red-500">{errors.content}</div>}

        <button className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  );
}
```

- Entry app:
  - `frontend/src/App.jsx` -> render `Shoutbox`
  - `frontend/src/main.jsx` -> mount ke `#root`
  - `frontend/index.html` -> container root

---

## 6) Menjalankan Bersamaan

- Terminal 1 (Backend):
```bash
php artisan serve
# http://localhost:8000
```

- Terminal 2 (Frontend):
```bash
cd frontend
pnpm dev
# http://localhost:5173
```

Buka `http://localhost:5173`, isi username, kirim pesan, cek daftar pesan tampil dan refresh tiap 5 detik.

---

## 7) CORS (Jika Perlu)

Jika frontend (5173) berbeda origin dengan backend (8000) dan terjadi CORS error:
- Pastikan backend mengizinkan origin dev Vite Anda.
- Terapkan middleware CORS default Laravel (`HandleCors`) beserta konfigurasi yang sesuai. Jika file `config/cors.php` belum ada, tambahkan paket/config CORS sesuai dokumentasi Laravel.
- Alternatif: samakan origin (mis. serve frontend lewat proxy yang sama).

---

## 8) Struktur Proyek

```
shoutbox/
├── app/
│   ├── Http/Controllers/MessageController.php
│   └── Models/Message.php
├── database/migrations/2025_10_10_170921_create_messages_table.php
├── routes/api.php
├── frontend/
│   ├── src/
│   │   ├── components/shoutbox.jsx
│   │   ├── config/index.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
└── .env
```

---

## 9) Troubleshooting

- Database:
  - Cek `.env` (DB host, port, user, pass, nama DB)
  - Pastikan service PostgreSQL aktif
  - Jalankan `php artisan migrate` ulang bila perlu

- CORS:
  - Pastikan origin `http://localhost:5173` diizinkan

- Frontend tidak bisa fetch:
  - Periksa `frontend/src/config/index.js` (BASE_URL)
  - Cek console browser dan Network tab
  - Pastikan backend berjalan di `http://localhost:8000`

---

# Fase 2: Real-time via WebSocket (Laravel Reverb)

### Implementasi Real-time dengan Laravel Reverb

Implementasi real-time menggunakan **Laravel Reverb**, solusi WebSocket native Laravel yang blazing fast dan mudah dikonfigurasi.

#### Backend (Laravel)

1) **Install Laravel Reverb:**

   ```bash
   composer require laravel/reverb:@beta
   php artisan reverb:install
   ```

2) **Konfigurasi `.env`:**

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

3) **Buat Event Broadcast:**

   ```bash
   php artisan make:event MessageCreated
   ```

   Edit `app/Events/MessageCreated.php`:

   ```php
   <?php
   
   namespace App\Events;
   
   use App\Models\Message;
   use Illuminate\Broadcasting\Channel;
   use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
   use Illuminate\Foundation\Events\Dispatchable;
   use Illuminate\Queue\SerializesModels;
   
   class MessageCreated implements ShouldBroadcast
   {
       use Dispatchable, SerializesModels;
   
       public function __construct(public Message $message) {}
   
       public function broadcastOn(): Channel
       {
           return new Channel('shoutbox');
       }
   
       public function broadcastAs(): string
       {
           return 'MessageCreated';
       }
   
       public function broadcastWith(): array
       {
           return [
               'id' => $this->message->id,
               'username' => $this->message->username,
               'content' => $this->message->content,
               'created_at' => $this->message->created_at,
           ];
       }
   }
   ```

4) **Trigger Event di Controller:**

   Edit `app/Http/Controllers/MessageController.php`, tambahkan di method `store()`:

   ```php
   use App\Events\MessageCreated;
   
   // Setelah $message dibuat
   event(new MessageCreated($message));
   
   return response()->json([
       'success' => true,
       'data' => $message,
   ], 201);
   ```

5) **Jalankan Reverb Server:**

   ```bash
   php artisan reverb:start
   ```

   Server WebSocket akan berjalan di `http://localhost:8080`

#### Frontend (React)

1) **Install Dependencies:**

   ```bash
   cd frontend
   pnpm add laravel-echo pusher-js
   ```

2) **Buat Config Echo (`frontend/src/config/echo.js`):**

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

3) **Tambah `.env` di Frontend:**

   Buat `frontend/.env`:

   ```env
   VITE_REVERB_APP_KEY=my-app-key
   VITE_REVERB_HOST=localhost
   VITE_REVERB_PORT=8080
   VITE_REVERB_SCHEME=http
   ```

4) **Subscribe Channel di Komponen:**

   Edit `frontend/src/components/shoutbox.jsx`, tambahkan:

   ```jsx
   import { echo } from '../config/echo';
   
   // Tambahkan useEffect untuk subscribe
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

5) **Nonaktifkan Polling (Opsional):**

   Hapus atau comment interval polling:

   ```jsx
   // useEffect(() => {
   //     const interval = setInterval(fetchMessages, 5000);
   //     return () => clearInterval(interval);
   // }, []);
   ```

   Dan hapus duplikasi setelah POST:

   ```jsx
   const sendMessage = async (e) => {
       e.preventDefault();
       try {
           await axios.post(`${API_URL}/messages`, { username, content });
           setContent("");
           // Hapus: setMessages([...messages, data]);
           // Biarkan WebSocket yang update
       } catch (error) {
           setErrors(error.response?.data?.errors || []);
       }
   };
   ```

#### Testing

1) **Terminal 1 - Backend:**
   ```bash
   php artisan serve
   ```

2) **Terminal 2 - Reverb Server:**
   ```bash
   php artisan reverb:start
   ```

3) **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   pnpm dev
   ```

4) **Test Real-time:**
   - Buka 2 tab browser di `http://localhost:5173`
   - Kirim pesan dari tab pertama
   - Pesan akan muncul **instant** di tab kedua tanpa refresh!

#### Troubleshooting

- **Connection refused:** Pastikan Reverb server berjalan di port 8080
- **CORS error:** Reverb sudah handle CORS secara default
- **Event tidak terdengar:** Cek nama channel dan event name harus sama persis
- **Reverb crash:** Restart dengan `php artisan reverb:start --debug`

---

## 10) Next Steps (Optional)

- [x] Real-time via WebSocket (Pusher/Laravel Echo)
- [] Rate limiting untuk anti-spam
- [] Hapus/Edit pesan milik sendiri
- [] Authentication (Laravel Sanctum)
- [] Pagination & infinite scroll
- [] Emoji picker, attachment

## 11) Checklist Ringkas

- [x] `.env` sudah diisi dan `php artisan key:generate`
- [x] `php artisan migrate` sukses
- [x] Backend live di `http://localhost:8000`
- [x] `frontend/src/config/index.js` pakai `http://localhost:8000`
- [x] Frontend live di `http://localhost:5173`
- [x] Kirim pesan berhasil dan tampil
