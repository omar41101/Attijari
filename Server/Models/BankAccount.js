import mongoose from "mongoose";

const bankAccountSchema = mongoose.Schema(
    {
        accountNumber: {
            type: String,
            required: true,
            unique: true,
        },
        accountType: {
            type: String,
            required: true,
            enum: ['Savings', 'Checking', 'Fixed Deposit'],
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Inactive', 'Frozen', 'Closed'],
            default: 'Active',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        interestRate: {
            type: Number,
            default: 0,
        },
        minimumBalance: {
            type: Number,
            default: 0,
        },
        lastTransactionDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export default BankAccount; 