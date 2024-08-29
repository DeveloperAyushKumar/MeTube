import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
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
    // console.log(req.files);
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
        thumbnailPublicId:cloudinaryThumbnailResponse.public_id,
        videoFile:cloudinaryVideoResponse.url,
        videoFilePublicId:cloudinaryVideoResponse.public_id,
        duration:cloudinaryVideoResponse.duration,
        owner:userId
    })
if(!video) throw new ApiError(500,"Could not create video model");
    console.log(video)
res.status(200).json(new ApiResponse(200,video));
})
const getVideosByOwnerId  =asyncHandler(async(req,res)=>{
    const user_id=req.user._id;
    if(!user_id)throw new ApiError(400,"No user Found ")
    const videos= await Video.find({owner:user_id});
    if(!videos)throw new ApiError(400, "No videos can be found")
        res.status(200).json(new ApiResponse(200,videos));


    
})
const updateVideo=asyncHandler(async (req,res)=>{
const {title,description,videoId}=req.body;
// console.log(req.file);
const newThumbnailLocalPath=req.file.path;
if(!videoId)throw new ApiError(400,"videoId is missing")
    let video=await Video.findById(videoId);
if(!video)throw new ApiError(400,"video does not exist");
if(title){
    video.title=title;
    video=await video.save({validateBeforeSave:false});
}
if(description){
    video.description=description;
    video=await video.save({validateBeforeSave:false});
}
if(newThumbnailLocalPath){
    await deleteFromCloudinary(video.thumbnailPublicId)
    console.log("working");
    const newThumbnailCloudinary=await uploadOnCloudinary(newThumbnailLocalPath,video.thumbnailPublicId);
    if(!newThumbnailCloudinary) throw new ApiError(500,"Could not update on cloudinary")

}
res.status(200).json(new ApiResponse(200, video));
})

const deleteVideo=asyncHandler(async (req,res)=>{
    const {videoId}=req.query
    if(!videoId)throw new ApiError(400,"video Id is missing")
        const video=await Video.findById(videoId);
    if(!video)throw new ApiError(400, "No video exist")

    await deleteFromCloudinary(video.thumbnailPublicId);
    await deleteFromCloudinary(video.videoFilePublicId);
    await video.deleteOne({_id:video._id});

    res.status(200).json(new ApiResponse(200,"Video removed successfully"))
})
const togglePublishStatus =asyncHandler(async (req, res)=>{
    console.log(req);
    

    const {videoId}=req.query;
    if(!videoId)throw new ApiError(400 ,"videoId is missing")
    const video= await Video.findById(videoId);
    if(!video) throw new ApiError(400,"Video does not exist");
    video.isPublished=!video.isPublished;
    await video.save();
    res.status(200).json(new ApiResponse(200,"status updated"))
})
export {publishVideo,getVideosByOwnerId,updateVideo,deleteVideo, togglePublishStatus};