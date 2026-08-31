# Digital Twin Ceres — Local Setup Guide

## Prasyarat

- Node.js v20+
- npm
- Akun Snowflake dengan akses ke database `CERES_DIGITAL_TWIN`

## 1. Install Dependencies

```bash
# Frontend
cd digital_twin/app
npm install

# Backend
cd server
npm install
npm install dotenv
```

## 2. Konfigurasi Environment

Buat file `.env` di folder `server/`:

```bash
cd digital_twin/app/server
cp ../.env.example .env
```

Edit `.env` dan isi kredensial Snowflake:

```
SNOWFLAKE_ACCOUNT=KYNEVIM-FI81201
SNOWFLAKE_USER=FAUZANAG
SNOWFLAKE_PASSWORD=password_kamu
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=CERES_DIGITAL_TWIN
SNOWFLAKE_SCHEMA=DIGITAL_TWIN_ANALYTICS
SNOWFLAKE_ROLE=
```

> **Penting**: Isi `SNOWFLAKE_ACCOUNT` tanpa `.snowflakecomputing.com`.
> Contoh: `KYNEVIM-FI81201` (benar), `KYNEVIM-FI81201.snowflakecomputing.com` (salah).

### (Opsional) Key-Pair Authentication

Jika menggunakan key-pair auth, isi variabel berikut **sebagai pengganti** `SNOWFLAKE_PASSWORD`:

```
SNOWFLAKE_PRIVATE_KEY_PATH=./rsa_key.p8
SNOWFLAKE_PRIVATE_KEY_PASS=
```

## 3. Jalankan Backend (Terminal 1)

```bash
cd digital_twin/app/server
node -r dotenv/config index.js
```

Backend berjalan di **port 3000**. Verifikasi dengan membuka:

- `http://localhost:3000/api/health` — harus return `{"status":"ok"}`
- `http://localhost:3000/api/config` — harus return JSON konfigurasi dari Snowflake

## 4. Jalankan Frontend (Terminal 2)

```bash
cd digital_twin/app
npm run dev
```

Frontend berjalan di **port 5173**.

## 5. Buka Browser

```
http://localhost:5173
```

## Catatan

### Auto-detect Environment

Kode backend (`server/index.js`) otomatis mendeteksi environment:

| Environment | Auth Method          | Cara Deteksi                              |
| ----------- | -------------------- | ----------------------------------------- |
| SPCS        | OAuth token otomatis | File `/snowflake/session/token` ditemukan  |
| Local       | Username/password    | File `/snowflake/session/token` tidak ada  |

Tidak perlu mengubah kode saat deploy ke SPCS — deteksi berjalan otomatis.

### Troubleshooting

| Masalah | Solusi |
| ------- | ------ |
| `SNOWFLAKE_ACCOUNT env var is required for local mode` | Pastikan `.env` ada di folder `server/`, bukan di folder `app/` |
| `Cannot GET /` di port 3000 | Normal — backend hanya melayani `/api/config` dan `/api/health` |
| `HTTP 500` di frontend | Cek log error di terminal backend, biasanya masalah kredensial |
| `Incorrect username or password` | Cek ulang `SNOWFLAKE_USER` dan `SNOWFLAKE_PASSWORD` di `.env` |
| Koneksi timeout | Pastikan format `SNOWFLAKE_ACCOUNT` benar (tanpa `.snowflakecomputing.com`) |

### GitHub Codespace

Semua langkah di atas berlaku untuk GitHub Codespace. Saat Codespace membuka port, gunakan URL yang di-generate (contoh: `https://<name>-5173.app.github.dev`) untuk mengakses frontend.
