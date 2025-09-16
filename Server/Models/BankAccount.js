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
            enum: ['Courant', 'Epargne'],
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
        
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
     
        lastTransactionDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export default BankAccount; 