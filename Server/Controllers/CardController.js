import asyncHandler from "../Middlewares/asyncHandler.js";
import Card from '../Models/Card.js';
import User from "../Models/User.js";
import BankAccount from '../models/BankAccount.js';

// @desc    Create a new card
// @route   POST /api/cards
// @access  Admin (or potentially user if self-service, but for now, admin)
const createCard = asyncHandler(async (req, res) => {
  const {
    userId,
    cardNumber,
    cardType,
    expiryDate,
    cvv,
    linkedBankAccount,
  } = req.body;

  // Basic validation
  if (!userId || !cardNumber || !cardType || !expiryDate || !cvv || !linkedBankAccount) {
    res.status(400);
    throw new Error('Please provide all required card details.');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Check if the linked bank account exists and belongs to the user
  const bankAccount = await BankAccount.findOne({ _id: linkedBankAccount, user: userId });
  if (!bankAccount) {
    res.status(404);
    throw new Error('Linked bank account not found or does not belong to the user.');
  }

  // Create the new card
  const card = new Card({
    user: userId,
    cardNumber,
    cardType,
    expiryDate,
    cvv,
    linkedBankAccount,
  });

  const createdCard = await card.save();
  res.status(201).json(createdCard);
});

// @desc    Get all cards for the authenticated user
// @route   GET /api/cards/mycards
// @access  Private
const getMyCards = asyncHandler(async (req, res) => {
  const cards = await Card.find({ user: req.user._id }).populate('linkedBankAccount', 'accountNumber accountType');
  res.status(200).json(cards);
});

// @desc    Get a single card by ID for the authenticated user
// @route   GET /api/cards/:id
// @access  Private
const getCardById = asyncHandler(async (req, res) => {
  const card = await Card.findOne({ _id: req.params.id, user: req.user._id }).populate('linkedBankAccount', 'accountNumber accountType');

  if (card) {
    res.status(200).json(card);
  } else {
    res.status(404);
    throw new Error('Card not found or does not belong to the user.');
  }
});

// @desc    Update card status (e.g., Block/Unblock)
// @route   PUT /api/cards/:id/status
// @access  Private
const updateCardStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['Active', 'Blocked', 'Cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status provided. Must be Active, Blocked, or Cancelled.');
  }

  // Allow admin to update any card, user can only update their own
  let card;
  if (req.user.isAdmin) {
    card = await Card.findById(req.params.id);
  } else {
    card = await Card.findOne({ _id: req.params.id, user: req.user._id });
  }

  if (card) {
    card.status = status;
    const updatedCard = await card.save();
    res.status(200).json(updatedCard);
  } else {
    res.status(404);
    throw new Error('Card not found or does not belong to the user.');
  }
});

// @desc    Delete a card by ID
// @route   DELETE /api/cards/:id
// @access  Admin (or potentially user for self-cancellation)
const deleteCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);

  if (card) {
    // Ensure only admins can delete cards or users can delete their own
    // For simplicity, let's assume admin for now. Add user check later if needed.
    await card.deleteOne();
    res.json({ message: 'Card removed' });
  } else {
    res.status(404);
    throw new Error('Card not found');
  }
});

// @desc    Get all cards for a specific user (admin only)
// @route   GET /api/cards?userId=...
// @access  Admin
const getCardsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400);
    throw new Error('userId query parameter is required.');
  }
  const cards = await Card.find({ user: userId }).populate('linkedBankAccount', 'accountNumber accountType currency');
  res.status(200).json(cards);
});

export {
  createCard,
  getMyCards,
  getCardById,
  updateCardStatus,
  deleteCard,
  getCardsByUserId,
}; 