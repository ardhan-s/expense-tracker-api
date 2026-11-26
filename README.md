# Expense Tracker API

Expense Tracker API adalah sebuah RESTful API untuk pencatatan pemasukan dan pengeluaran pribadi.

## URL Deployment

`https://expense-tracker-api-ardhan5.vercel.app`

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Security & Auth:** JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `express-rate-limit`, `cors`
- **Deployment:** Vercel

---

## Database Setup (PostgreSQL)

Jalankan query berikut pada SQL Editor PostgreSQL / Supabase:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    monthly_budget NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Instalasi Lokal

1. **Clone & Install Dependensi:**
   ```bash
   git clone [https://github.com/ardhan-s/expense-tracker-api.git](https://github.com/ardhan-s/expense-tracker-api.git)
   cd expense-tracker-api
   npm install
   ```

2. **Konfigurasi Environment (`.env`):**
   Salin `.env.example` menjadi `.env`, lalu isi variabel berikut:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@host:5432/database_name
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Jalankan Server:**
   ```bash
   npm start
   ```

---

## Dokumentasi API & Postman

File koleksi Postman siap pakai tersedia di root repositori: **`expense-tracker.postman_collection.json`**.  
Untuk endpoint dengan status **Auth: Ya**, sertakan header:
`Authorization: Bearer <token_jwt>`

### 1. Authentication & User

| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Registrasi pengguna baru | Tidak |
| `POST` | `/api/auth/login` | Login & mendapatkan token JWT | Tidak |
| `GET` | `/api/auth/profile` | Melihat profil & batas budget pengguna | Ya |
| `PATCH` | `/api/auth/budget` | Mengatur batas `monthly_budget` | Ya |

**`POST /api/auth/register`**
- **Request Body:**
  ```json
  {
    "name": "Alaniz",
    "email": "alaniz@mail.com",
    "password": "password123"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Registrasi berhasil",
    "user": {
      "id": 1,
      "name": "Alaniz",
      "email": "alaniz@mail.com"
    }
  }
  ```

**`POST /api/auth/login`**
- **Request Body:**
  ```json
  {
    "email": "alaniz@mail.com",
    "password": "password123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

**`GET /api/auth/profile`**
- **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "name": "Alaniz",
    "email": "alaniz@mail.com",
    "monthly_budget": "1500000.00"
  }
  ```

**`PATCH /api/auth/budget`**
- **Request Body:**
  ```json
  {
    "monthly_budget": 1500000
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Budget bulanan berhasil diperbarui",
    "monthly_budget": "1500000.00"
  }
  ```

---

### 2. Transactions & Summary

| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/transactions` | Tambah transaksi & hitung sisa budget | Ya |
| `GET` | `/api/transactions` | List transaksi (query opsional: `?type=income` / `?type=expense`) | Ya |
| `GET` | `/api/transactions/summary` | Ringkasan pemasukan, pengeluaran, saldo & sisa budget | Ya |
| `PUT` | `/api/transactions/:id` | Perbarui transaksi berdasarkan ID | Ya |
| `DELETE` | `/api/transactions/:id` | Hapus transaksi berdasarkan ID | Ya |

**`POST /api/transactions`**
- **Request Body:**
  ```json
  {
    "title": "Makan Siang",
    "amount": 25000,
    "type": "expense",
    "category": "Makanan",
    "date": "2026-11-26"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Transaksi berhasil ditambahkan",
    "transaction": {
      "id": 1,
      "title": "Makan Siang",
      "amount": "25000.00",
      "type": "expense",
      "category": "Makanan",
      "date": "2026-11-26"
    },
    "remaining_budget": 1475000
  }
  ```

**`GET /api/transactions`**
- **Response (`200 OK`):**
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "title": "Makan Siang",
        "amount": "25000.00",
        "type": "expense",
        "category": "Makanan",
        "date": "2026-11-26"
      }
    ]
  }
  ```

**`GET /api/transactions/summary`**
- **Response (`200 OK`):**
  ```json
  {
    "total_income": 50000,
    "total_expense": 25000,
    "balance": 25000,
    "budget": {
      "monthly_budget": 1500000,
      "spent_this_month": 25000,
      "remaining_budget": 1475000
    }
  }
  ```

**`PUT /api/transactions/:id`**
- **Request Body:**
  ```json
  {
    "title": "Makan Siang & Minum",
    "amount": 30000,
    "type": "expense",
    "category": "Makanan",
    "date": "2026-11-26"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Transaksi berhasil diperbarui",
    "remaining_budget": 1470000
  }
  ```

**`DELETE /api/transactions/:id`**
- **Response (`200 OK`):**
  ```json
  {
    "message": "Transaksi berhasil dihapus",
    "remaining_budget": 1500000
  }
  ```