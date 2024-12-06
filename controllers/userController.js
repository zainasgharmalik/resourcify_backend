import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";

export const login = catchAsyncError(async (req, res, next) => {
  const { identifier, password } = req.body; // `identifier` can be rollNo or email

  if (!identifier || !password) {
    return next(new ErrorHandler("Please Enter All Fields", 400));
  }

  let user;

  // Determine if the identifier is a roll number based on its pattern
  const rollNoPattern = /^[a-z]{2}\d{2}-[a-z]{3}-\d{3}$/i; // Matches `fa22-bse-073` format

  if (rollNoPattern.test(identifier)) {
    // If identifier matches roll number format
    user = await User.findOne({ rollNo: identifier }).select("+password");
  } else {
    // Otherwise, treat identifier as an email
    user = await User.findOne({ email: identifier }).select("+password");
  }

  if (!user) {
    return next(new ErrorHandler("Incorrect Identifier or Password", 409));
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
