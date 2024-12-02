import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";

export const login = catchAsyncError(async (req, res, next) => {
  const { rollNo, password } = req.body;

  if (!rollNo || !password) {
    return next(new ErrorHandler("Please Enter All Feilds", 400));
  }

  let user = await User.findOne({ rollNo: rollNo }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Incorrect Email or Password", 409));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Incorrect Email or Password", 400));
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
