import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { LabResource } from "../models/LabResource.js";
import { LendLabResource } from "../models/LendLabResourceRequest.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
export const getAllLabResources = catchAsyncError(async (req, res, next) => {
  const labResources = await LabResource.find();
  res.status(200).json({
    success: true,
    labResources,
  });
});

export const getAllLabResourceById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const labResource = await LabResource.findById(id);
  res.status(200).json({
    success: true,
    labResource,
  });
});
export const createLabResource = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  const { title, version, link, instructions, os, publisher, size } = req.body;

  if (
    !title ||
    !version ||
    !link ||
    !instructions ||
    !os ||
    !publisher ||
    !size ||
    !file
  ) {
    return next(new ErrorHandler("Please enter all feilds", 401));
  }

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await LabResource.create({
    title: title,
    version: version,
    link: link,
    instructions: instructions,
    os: os,
    publisher: publisher,
    size: size,
    image: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Lab Resource Created Successfully",
  });
});

export const updateLabResource = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const file = req.file;
  const { title, version, link, instructions, os, publisher, size } = req.body;

  const selectedLabResource = await LabResource.findById(id);
  if (!selectedLabResource) {
    return next(new ErrorHandler("Invalid Resource Id", 404));
  }

  if (title) selectedLabResource.title = title;
  if (version) selectedLabResource.version = version;
  if (link) selectedLabResource.link = link;
  if (instructions) selectedLabResource.instructions = instructions;
  if (os) selectedLabResource.os = os;
  if (publisher) selectedLabResource.publisher = publisher;
  if (size) selectedLabResource.size = size;

  if (file) {
    try {
      await v2.uploader.destroy(selectedLabResource.file.public_id);

      const fileUri = getDataUri(req.file);
      const mycloud = await v2.uploader.upload(fileUri.content);

      selectedLabResource.image = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    } catch (err) {
      return next(new ErrorHandler("File upload failed", 500));
    }
  }

  await selectedLabResource.save();

  res.status(200).json({
    success: true,
    message: "Lab resource updated successfully",
  });
});

export const deleteLabResource = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const selectedLabResource = await LabResource.findById(id);
  if (!selectedLabResource) {
    return next(new ErrorHandler("Invalid Resource Id", 404));
  }

  await selectedLabResource.deleteOne();

  res.status(200).json({
    success: true,
    message: "Lab resource deleted successfully",
  });
});

export const createLabResourceRequest = catchAsyncError(
  async (req, res, next) => {
    const { name, regNumber, email, phoneNo, department, item, purpose } =
      req.body;
    if (
      !item ||
      !purpose ||
      !name ||
      !regNumber ||
      !email ||
      !phoneNo ||
      !department
    ) {
      return next(new ErrorHandler("Please enter all fields", 401));
    }

    await LendLabResource.create({
      borrower: req.user._id,
      name: name,
      regNumber: regNumber,
      email: email,
      phone: phoneNo,
      department: department,
      item: item,
      purpose: purpose,
    });

    res.status(200).json({
      success: true,
      message: "Lab resource request generated successfully",
    });
  }
);

export const getAllLabResourceRequests = catchAsyncError(
  async (req, res, next) => {
    let requests = await LendLabResource.find({})
      .populate("borrower")
      .populate("item");

    res.status(200).json({
      success: true,
      requests,
    });
  }
);

export const changeLendLabResourceStatus = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await LendLabResource.findById(id);
    if (!request) {
      return next(new ErrorHandler("Invalid Request Id", 400));
    }
    request.status = status;
    await request.save();
    res.status(200).json({
      success: true,
      message: "Lend Item Request Status Changed Successfully",
    });
  }
);
