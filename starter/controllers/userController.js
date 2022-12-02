const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const { createTokenUser, attachCookieToResponse } = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  return res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user found with userid ${id}`);
  }

  return res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateuser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide email and name");
  }

  console.log(req.user);

  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      email,
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const tokenUser = { name: user.name, role: user.role, id: user.id };
  attachCookieToResponse({ res, user: tokenUser });
  return res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide correct password");
  }

  const user = await User.findOne({ _id: req.user.id });
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  user.password = newPassword;
  user.save();
  return res
    .status(StatusCodes.OK)
    .json({ msg: "Password changed successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateuser,
  updateUserPassword,
};
