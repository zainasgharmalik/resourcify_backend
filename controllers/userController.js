import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Booking } from "../models/Booking.js";
import { LendItemRequest } from "../models/LendItemRequest.js";
import { LendLabResource } from "../models/LendLabResourceRequest.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { lendLibraryItem } from "./libraryItemsController.js";

export const login = catchAsyncError(async (req, res, next) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password || !role) {
    return next(new ErrorHandler("Please Enter All Fields", 400));
  }

  let user;

  const rollNoPattern = /^[a-z]{2}\d{2}-[a-z]{3}-\d{3}$/i; // e.g., fa22-bse-073

  // Role: student → must use rollNo
  if (role === "student") {
    if (!rollNoPattern.test(identifier)) {
      return next(
        new ErrorHandler("Students must login with Roll Number", 400)
      );
    }

    user = await User.findOne({ rollNo: identifier, role }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Roll Number or Role", 404));
    }
  }
  // Other roles (e.g., teacher, librarian, lab_attendant) → must use email
  else {
    if (rollNoPattern.test(identifier)) {
      return next(new ErrorHandler("This role must login using Email", 400));
    }

    user = await User.findOne({ email: identifier }).select("+password");

    if (!user || user.role !== role) {
      return next(new ErrorHandler("Invalid Email or Role", 404));
    }
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Identifier or Password", 400));
  }

  sendToken(res, user, `Welcome Back ${user.name}`, 200);
});

export const register = catchAsyncError(async (req, res, next) => {
  const { name, rollNo, password, email, role } = req.body;
  if (!name || !rollNo || !password || !email || !role) {
    return next(new ErrorHandler("Please Enter all fields", 401));
  }

  let user = await User.findOne({ rollNo: rollNo });

  if (user) {
    return next(new ErrorHandler("User Exists Already", 401));
  }

  user = await User.create({
    name: name,
    rollNo: rollNo,
    password: password,
    email: email,
    role: role,
  });

  res.status(200).json({
    success: true,
    message: "Account Created Successfully",
  });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    sucess: true,
    user,
  });
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      httpOnly: true,
      sameSite: "none",
      secure: true,

      expires: new Date(Date.now()),
    })
    .json({
      sucess: true,
      message: "User Logged Out Sucessfully",
    });
});

export const getMyRequests = catchAsyncError(async (req, res, next) => {
  const libraryItems = await LendItemRequest.find({ borrower: req.user._id })
    .populate("item")
    .populate("borrower");
  const labResources = await LendLabResource.find({ borrower: req.user._id })
    .populate("item")
    .populate("borrower");

  const roomBookings = await Booking.find({
    user: req.user._id,
  }).populate("roomId");

  res.status(200).json({
    success: true,
    libraryItems,
    labResources,
    roomBookings,
  });
});
