import bcrypt from "bcryptjs";
import asyncHandler from "../Middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";
// import sendEmail from "../utils/sendEmail.js"; // Commented out nodemailer for now
import crypto from "crypto";
import User from "../Models/User.js";

const creatUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new Error("please fill all the inputs");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("user already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Commented out verification token generation for now
  // const verificationToken = crypto.randomBytes(32).toString('hex');
  // const verificationTokenExpires = Date.now() + 3600000; // 1 hour

  //adding user to db
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    // Commented out verification token fields for now
    // verificationToken,
    // verificationTokenExpires,
  });
  try {
    console.log('Attempting to save new user...'); // Log 1
    await newUser.save();
    console.log('User saved successfully.'); // Log 2
    createToken(res, newUser._id); // Auto-login after creation
    console.log('Token created.'); // Log 3

    // Commented out email sending logic for now
    // const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verifyemail/${verificationToken}`;
    // const message = `Please verify your email by clicking on this link: <a href="${verificationUrl}">${verificationUrl}</a>`;
    // try {
    //   await sendEmail({
    //     email: newUser.email,
    //     subject: 'Email Verification',
    //     html: message,
    //   });
    //   res.status(201).json({
    //     _id: newUser._id,
    //     username: newUser.username,
    //     email: newUser.email,
    //     isAdmin: newUser.isAdmin,
    //     message: 'User registered. Please check your email for verification.',
    //   });
    //   console.log('Success response sent.'); // Log 4
    // } catch (emailError) {
    //   console.error('Error sending email:', emailError);
    //   res.status(500);
    //   throw new Error('Error sending verification email.');
    // }

    // Original successful response (without email verification message)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });

  } catch (error) {
    console.error('Error during user creation process:', error); // Log error details
    res.status(400);
    throw new Error("invalid user data");
  }
});

// Commented out verifyEmail function for now
// const verifyEmail = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const user = await User.findOne({
//     verificationToken: token,
//     verificationTokenExpires: { $gt: Date.now() },
//   });
//   if (!user) {
//     res.status(400);
//     throw new Error('Invalid or expired verification token.');
//   }
//   user.isVerified = true;
//   user.verificationToken = undefined;
//   user.verificationTokenExpires = undefined;
//   await user.save();
//   createToken(res, user._id); // Log in the user after verification
//   res.status(200).json({
//     message: 'Email verified successfully. You are now logged in.',
//     _id: user._id,
//     username: user.username,
//     email: user.email,
//     isAdmin: user.isAdmin,
//   });
// });

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // Commented out email verification check for now
  // if (!existingUser.isVerified) {
  //   res.status(401);
  //   throw new Error("Please verify your email to log in.");
  // }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Incorrect password");
  }

  // Generate token and set cookie
  const token = createToken(res, existingUser._id);
  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
    token, // Add token to the response body
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const isSecure = process.env.NODE_ENV === "production";
  console.log(`Clearing JWT cookie with secure: ${isSecure} (NODE_ENV: ${process.env.NODE_ENV})`);
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "logged out succesfuly" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).populate('bankAccounts'); // Populate bank accounts
  res.json(users);
});

const getCurrectUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error(" user not found ");
  }
});
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("cannot   delete admin user");
    }
    await user.deleteOne({ _id: user._id });
    res.json({ message: "user removed" });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});
const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  if (user) {
    res.status(200).json(user.notifications.sort((a, b) => b.date - a.date)); // Sort by date descending
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const notification = user.notifications.id(notificationId);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  notification.read = true;
  await user.save();

  res.status(200).json({ message: "Notification marked as read.", notification });
});

const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message } = req.body;

  if (!userId || !title || !message) {
    res.status(400);
    throw new Error("User ID, title, and message are required.");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.notifications.push({ title, message });
  await user.save();

  res.status(201).json({ message: "Notification created successfully.", notification: user.notifications[user.notifications.length - 1] });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = Date.now() + 3600000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: <a href="${resetUrl}">${resetUrl}</a> with your new password. If you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: message,
    });

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(500);
    throw new Error('Error sending password reset email.');
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token.');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  createToken(res, user._id); // Log in the user after password reset

  res.status(200).json({
    message: 'Password reset successfully. You are now logged in.',
    _id: user._id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

export {
  deleteUserById,
  creatUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrectUserProfile,
  updateCurrentUserProfile,
  getUserById,
  updateUserById,
  // verifyEmail, // Commented out for now
  forgotPassword,
  resetPassword,
  getNotifications,
  markNotificationAsRead,
  createNotification,
};