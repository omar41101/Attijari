import asyncHandler from "../Middlewares/asyncHandler.js";
import BankAccount from '../models/BankAccount.js';
import User from "../Models/User.js";
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import UUID package

// @desc    Create a new bank account
// @route   POST /api/bankaccounts
// @access  Admin (assuming only admin can create accounts for others)
const createBankAccount = asyncHandler(async (req, res) => {
    const {
        accountNumber,
        accountType,
        balance,
        currency,
        status,
        interestRate,
        minimumBalance,
        userId, // Assuming the admin sends the user ID
    } = req.body;

    // Basic validation
    if (!accountNumber || !accountType || balance === undefined || !currency || !userId) {
        res.status(400);
        throw new Error('Please provide all required bank account details and the user ID.');
    }

    // Find the user for whom the account is being created
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    // Create the new bank account
    const bankAccount = new BankAccount({
        accountNumber,
        accountType,
        balance,
        currency,
        status,
        interestRate,
        minimumBalance,
        user: user._id, // Link the account to the user
    });

    // Save the bank account
    const createdBankAccount = await bankAccount.save();

    // Add the bank account reference to the user's bankAccounts array
    user.bankAccounts.push(createdBankAccount._id);
    await user.save();

    res.status(201).json(createdBankAccount);
});

// @desc    Get bank accounts for the authenticated user
// @route   GET /api/bankaccounts/myaccounts
// @access  Private
const getMyBankAccounts = asyncHandler(async (req, res) => {
    // The authenticated user's ID is available in req.user._id
    const user = await User.findById(req.user._id).populate('bankAccounts');

    if (user) {
        res.status(200).json(user.bankAccounts);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Transfer funds between accounts
// @route   POST /api/bankaccounts/transfer
// @access  Private
const transferFunds = asyncHandler(async (req, res) => {
    const { sourceAccountNumber, destinationAccountNumber, amount, description } = req.body;

    if (!sourceAccountNumber || !destinationAccountNumber || !amount || amount <= 0) {
        res.status(400);
        throw new Error('Please provide source account, destination account, and a positive amount.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sourceAccount = await BankAccount.findOne({ accountNumber: sourceAccountNumber, user: req.user._id }).session(session);

        if (!sourceAccount) {
            res.status(404);
            throw new Error('Source account not found or does not belong to the authenticated user.');
        }

        if (sourceAccount.balance < amount) {
            res.status(400);
            throw new Error('Insufficient funds in the source account.');
        }

        const destinationAccount = await BankAccount.findOne({ accountNumber: destinationAccountNumber }).session(session);

        if (!destinationAccount) {
            res.status(404);
            throw new Error('Destination account not found.');
        }

        // Update balances
        sourceAccount.balance -= amount;
        destinationAccount.balance += amount;

        // Set last transaction date
        sourceAccount.lastTransactionDate = new Date();
        destinationAccount.lastTransactionDate = new Date();

        await sourceAccount.save({ session });
        await destinationAccount.save({ session });

        // Create transaction records
        const referenceNumber = `TRF-${uuidv4().replace(/-/g, '').toUpperCase()}`; // Generate unique reference number using UUID
        console.log(referenceNumber);

        const sourceTransaction = new Transaction({
            transactionType: 'Transfer',
            amount: -amount, // Negative for outgoing transfer
            currency: sourceAccount.currency,
            status: 'Completed',
            description: description || `Transfer to ${destinationAccountNumber}`,
            sourceAccount: sourceAccount._id,
            destinationAccount: destinationAccount._id,
            referenceNumber,
            balanceAfterTransaction: sourceAccount.balance,
            initiatedBy: req.user._id,
        });

        const destinationTransaction = new Transaction({
            transactionType: 'Transfer',
            amount: amount, // Positive for incoming transfer
            currency: destinationAccount.currency,
            status: 'Completed',
            description: description || `Transfer from ${sourceAccountNumber}`,
            sourceAccount: sourceAccount._id, // This is the source of the funds
            destinationAccount: destinationAccount._id,
            referenceNumber,
            balanceAfterTransaction: destinationAccount.balance,
            initiatedBy: req.user._id, // Initiated by the user who made the transfer
        });

        await sourceTransaction.save({ session });
        await destinationTransaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Funds transferred successfully!', sourceTransaction, destinationTransaction });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500);
        throw new Error(`Transfer failed: ${error.message}`);
    }
});

// @desc    Get transactions for a specific bank account
// @route   GET /api/bankaccounts/:id/transactions
// @access  Private
const getAccountTransactions = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify that the bank account belongs to the authenticated user
    const bankAccount = await BankAccount.findOne({ _id: id, user: req.user._id });

    if (!bankAccount) {
        res.status(404);
        throw new Error('Bank account not found or does not belong to the authenticated user.');
    }

    // Find all transactions where this account is either source or destination
    const transactions = await Transaction.find({
        $or: [
            { sourceAccount: id },
            { destinationAccount: id }
        ]
    })
    .sort({ transactionDate: -1 })
    .populate('sourceAccount', 'accountNumber accountType') // Populate source account details
    .populate('destinationAccount', 'accountNumber accountType') // Populate destination account details
    .populate('initiatedBy', 'username email'); // Populate initiatedBy user details

    res.status(200).json(transactions);
});

// @desc    Get a summary of transactions for a specific bank account (e.g., total income, total expenses)
// @route   GET /api/bankaccounts/:id/summary
// @access  Private
const getAccountTransactionSummary = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify that the bank account belongs to the authenticated user
    const bankAccount = await BankAccount.findOne({ _id: id, user: req.user._id });

    if (!bankAccount) {
        res.status(404);
        throw new Error('Bank account not found or does not belong to the authenticated user.');
    }

    const transactions = await Transaction.find({
        $or: [
            { sourceAccount: id },
            { destinationAccount: id }
        ]
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const transactionsByType = {};

    transactions.forEach(transaction => {
        if (transaction.transactionType === 'Deposit' || (transaction.transactionType === 'Transfer' && String(transaction.destinationAccount) === String(bankAccount._id))) {
            totalIncome += transaction.amount;
        } else if (transaction.transactionType === 'Withdrawal' || (transaction.transactionType === 'Transfer' && String(transaction.sourceAccount) === String(bankAccount._id))) {
            totalExpenses += Math.abs(transaction.amount); // Ensure expenses are positive
        }

        if (transactionsByType[transaction.transactionType]) {
            transactionsByType[transaction.transactionType] += Math.abs(transaction.amount);
        } else {
            transactionsByType[transaction.transactionType] = Math.abs(transaction.amount);
        }
    });

    res.status(200).json({
        totalIncome,
        totalExpenses,
        balance: bankAccount.balance,
        transactionsByType,
    });
});

// @desc    Get bank accounts for a specific user (admin only)
// @route   GET /api/bankaccounts?userId=...
// @access  Admin
const getBankAccountsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        // If no userId, return all bank accounts (admin only)
        const accounts = await BankAccount.find({}).populate('user', 'username email');
        return res.status(200).json(accounts);
    }
    const user = await User.findById(userId).populate('bankAccounts');
    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }
    res.status(200).json(user.bankAccounts);
});

// @desc    Update a bank account (admin only)
// @route   PUT /api/bankaccounts/:id
// @access  Admin
const updateBankAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const account = await BankAccount.findById(id);
    if (!account) {
        res.status(404);
        throw new Error('Bank account not found.');
    }
    // Update fields
    Object.keys(updates).forEach(key => {
        account[key] = updates[key];
    });
    await account.save();
    res.status(200).json(account);
});

// @desc    Delete a bank account (admin only)
// @route   DELETE /api/bankaccounts/:id
// @access  Admin
const deleteBankAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const account = await BankAccount.findById(id);
    if (!account) {
        res.status(404);
        throw new Error('Bank account not found.');
    }
    await account.deleteOne();
    res.json({ message: 'Bank account deleted' });
});

export { createBankAccount, getMyBankAccounts, transferFunds, getAccountTransactions, getAccountTransactionSummary, getBankAccountsByUserId, updateBankAccount, deleteBankAccount };