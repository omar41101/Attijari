import mongoose from 'mongoose';

const cardSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{16}$/, // Basic validation for 16 digits
    },
    cardType: {
      type: String,
      required: true,
      enum: ['Debit', 'Credit'],
    },
    expiryDate: {
      type: String,
      required: true,
      match: /^(0[1-9]|1[0-2])\/([0-9]{2})$/, // MM/YY format
    },
    cvv: {
      type: String,
      required: true,
      match: /^[0-9]{3,4}$/, // 3 or 4 digits
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Blocked', 'Cancelled'],
      default: 'Active',
    },
    linkedBankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model('Card', cardSchema);

export default Card; 