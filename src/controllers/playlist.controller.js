import mongoose, { isValidObjectId } from "mongoose";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler";
import { PlayList } from "../models/playlist.model.js";
import { Video } from "../models/video.model";

const createPlaylist =asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const  user_id=req.user._id;
    if(!name||!description)throw new ApiError(400,"all fields are compulsory")
        const playlist =await PlayList.create({
    name,
    description,
    owner:user_id,
})
if(!playlist)throw new ApiError(500,"Could not create playlist , please try again later")
    res.status(200).json(new ApiResponse(200,playlist));
})
const addVideoToPlaylist=asyncHandler(async(req,res)=>{
const playlistId=req.query.playlistId;
const videoId=req.body.videoId;
if(!videoId)throw new ApiError(400,"video is missing");
// const video=await Video.findById(videoId);
// if(!videoId) throw new ApiError(400, "video does not exist")
const playlist=await PlayList.findById(playlistId);
playlist.updateOne({$push:{videos:videoId}});
 
})

const getChanelPlaylists=asyncHandler(async (req,res)=>{
    const userId=req.query.userId;
    if(!userId)throw new ApiError(400,"userId is missing")
    const playlists=await PlayList.find({owner:userId});
    res.stats(200).json(new ApiResponse(200,playlists));



})
const getPlaylistById=asyncHandler(async (req,res)=>{
    const playlistId=req.query.playlistId;
    if(!isValidObjectId(playlistId))throw new ApiError(400,"Invaild Playlist Id")
    const playlist=await PlayList.aggregate([{
        $match:{
            _id:playlistId
        }
    },{
        $lookup:{
            from:"videos",
            localField:"videos",
            foreignField:"_id",
            as:"videos",
        }
        
    },{
        $addFields:{
            videosCount:{
                $size:"$videos"
            }
        }
    }])
    res.status(200).json(new ApiResponse(200,playlist));

})
const removeVideoFromPlaylist=asyncHandler(async (req,res)=>{
    const {playlistId,videoId}=req.body;
    if(!isValidObjectId(playlistId)||!isValidObjectId(videoId))throw new ApiError(400,"Please provide valid Ids")
        const newPlaylist=await PlayList.findOneAndUpdate({_id:playlistId},{$pull:{videos:videoId}},{new:true});
    if (updateResult.matchedCount === 0) {
        throw new ApiError(404, "Playlist not found");
      }
    
      if (updateResult.modifiedCount === 0) {
        return res.status(200).json(new ApiResponse(200, "Video not found in playlist"));
      }
    
    res.status(200).json(new ApiResponse(200,newPlaylist));
})
const deletePlaylist=asyncHandler(async (req,res)=>{
    const playlistId=req.query.playlistId;
    if(!isValidObjectId(playlistId))throw new ApiError(400,"Invalid playlist Id");
    const deletedPlaylist=await PlayList.findByIdAndDelete(playlistId);
    if(!deletePlaylist)throw new ApiError(404,"Playlist Not found");
    res.status(200).json(new ApiResponse(200,"Playlist deleted Successfully"));

})
const updatePlaylist=asyncHandler(async (req,res)=>{
    const {name,description,playlistId}=req.body;
    if(!playlistId)throw new ApiError(400,"playlist Id is missing");
    if(!isValidObjectId(playlistId))throw new ApiError(400,"playlist Id is Invalid");
    if(!name)throw new ApiError(400,"name is missing");
    if(!description)throw new ApiError(400,"description is missing");
    const updatedPlaylist=await PlayList.findByIdAndUpdate(playlistId,{name,description},{new:true});
    if(!updatedPlaylist)throw new ApiError(404,"playlist does not exist");
    res.status(200).json(new ApiResponse(200,updatedPlaylist));


})
export {
    createPlaylist,
    getChanelPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}