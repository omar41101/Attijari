import express from 'express';
import { authentificate, authorizeAdmin } from '../middlewares/auth.js'; // Assuming admin creates accounts for others
import { createBankAccount, getMyBankAccounts } from '../Controllers/BankAccountController.js';

const router = express.Router();

// Route for creating a new bank account
// Assuming only admins can create bank accounts for users
router.route('/').post(authentificate, authorizeAdmin, createBankAccount);

// Route for getting bank accounts for the authenticated user
router.route('/myaccounts').get(authentificate, getMyBankAccounts);

export default router; 