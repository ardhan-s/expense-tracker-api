import pool from '../config/db.js';

// Helper internal untuk menghitung sisa budget bulanan user
const getRemainingMonthlyBudget = async (userId) => {
    // Ambil monthly_budget dari tabel users
    const userResult = await pool.query( 'SELECT monthly_budget FROM users WHERE id = $1', [userId]);
    const monthlyBudget = Number(userResult.rows[0]?.monthly_budget || 0);

    // Hitung total pengeluaran khusus
    const expenseResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS spent_this_month FROM transactions WHERE user_id = $1 AND type = 'expense' AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)`, [userId]);
    const spentThisMonth = Number(expenseResult.rows[0].spent_this_month);

    // Return ringkasan sisa budget (Semisal budgetnya belum diatur atau 0, sisa budget akan bernilai null)
    return {
        monthly_budget: monthlyBudget,
        spent_this_month: spentThisMonth,
        remaining_budget: monthlyBudget > 0 ? monthlyBudget - spentThisMonth : null,
    };
};

export const createTransaction = async (req, res) => {
    // Requirements
    const { title, amount, type, category, date } = req.body;
    const userId = req.user.id;

    // Validasi User Input
    if (!title || !amount || !type || !category || !date) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    // Validasi Tipe Transaksi (HARUS INCOME/EXPENSE!!!)
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Tipe transaksi harus 'income' atau 'expense'." }); //validasi, harus income atau expense
    }

    try {
        // Input Ke Database
        const result = await pool.query(
            `INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, title, amount, type, category, date]
        ); 
        
        // Hitung sisa budget setelah transaksi ditambahkan
        const budgetInfo = await getRemainingMonthlyBudget(userId);

        // Status Kalau Berhasil
        res.status(201).json({ 
            message: 'Transaksi berhasil ditambahkan.',
            data: result.rows[0],
            budget: budgetInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambahkan transaksi.' });
    }
};

export const getTransactions = async (req, res) => {
    // Requirements
    const userId = req.user.id; 
    const { type } = req.query;

    try {
        // Query untuk mengambil seluruh transaksi milik user
        let query = 'SELECT * FROM transactions WHERE user_id = $1';
        const params = [userId];

        // Kasih filter tipe transaksi
        if (type && ['income', 'expense'].includes(type)) {
            query += ' AND type = $2';
            params.push(type);
        }

        // Urutkan hasil dari tanggal terbaru dan ID terbesar
        query += ' ORDER BY date DESC, id DESC';

        // Eksekusi query ke database
        const result = await pool.query(query, params);

        // Kirim Detail Transaksi
        res.status(200).json({
            total: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data transaksi.' });
    }
}

export const getSummary = async (req, res) => {
    // Requirements
    const userId = req.user.id;

    try {
        // Hitung total pemasukan dan pengeluaran user (semisal hasilnya NULL, maka diubah menjadi 0 jika belum ada transaksi)
        const result = await pool.query(
            `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income, COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense FROM transactions WHERE user_id = $1`, [userId]
        );

        // Konversi hasil dari string PostgreSQL menjadi angka desimal 
        const totalIncome = parseFloat(result.rows[0].total_income);
        const totalExpense = parseFloat(result.rows[0].total_expense);

        // Sisa Budget
        const budgetInfo = await getRemainingMonthlyBudget(userId);

        // Kirim Detail Ringkasan
        res.status(200).json({
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: totalIncome - totalExpense,
            budget: budgetInfo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghitung ringkasan keuangan.' });
    }
};

export const updateTransaction = async (req, res) => {
    // Requirements
    const { id } = req.params;
    const { title, amount, type, category, date } = req.body;
    const userId = req.user.id;

    // Validasi Input User
    if (!title || !amount || !type || !category || !date) {
        return res.status(400).json({ message:  'Semua field wajib diisi.' });
    }

    // Validasi Tipe Transaksi
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Tipe transaksi harus 'income' atau 'expense'." });
    }

    try {
        // Update Transaksi di DB
        const result = await pool.query(
            `UPDATE transactions SET title = $1, amount = $2, type = $3, category = $4, date = $5 WHERE id = $6 AND user_id = $7 RETURNING *`, [title, amount, type, category, date, id, userId]
        );

        // Semisal tidak ditemukan transaksinya
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        // Hitung sisa budget terbaru
        const budgetInfo = await getRemainingMonthlyBudget(userId);

        // Kirim Respond Transaksi Berhasil di Update
        res.status(200).json({
            message: 'Transaksi berhasil diperbarui.',
            data: result.rows[0],
            budget: budgetInfo
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui transaksi.' });
    }
}

export const deleteTransaction = async (req, res) => {
    // Requirements
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Delete Transaksi
        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        // Semisal tidak ditemukan transaksinya
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
        }

        // Hitung sisa budget terbaru
        const budgetInfo = await getRemainingMonthlyBudget(userId);

        // Kirim Respon Transaksi Berhasil Dihapus
        res.status(200).json({ 
            message: 'Transaksi berhasil dihapus.',
            budget: budgetInfo 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus transaksi.' });
    }
}