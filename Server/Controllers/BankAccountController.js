import asyncHandler from '../middlewares/asyncHandler.js';
import BankAccount from '../models/BankAccount.js';
import User from '../models/User.js';

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

export { createBankAccount, getMyBankAccounts }; 