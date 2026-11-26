import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, updateBudget } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // Dikasih limit 15 menit kalau gagal login 5 kali
    max: 5,
    message: { message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// Endpoint Register
router.post('/register', register);

// Endpoint Login
router.post('/login', loginLimit, login);

// Endpoint Get Profile
router.get('/profile', verifyToken, getProfile);

// Endpoint Monthly Budget
router.patch('/budget', verifyToken, updateBudget)

export default router;