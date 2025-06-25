import User from '../models/User.js';
import Auction from '../models/Auction.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendToken = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  const { password, ...userData } = user._doc;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json(new ApiResponse(statusCode, userData, message));
};


export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const user = await User.create({ username, email, password });
  if (!user) {
    throw new ApiError(500, 'Something went wrong');
  }

  sendToken(user, 201, res, 'User registered successfully');
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  sendToken(user, 200, res, 'Login successful');
});


export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    'google',
    {
      failureRedirect: `${process.env.FRONTEND_URL}/login`,
      session: false,
    },
    (err, user, info) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
      }

      const token = generateToken(user._id);
      const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res
        .cookie('token', token, options)
        .redirect(`${process.env.FRONTEND_URL}/`);
    },
  )(req, res, next);
};


export const logout = (req, res) => {
  res
    .status(200)
    .cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
    })
    .json(new ApiResponse(200, {}, 'Logout successful'));
};

export const getUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
};


export const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.user._id).populate('wonAuctions.auction', 'title');
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const activeAuctions = await Auction.find({
    participants: userId,
    status: { $in: ['active'] }
  }).select('_id title currentPrice status startTime');

  const createdAuctions = await Auction.find({
    createdBy: userId
  }).select('_id title currentPrice status startTime');

  const profileData = {
    ...user.toObject(),
    activeAuctions,
    createdAuctions
  };

  res.json({ success: true, user: profileData });
});