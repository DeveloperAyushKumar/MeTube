import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
// import jwt from JsonWebTokenError
import jwt  from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshToken =async (userId)=>{
   try {
    const user=await User.findOne(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({ValidityState:false});
    return {accessToken,refreshToken};
    
   } catch (error) {
    throw new ApiError(500, "Couldn't generate Tokens"+error)
    
   }
}
const logoutUser=asyncHandler(async(req,res)=>{
    // console.log(req.user)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
  return  res.status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User logged Out"))

})
const registerUser= asyncHandler(async (req,res)=>{
    //Logic of user registeration
    // get user details from frontend
    //validation -not empty
    //check if usr already exists:username , email
    // check for images, check for avatar
    // upload them to cloudniary , avatar 
    // create user object - create entry in db
    //remove  password and refresh token field from response
    // check for user creation
    // return res
    // extract the data from request
    const data= req.body;
    const {email,username, fullName, password}=data;
    // console.log(data);

    // checking any fielld id empty or not 
    if([fullName,email,username,password].some((field)=>(
        field?.trim()===""
    ))){
        throw new ApiError(400,"All fields are required ")
    }
    // check for existed user
    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })
    // console.log("workingone")
    if(existedUser){
        throw new ApiError(409,"User is already existed")
    }
    console.log("working")
    //check for images:avatar
    const avatarLocalFilePath=req.files?.avatar[0]?.path;

    let coverImageLocalFilePath;
    console.log(req.files);
    if(req.files.coverImage&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0)
   coverImageLocalFilePath =req.files?.coverImage[0]?.path
    if(!avatarLocalFilePath){
        throw new ApiError(400,"Avatar file is required")

    }
    //upload images to cloudinary

    const avatar =await uploadOnCloudinary(avatarLocalFilePath);
    const coverImage=await uploadOnCloudinary(coverImageLocalFilePath)
    // console.log("working");
    // console.log(avatarLocalFilePath);
    if(!avatar){
        throw new ApiError(400, "Avatar image can not be uploaded")

    }
    // console.log(avatar.url);
 // create user 
 const user= await User.create({
    username:username.toLowerCase(),
    fullName,
    email,
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",


 })
 //fetch the created user

//  console.log("working 1")
//  console.log(user);
 const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
 )
//  console.log("working 2")
 // checking any db error that stoped the creation of user 
 if(!createdUser)
{
    console.log("user can not be found")
    throw new ApiError(500, "User can not be created ")

}
console.log("working 3")
return res.status(201).json(
    new ApiResponse(200,createdUser,"User is registred successfully")
)
    console.log(email);
    res.status(200).json({
        message:"ok"
    })
})
const loginUser=asyncHandler(async (req,res)=>{
const {email,password}=req.body;
console.log(req)
if(!email)throw new ApiError(400,"Email is required");
const user=await User.findOne({email})
if(!user)throw new ApiError(404,"User doesn't exist")
const isPasswordValidated=await user.isPasswordCorrect(password);
if(!isPasswordValidated)throw new ApiError(401,"Invalid user Credentials")
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
const loggedInUser=await User.findOne(user._id).select("-password -refreshToken");
const options={
    httpOnly:true,
    secure:true
}
return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "user logged in successfully"
            )
        )


})
const refreshAccessToken=asyncHandler(async (req,res)=>{
   try {
     const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;
     if(!incomingRefreshToken)throw new ApiError(401,"Refresh token is missing")
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
     if(!decodedToken)throw new ApiError(400,"Invalid referesh token");
    const user=await User.findById(decodedToken._id);
    if(!user)throw new ApiError(401,'Invalid or expired refresh token')
     if(user.refreshAccessToken!==incomingRefreshToken) throw new ApiError(401,"Unauthorized access")
         const {accessToken,newRefreshToken}=user.generateAccessAndRefreshToken();
     const options={
         httpOnly:true,
         secure:true
     }
     res.status(200)
     .cookies("accessToken",accessToken)
     .cookies("refreshToken",refreshAccessToken)
     .json(new ApiResponse(200,"new access token is generated successfully"))
     
   } catch (error) {
    throw new ApiError(500,error)
   }



})
const changeCurrentPassword =asyncHandler(async (req,res)=>{
    const user=await User.findById(req.user._id);
    const  {oldPassword,newPassword}=req.body;
    const isPasswordCorrect= user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect)throw new ApiError(400,"Old Password is Invaild")
        user.password=newPassword;
  await  user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,"Password changes Successfully"));

})

const getCurrentUser=asyncHandler (async(req,res)=>{
    // const user=await User.findById(req.user_id);
    return res.status(200).json(new ApiResponse(200,req.user))
})
const updateAccountDetails=asyncHandler(async (req,res)=>{
    const {email,fullName}=req.body;
    const user= await User.findByIdAndUpdate(req.user._id,{
        $set:{
            email:email,
            fullName:fullName,
        }
    },{new:true}).select("-password");
    return res.status(200).json(new ApiResponse(200,"fullName and email changed successfully"));


});
const updateAvatar=asyncHandler (async (req,res)=>{
    const avatarLocalFilePath=req.file?.path;
    //console.log(req.file);
    if(!avatarLocalFilePath)throw new ApiError(400,"No avatar is uploaded");
    const avatar=await uploadOnCloudinary(avatarLocalFilePath);
    if(!avatar) throw new ApiError(500,"Could not upload the avatar");
    
    const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
    },{new :true}).select("-password")
    return res.status(200).json(new ApiResponse(200,user))
});
const updateCoverImage=asyncHandler (async (req,res)=>{
    const coverImageLocalFilePath=req.file?.path;
    //console.log(req.file);
    if(!coverImageLocalFilePath)throw new ApiError(400,"No coverImage is uploaded");
    const coverImage=await uploadOnCloudinary(coverImageLocalFilePath);
    if(!coverImage) throw new ApiError(500,"Could not upload the coverImage");
    
    const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{new :true}).select("-password")
    return res.status(200).json(new ApiResponse(200,user))
})
const getUserChannelProfile=asyncHandler(async (req,res)=>{
    const {username}=req.params;
    if(!username?.trim()){
        throw new ApiError(400,"username is missing ");

    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.trim()?.toLowerCase()
            }

    },
    {
        $lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"subcriber",
            as:"subscribedTo"
        } 
    },
    {
        $addFields:{
            subscriberCount:{
                $size:"$subscribers"
            },
            subcribedToCount:{
                $size:"$subscribedTo",

            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req?.user._id,"$subscribers.subscriber" ]},
                    then :true,
                    else :false

                }
            }
        }
        
    },
    {
        $project:{
            fullName:1,
            email:1,
            username:1,
            subcribedToCount:1,
            subscriberCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,


        }
    }
])
if(channel?.length){
    throw new ApiError(400,"channel doesnot exists");
}
res.status(200).json(new ApiResponse(200,channel[0],"user channel is fetched successfully"))
})

const getWatchHistory= asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
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
                                    userName:1,
                                    avatar:1
                                }
                            }],

                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner",
                            }
                        }
                    }
                ],
                
            }
        },
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch history fetched successully"))
})

export {registerUser,loginUser,logoutUser,updateAccountDetails,updateAvatar, updateCoverImage,changeCurrentPassword,getCurrentUser,getWatchHistory,getUserChannelProfile}