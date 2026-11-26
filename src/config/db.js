import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();    

const { Pool, types } = pkg;

// Pertahankan tipe DATE PostgreSQL (OID 1082) biar tidak bergeser oleh timezone
types.setTypeParser(1082, (val) => val);

// Inisialisasi connection pool ke Supabase (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Berhasil Tersambung Ke DB
pool.on('connect', () => {
    console.log('Connected to Supabase Postgres');
});

// Error Tersambung Ke DB
pool.on('error', (err) => {
    console.log('Unexpected Postgres error:', err);
    process.exit(-1);
});

export default pool;