import express from "express";
import {
  createCard,
  getMyCards,
  getCardById,
  updateCardStatus,
  deleteCard,
  getCardsByUserId,
} from "../Controllers/CardController.js";
import {
  authentificate,
  authorizeAdmin,
} from "../Middlewares/auth.js";

const router = express.Router();

router.route("/").post(authentificate, authorizeAdmin, createCard);
router.get("/mycards", authentificate, getMyCards);

router
  .route("/:id")
  .get(authentificate, getCardById) // Get a single card by ID
  .delete(authentificate, authorizeAdmin, deleteCard); // Delete a card (admin only)

// Route for updating card status (admin or card owner)
router
  .route('/:id/status')
  .put(authentificate, updateCardStatus); // Update card status

// Route for getting cards for a specific user (admin only)
router.route('/').get(authentificate, authorizeAdmin, getCardsByUserId);

export default router; 