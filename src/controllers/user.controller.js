import asyncHandler from "../utils/asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import User from "../models/User.modal.js";
import { ApiResponse } from "../utils/Apires.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new Apierror(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new Apierror(409, "User already exists");
  }

  // file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverimgLocalPath = req.files?.coverimg?.[0]?.path;

  if (!avatarLocalPath) {
    throw new Apierror(400, "Avatar image is required");
  }
console.log("FILES:", req.files);
console.log("Avatar Path:", avatarLocalPath);
  // upload avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new Apierror(400, "Avatar upload failed");
  }

  // upload cover image
  let coverimg = null;

  if (coverimgLocalPath) {
    coverimg = await uploadOnCloudinary(coverimgLocalPath);
  }

  // create user
  const user = await User.create({
    fullname: fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverimg: coverimg?.url || ""
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  if (!createdUser) {
    throw new Apierror(500, "Registration failed");
  }
console.log("FILES:", req.files);
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export { registerUser };