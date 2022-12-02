const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const { createJWT, attachCookieToResponse } = require("../utils");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const emailAlreadyExits = await User.findOne({ email: email });

  if (emailAlreadyExits) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const tokenUser = { name: user.name, userId: user._id, role: user.role };

  attachCookieToResponse({ res, user: tokenUser });

  return res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password);

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const isCorrectPassword = await user.comparePassword(password);

  if (!isCorrectPassword) {
    throw new CustomError.BadRequestError("Please provide valid password");
  }

  const tokenUser = { name: user.name, role: user.role, id: user._id };
  attachCookieToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).send("");
};

module.exports = {
  register,
  login,
  logout,
};
