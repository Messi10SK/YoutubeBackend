import { ApiError } from "../utils/ApiError.js";
import {asyncHandler}  from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
     try {
         await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()


        user.refreshToken = refreshToken
       await  user.save({validateBeforeSave: false})

       return {accessToken,refreshToken}



     } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access token")
     }
}





const registerUser = asyncHandler(async (req,res)=>{
    //  res.status(200).json({
    //    message:"ok"
    // })
    
    
    
    // for user registration ****************
    // get user details from frontend
    // validation - not empty
    // check if user already exists : username , email
    // check for images , check for avatar
    // upload them to cloudinary, avatar 
    // create user object-- create entry in db
    // remove password and refresh token fied from response
    // check for user creation
    // return response

    const {username,email,fullName,avatar,coverImage,password} = req.body;

    if ([fullName ,email,username,password].some(()=>
    field?.trim() ==="")
    ){
        throw new ApiError(400,"fullName is required");
    }


    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if (existedUser) {
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required");
    }


   avatar = await uploadOnCloudinary(avatarLocalPath)

  coverImage = await  uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
    throw new ApiError(400,"Avatar file is required");
}


const user = await User.create({
    fullName,
    username:username.toLowerCase(),
    email,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createdUser) {
    throw new ApiError(500,"something went wrong while registering the user");
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User created and registered successfully")
)


})


const loginUser = asyncHandler(async (req,res)=>{
// req body se data
// username email hai ki nhi 
// password hai ki nhi
// find the user 
// check if user exist 
// if exist password check
//  access and refresh token generate 
// send in form of cookies 
// response successfully login


const {email,username,password} = req.body

if (!username || !email) {
    throw new ApiError(400,"username and email are required");
}

const user = await User.findOne({
    $or:[{username},{email}]
})

if (!user) {
    throw new ApiError(404,"User not exist and not found");
}

const isPasswordValid = await user.isPasswordCorrect(password);

if (!isPasswordValid) {
    throw new ApiError(401,"Invalid user credentials");
}

 const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)

const loggedInUser =  User.findById(user._id).select("-password -refreshToken")


const options ={
    httpOnly :true, 
    secure :true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
          user:loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
)

)


})

const logoutUser = asyncHandler(async(req,res)=>{
// remove cookies
// remove refresh token
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            "refreshToken":""
     }
    },
{
    new:true
}
)
const options ={
    httpOnly :true, 
    secure :true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out successfully"))


})


const refreshAccessToken = asyncHandler(async(req,res)=>{
  // get refresh token from cookie
    // find user by id
    // check if refresh token is valid
    // generate new access token
    // send new access token in response
    // update refresh token in db
    // return response
   const incomingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
    throw new ApiError(401,"Unauthorized request")
   }

 try {
     const decodedToken =- jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id)
   
     if (!user) {
       throw new ApiError(401,"Invalid refresh Token")
      }
   
   if (incomingRefreshToken!== user.refreshToken) {
       throw new ApiError(401,"refresh Token is expired or used")
   }
   const options ={
       httpOnly :true,
       secure :true
   }
   
   
   const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
   
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
       new ApiResponse(200,{},"Access Token refreshed successfully")
   )
 } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh Token")
 }


})





export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}