import jwt from "jsonwebtoken";

const createToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  const isSecure = process.env.NODE_ENV === "production";
  console.log(`Setting JWT cookie with secure: ${isSecure} (NODE_ENV: ${process.env.NODE_ENV})`);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token; // Returned in the response body
};

export default createToken;