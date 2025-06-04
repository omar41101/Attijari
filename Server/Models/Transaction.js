import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
    {
        transactionType: {
            type: String,
            required: true,
            enum: ['Deposit', 'Withdrawal', 'Transfer', 'Interest', 'Fee'],
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Completed', 'Failed', 'Reversed'],
            default: 'Pending',
        },
        description: {
            type: String,
        },
        sourceAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BankAccount',
            required: true,
        },
        destinationAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BankAccount',
        },
        referenceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        transactionDate: {
            type: Date,
            default: Date.now,
        },
        balanceAfterTransaction: {
            type: Number,
            required: true,
        },
        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ sourceAccount: 1, transactionDate: -1 });
transactionSchema.index({ destinationAccount: 1, transactionDate: -1 });
transactionSchema.index({ referenceNumber: 1 }, { unique: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction; 