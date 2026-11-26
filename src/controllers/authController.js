import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req , res) => {
    // Validasi User Input
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        return res.status(400).json({ message: 'Semua field wajib diisi.' }); 
    }

    try { 
        // Validasi Email Terdaftar/Tidak
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Input Ke Database
        const newUser = await pool.query (
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );
        
        // Status Kalau Berhasil
        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal melakukan registrasi.' });
    }
}

export const login = async (req, res) => {
    // Validasi User Input
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: 'Semua field wajib diisi.' }); 
    }

    try {
        // Validasi akun dengan email yang dimasukkan
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // Kalau tidak ada akun dengan email yang dimasukkan 
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah.' })
        }

        // Validasi password yang dimasukkan apakah sama dengan password yang terdaftar di DB
        const isMatch = await bcrypt.compare(password, user.password);

        // Kalau password yang dimasukkan tidak sama
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' })
        }

        // Semisal email dan password sesuai, maka user akan mendapatkan token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Status kalau berhasil
        res.status(200).json({ message: 'Login berhasil!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal melakukan login.' });
    }
};

export const getProfile = async (req, res) => {
    try {
        // Cari data user di DB
        const result = await pool.query('SELECT id, name, email, monthly_budget, created_at FROM users WHERE id = $1', [req.user.id]);

        // Kalau tidak ditemukan user tersebut
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profil tidak ditemukan.' });
        }   

        // Kalau berhasil akan mengirimkan data user
        res.status(200).json({ 
            user: { ...result.rows[0], monthly_budget: Number(result.rows[0].monthly_budget) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil profil.' });
    }
};

export const updateBudget = async (req, res) => {
    // Requirements
    const userId = req.user.id;
    const { monthly_budget } = req.body;

    // Validasi User Input
    if (monthly_budget === undefined || typeof monthly_budget !== 'number' || Number.isNaN(monthly_budget) || monthly_budget < 0) {
        return res.status(400).json({ message: 'Input harus berupa angka yang valid dan bukan negatif.' });
    }

    try {
        //Update ke DB
        const result = await pool.query('UPDATE users SET monthly_budget = $1 WHERE id = $2 RETURNING id, name, email, monthly_budget', [monthly_budget, userId]);

        // Kalau tidak ditemukan user tersebut
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }
        
        // Kalau berhasil akan budget user
        res.status(200).json({
            message: 'Budget berhasil diupdate.',
            user: { ...result.rows[0], monthly_budget: Number(result.rows[0].monthly_budget) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal update budget.' });
    }
};