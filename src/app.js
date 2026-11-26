import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Endpoint pertama untuk check
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Expense Tracker API',
    });
});

// Routes Utama
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Ketika Endpoint tidak terdaftar
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

// Handle Error Global (Middleware)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Terjadi kesalahan internal pada server.',
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});