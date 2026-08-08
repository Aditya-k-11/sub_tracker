import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, currency } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("A user with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    currency
  });

  const token = generateToken(user._id);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency
    },
    token
  });
});

export const loginUser = catchAsync(async (req, res, next) => {
  console.log("LOGIN ATTEMPT:", req.body);
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency
    },
    token
  });
});
