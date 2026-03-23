import asyncHandler from "../utils/asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import User from "../models/User.modal.js";
import { ApiResponse } from "../utils/Apires.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
const generateAccessandrefreshTocken=async(userId)=>{
  try {
 const user = await User.findById(userId)
 const accessToken = await user.generateAccessToken();
 const refreshToken = await user.generateRefreshToken(); 
    
  user.refreshToken=refreshToken
  await user.save({validateBeforeSave:false})
   
  return {accessToken,refreshToken} 
   
  } catch (error) {
    throw new Apierror(500,"Token generation failed");
  }
}
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
  // console.log(req.files);
  
  // file paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverimgLocalPath = req.files?.coverimg?.[0]?.path;
    
  if (!avatarLocalPath) {
    throw new Apierror(400, "Avatar image is required");
  }
// console.log("FILES:", req.files);
// console.log("Avatar Path:", avatarLocalPath);
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
// console.log("FILES:", req.files);
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});
const loginUser=asyncHandler(async(req,res)=>{
    //req.body->data
    //username
    //email
    //find the user
    //password check
    //access and refresh tocken
    //send cookies
    const {username,email,password}=req.body;
    if(!(username || email)){
      throw new Apierror(400,"Username or email is required");
    }
    const user=await  User.findOne({
      $or:[
        {username},
        {email}
      ]
    })
    if(!user){
      throw new Apierror(404,"User not found");
    } 
   const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      throw new Apierror(401, "passord incorrect");
    }
   const {accessToken,refreshToken}=await generateAccessandrefreshTocken(user._id)

   const logedinUser=await User.findById(user._id).select("-password -refreshtoken")
   const options={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshTocken",refreshToken,options)
   .json(new ApiResponse(200,{user:logedinUser,accessToken
    ,refreshToken
   },"Login successful"))

})
const logoutUser=asyncHandler(async(req,res)=>{
 await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshtoken:undefined
      }
    },
      {
        new: true
      }
    
  )
 const options={
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"Logout successful"))
})
const refreshaccessTocken=asyncHandler(async(req,res)=>{

  const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingrefreshToken){
    throw new Apierror(400,"unauthorized request")
  }
try {
   const decodedeToken =jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const user= await User.findById(decodedeToken?._id)
   if(!user){
    throw new Apierror(404,"invalid refresh token")
   }
  if(incomingrefreshToken!==user?.refreshToken){
    throw new Apierror(401,"refresh token expired")
  }  
  const options={
    httpOnly:true,
    secure:true
  }
  const {accessToken,newrefreshToken}=await generateAccessandrefreshTocken(user._id);
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newrefreshToken,options)
  .json(new ApiResponse(200,{accessToken,newrefreshToken},"Access token refreshed successfully"))
  
} catch (error) {
  throw new Apierror(401,error?.message || "Invalid refresh token")
}
})
 
const changeCurrentPassword=asyncHandler(async(req,res)=>{
const {oldpassword,newpassword} =req.body
    const user=await User.findById(req.user._id)
   const ispasswordValid = await user.isPasswordMatch(oldpassword)
   if(!ispasswordValid){
    throw new Apierror(401,"Old password is incorrect")
   }
   user.password=newpassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))

});
const getCurrentUser=asyncHandler(async(req,res)=>{
return res.status(200)
.json(200,req.user,"Current user fetched successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email} =req.body
  if(!fullName || !email){
    throw new Apierror(400,"Full name and email are required")
  }
   const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email
      }
    },
    {
      new:true
    }
   ).select("-password")
   return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})
const updateuseravatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new Apierror(400, "Avatar image is required");
  }

 const avatar=await uploadOnCloudinary(avatarLocalPath)
 if(!avatar.url){
  throw new Apierror(400,"Avatar upload failed")
 }
  const user=findByIdAndUpdate(req.user?._id,
    {
    $set:{
      avatar:avatar.url
    }
    },{
      new:true
    }
  ).select("-password")


})
const updateusercover=asyncHandler(async(req,res)=>{
  const coverpath = req.file?.path;
  if (!coverpath) {
    throw new Apierror(400, "Cover image is required");
  }

 const cover=await uploadOnCloudinary(coverpath)
 if(!cover.url){
  throw new Apierror(400,"Cover upload failed")
 }
  const user=findByIdAndUpdate(req.user?._id,
    {
    $set:{
      cover:cover.url
    }
    },{
      new:true
    }
  ).select("-password")

return res.status(200).json(new ApiResponse(200,user,"cover image updated successfully"))
})
export { registerUser,loginUser,logoutUser,refreshaccessTocken ,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateuseravatar,updateusercover,};