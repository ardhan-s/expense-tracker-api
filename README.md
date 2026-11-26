# Expense Tracker API

Expense Tracker API adalah sebuah RESTful API untuk pencatatan pemasukan dan pengeluaran pribadi. Project ini dibuat untuk memenuhi penugasan Backend OmahTI.

## URL Deployment

`https://expense-tracker-api-ardhan5.vercel.app`

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Security & Auth:** JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `express-rate-limit`, `cors`
- **Deployment:** Vercel
- **API Testing & Documentation:** Postman

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

Untuk endpoint dengan status **Auth: Ya**, sertakan header:
`Authorization: Bearer <token_jwt>` (pada Postman Collection menggunakan variabel `{{json_web_token_02sl}}`).

### 1. Authentication & User

Request Name | Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :--- | :---: |
| **Register** | `POST` | `/api/auth/register` | Registrasi pengguna baru | Tidak |
| **Login** | `POST` | `/api/auth/login` | Login & mendapatkan token JWT | Tidak |
| **Profile** | `GET` | `/api/auth/profile` | Melihat profil pengguna | Ya |
| **Budget** | `PATCH` | `/api/auth/budget` | Mengatur batas `monthly_budget` | Ya |

**1. Register (`POST /api/auth/register`)**
- **Request Body:**
  ```json
  {
    "name": "Amogus Skibidi",
    "email": "testing123@mail.com",
    "password": "112123"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Registrasi berhasil",
    "user": {
      "id": 1,
      "name": "Amogus Skibidi",
      "email": "testing123@mail.com"
    }
  }
  ```

**2. Login (`POST /api/auth/login`)**
- **Request Body:**
  ```json
  {
    "email": "testing123@mail.com",
    "password": "112123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

**3. Profile (`GET /api/auth/profile`)**
- **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "name": "Amogus Skibidi",
    "email": "testing123@mail.com",
    "monthly_budget": "1500000.00"
  }
  ```

**4. Budget (`PATCH /api/auth/budget`)**
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

| Request Name | Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :--- | :---: |
| **Add Transaction** | `POST` | `/api/transactions` | Tambah transaksi (income / expense) & hitung sisa budget | Ya |
| **Get Transaction** | `GET` | `/api/transactions` | List semua transaksi | Ya |
| **Get Summary** | `GET` | `/api/transactions/summary` | Ringkasan pemasukan, pengeluaran, saldo & sisa budget | Ya |
| **Modify Transaction** | `PUT` | `/api/transactions/:id` | Perbarui transaksi berdasarkan ID | Ya |
| **Delete Transaction** | `DELETE` | `/api/transactions/:id` | Hapus transaksi berdasarkan ID | Ya |

**1. Add Transaction (`POST /api/transactions`)**
- **Request Body:**
  ```json
  {
    "title": "Nasi Ayam Pak Sip",
    "amount": 20000,
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
      "id": 7,
      "title": "Nasi Ayam Pak Sip",
      "amount": "20000.00",
      "type": "expense",
      "category": "Makanan",
      "date": "2026-11-26"
    },
    "remaining_budget": 1480000
  }
  ```

**2. Get Transaction (`GET /api/transactions`)**
- **Response (`200 OK`):**
  ```json
  {
    "transactions": [
      {
        "id": 7,
        "title": "Nasi Ayam Pak Sip",
        "amount": "20000.00",
        "type": "expense",
        "category": "Makanan",
        "date": "2026-11-26"
      }
    ]
  }
  ```

**3. Get Summary (`GET /api/transactions/summary`)**
- **Response (`200 OK`):**
  ```json
  {
    "total_income": 50000,
    "total_expense": 20000,
    "balance": 30000,
    "budget": {
      "monthly_budget": 1500000,
      "spent_this_month": 20000,
      "remaining_budget": 1480000
    }
  }
  ```

**4. Modify Transaction (`PUT /api/transactions/7`)**
- **Request Body:**
  ```json
  {
    "title": "Nasi Ayam Pak Sip",
    "amount": 13000,
    "type": "expense",
    "category": "Makanan",
    "date": "2026-11-25"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Transaksi berhasil diperbarui",
    "remaining_budget": 1487000
  }
  ```

**5. Delete Transaction (`DELETE /api/transactions/4`)**
- **Response (`200 OK`):**
  ```json
  {
    "message": "Transaksi berhasil dihapus",
    "remaining_budget": 1500000
  }
  ```