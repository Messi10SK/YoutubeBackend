import { ApiError } from "../utils/ApiError.js";
import {asyncHandler}  from "../utils/asyncHandler.js"
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


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    // get user id from req.user
    // get old password from req.body
    // get new password from req.body
    // find user by id
    // check if old password is correct
    // update password
    // return response
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Old password")
    }

    user.password = newPassword
   await  user.save({validateBeforeSave:false})
    

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password changed successfully"))



})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    // get user id from req.user
    // get new details from req.body
    // find user by id
    // update details
    // return response
    const {fullName,username,email} = req.body// if file update alag controller rakho better approach like if user want to update image   
    if (!fullName||!email) {
        throw new ApiError(400,"All field are required")
    }

   const user =  User.findByIdAndUpdate(
        req.user?._id,
        {
            // mongo db operators 
            $set:{
                fullName,
                username,
                email : email
            }
        },
        {new:true},  
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))
}) 


const updateUserAvatar = asyncHandler(async(req,res)=>{
    // get user id from req.user
    // get new avatar from req.file
    // find user by id
    // update avatar
    // return response


    const avatarLocalPath = req.file?.path;
if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is missing")
}

const avatar = await uploadOnCloudinary
(avatarLocalPath)

if (!avatar.url) {
    throw new ApiError(400,"error while uploading on Avatar")

}

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true},
    
    
    ).select("-password")



    return res.status(200)
    .json(new ApiResponse(200,user,"Avatar Image updated successfully"))

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    // get user id from req.user
    // get new avatar from req.file
    // find user by id
    // update avatar
    // return response


    const coverImageLocalPath = req.file?.path;
if (!coverImageLocalPath ) {
    throw new ApiError(400,"coverImageLocalPath  file is missing")
}

const coverImage = await uploadOnCloudinary
(coverImageLocalPath)

if (!coverImage.url) {
    throw new ApiError(400,"error while uploading on CoverImage")

}

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            coverImage:coverImage.url
        }
    },
    {new:true},
    
    
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
 const {username} =   req.params
 if (!username?.trim()) {
    throw new ApiError(400,"username is missing")
 }

const channel =await  User.aggregate([
    {
        $match:{
            username:username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"   
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
               $size:"$subscribedTo" 
            },
            isSubscribed:{
                $cond:{
                    if:{
                        $in:[
                            req.user?._id,"$subscribers.subscriber"]},
                            then:true,
                            else:false
                }


            }
        }
    },
    {
        $project:{
            fullName:1,
            username:1,
            subscribersCount :1,
            channelsSubscribedToCount :1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1,

        }
    }
])  // return array of objects   aggregate pipelines

if (!channel?.length) {
    throw new ApiError(404,"channel not found and not exists")
}

return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User Channel profile fetched successfully")
)




 })

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
       { $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
         {
       $lookup:{
          from:"videos",
          localField:"watchHistory",
          foreignField:"_id",
          as:"watchHistory",
          pipeline:[
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[{
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            _id:0
                        }
                    },
                    {
                         $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                         }
                    }
                ]
                }
            }
          ]
         }
         },

    ])

  return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,"User Watch history fetched Successfully")
  )
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}