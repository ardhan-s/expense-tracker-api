import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Requirements (Ambil token dari header Authorization (format: "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    // Kalau Tidak Ada Token
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        // Verifikasi keaslian dan masa berlaku token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Simpan payload user ke objek request untuk digunakan di controller berikutnya
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};