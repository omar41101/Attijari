import express from 'express';
import { authentificate, authorizeAdmin } from '../Middlewares/auth.js'; // Assuming admin creates accounts for others
import { createBankAccount, getMyBankAccounts, transferFunds, getAccountTransactions, getAccountTransactionSummary, getBankAccountsByUserId } from '../Controllers/BankAccountController.js';

const router = express.Router();

// Route for creating a new bank account
// Assuming only admins can create bank accounts for users
router.route('/').post(authentificate, authorizeAdmin, createBankAccount);

// Route for getting bank accounts for the authenticated user
router.route('/myaccounts').get(authentificate, getMyBankAccounts);

// Route for getting bank accounts for a specific user (admin only)
router.route('/').get(authentificate, authorizeAdmin, getBankAccountsByUserId);

// Route for transferring funds between accounts
router.route('/transfer').post(authentificate, transferFunds);

// Route for getting transactions for a specific bank account
router.route('/:id/transactions').get(authentificate, getAccountTransactions);

// Route for getting transaction summary for a specific bank account
router.route('/:id/summary').get(authentificate, getAccountTransactionSummary);

export default router; 