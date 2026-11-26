# Expense Tracker API

Expense Tracker API adalah API untuk pencatatan pemasukan dan pengeluaran pribadi

---

## Tech Stack
- **Runtime & Framework:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication & Security:** jsonwebtoken (JWT), bcrypt, helmet, express-rate-limit, cors
- **Deployment:** Vercel

---

## Fitur-Fitur Utama
1. **User Authentication:** Registrasi akun baru dengan hashing password (bcrypt), login dengan token JWT, dan proteksi endpoint menggunakan middleware autentikasi (verifyToken (JWT)).
2. **Basic Security:** Proteksi HTTP headers (`helmet`), pengaturan izin dari server atau domain yang berbeda (`cors`), penggunaan *parameterized queries* untuk mencegah SQL Injection, serta pembatasan percobaan login (`express-rate-limit`).
3. **Manajemen Transaksi (CRUD):** Tambah transaksi, lihat semua daftar transaksi (dengan filter tipe `income`/`expense` dan pengurutan terbaru), lihat ringkasan semua transaksi, perbarui atau modifikasi transaksi, dan hapus transaksi milik pengguna.
4. **Ringkasan Keuangan & Pelacakan Budget Bulanan:**
   - Pengguna dapat menetapkan target batas pengeluaran bulanan (`monthly_budget`).
   - Setiap kali transaksi ditambahkan, diperbarui, atau dihapus, API otomatis menghitung ulang total pengeluaran bulan berjalan dan sisa anggaran yang tersedia (`remaining_budget`).
   - Endpoint ringkasan menampilkan total pemasukan, total pengeluaran, saldo bersih (`balance`), serta status anggaran bulanan secara bersamaan.