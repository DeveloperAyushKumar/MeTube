import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {Tweet} from "../models/tweet.model.js"
import { ApiResponse } from "../utils/ApiResponse";

const createTweet=asyncHandler(async (req,res)=>{
    const userId=req.user._id; // verifyJwt ensueres user is valid 
    const content =req.body.content;
    if(!content) throw new ApiError(400,"Content can not be empty")
        const tweet = await Tweet.create({
                content ,
                owner:userId
        })
        if(!tweet) throw new ApiError(500,"could not create a tweet , please try again later");
        res.status(200).json(new ApiResponse(200,tweet));


})
const getUserTweets=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const tweets=await Tweet.find({owner:userId});
    res.status(200).json(new ApiResponse(200,tweets));


})
const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetId,content}=req.body;
    if(!tweetId)throw new ApiError(400,"tweet id is missing");
    if(!content)throw new ApiError(400,"content is missing");
    const newTweet =await Tweet.findByIdAndUpdate(tweetId,{
        content
    },{new:true});
    if(!newTweet)throw new ApiError(500,"Could not update tweet, please try again later");
    res.status(200).json(new ApiResponse(200,newTweet));
})
const deleteTweet =asyncHandler(async(req,res)=>{
const tweetId=req.query.tweetId;
if(!tweetId)new ApiError(400,"tweet id is missing")
await Tweet.findByIdAndDelete(tweetId);
res.status(200).json(new ApiResponse(200,"tweet deleted successfully"))
})
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}