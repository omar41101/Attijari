import mongoose from "mongoose";

const beneficiarySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        swiftCode: {
            type: String,
        },
        routingNumber: {
            type: String,
        },
        accountType: {
            type: String,
            required: true,
            enum: ['Savings', 'Checking', 'Fixed Deposit'],
        },
        currency: {
            type: String,
            required: true,
            default: 'USD',
        },
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        nickname: {
            type: String,
        },
        email: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },
        lastUsed: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index to ensure unique beneficiaries per user
beneficiarySchema.index({ user: 1, accountNumber: 1 }, { unique: true });

const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);
export default Beneficiary; 