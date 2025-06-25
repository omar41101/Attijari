import express from "express";
import {
  deleteUserById,
  creatUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrectUserProfile,
  updateCurrentUserProfile,
  getUserById,
  updateUserById,
 // verifyEmail,
  forgotPassword,
  resetPassword,
  getNotifications,
  markNotificationAsRead,
  createNotification,
} from "../Controllers/UserController.js";
import {
  authentificate,
  authorizeAdmin,
} from "../middlewares/auth.js";

const router = express.Router();
router
  .route("/")
  .post(creatUser)
  .get(authentificate, authorizeAdmin, getAllUsers);
router.post("/auth", loginUser);
router.post("/logout", logoutUser);
//router.get("/verifyemail/:token", verifyEmail);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
router
  .route("/profile")
  .get(authentificate, getCurrectUserProfile)
  .put(authentificate, updateCurrentUserProfile);

router.route("/notifications")
  .get(authentificate, getNotifications) // Get user's notifications
  .post(authentificate, authorizeAdmin, createNotification); // Create a new notification (admin only for now)

router.put("/notifications/:notificationId/read", authentificate, markNotificationAsRead); // Mark notification as read

  //ADMIN routes !!! 
router
  .route("/:id")
  .delete(authentificate, authorizeAdmin, deleteUserById)
  .get(authentificate, authorizeAdmin, getUserById)
  .put(authentificate, authorizeAdmin, updateUserById);


  
export default router;