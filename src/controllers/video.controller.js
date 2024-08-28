import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { response } from "express";

// create 
const publishVideo =asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    const userId=req.user._id;// using verifyJwt
    const localVideoPath=req.files.video[0].path;
    const localThumbnailPath=req.files.thumbnail[0].path;
    console.log(req.files);
    if(!localThumbnailPath)throw new ApiError(400,"Thumbnail is missing");
    if(!localVideoPath)throw new ApiError(400,"Video is missing");

    const cloudinaryVideoResponse=await uploadOnCloudinary(localVideoPath);
    const cloudinaryThumbnailResponse=await uploadOnCloudinary(localThumbnailPath);
    if(!cloudinaryThumbnailResponse)throw new ApiError(400,"Could not upload thumbnail on cloudinary");
    if(!cloudinaryVideoResponse)throw new ApiError(400,"Could not upload video on cloudinary");

    const  video =await Video.create({
        title,
        description,
        thumbnail:cloudinaryThumbnailResponse.url,
        videoFile:cloudinaryVideoResponse.url,
        duration:cloudinaryVideoResponse.duration,
        owner:userId
    })
if(!video) throw new ApiError(500,"Could not create video model");
    console.log(video)
res.status(200).json(new ApiResponse(200,video));
})
export {publishVideo};