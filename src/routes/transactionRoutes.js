import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { createTransaction,getTransactions, getSummary, updateTransaction, deleteTransaction,} from '../controllers/transactionController.js';

const router = express.Router();

// Terapkan middleware auth JWT untuk seluruh endpoint transaksi
router.use(verifyToken);

// Endpoint Create Transaksi
router.post('/', createTransaction);

// Endpoint Get Info Transaksi
router.get('/', getTransactions);

// Endpoint Get Ringkasan Transaksi
router.get('/summary', getSummary);

// Endpoint Update Transaksi
router.put('/:id', updateTransaction);

// Endpoint Delete Transaksi
router.delete('/:id', deleteTransaction);

export default router;