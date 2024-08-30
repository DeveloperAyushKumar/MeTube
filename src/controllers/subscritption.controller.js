import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscribtion } from "../models/subscribtion.model.js";
import { ApiError,ApiResponse } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const toggleSubscription =asyncHandler(async (req,res)=>{
    const {channelId}=req.query;
    const user_id=req.user._id;
if(channelId===user_id) throw new ApiError(400,"channel can not be self subscribed")
    if(!channelId)throw new ApiError(400,"channelId is missing");
    if(!user_id)throw new ApiError(400,"Unauthorized access");
    const subscription= await Subscribtion.find({subscriber:user_id,channel:channelId});
    if(!subscription){
       const newSubscription=  Subscribtion.create({
            subscriber:user_id,
            channel:channelId
        })
        res.status(200).json(200,newSubscription);
    }
    else{
        await Subscribtion.deleteOne({subscriber:user_id,channel:channelId});
        res.status(200).json(200);
    }

})
const getUserChannelSubcribers=asyncHandler(async(req,res)=>{
    const channelUserName=req.query.channel;
    if(!channelUserName.trim())throw new ApiError(400,"channelId is missing");
    const channel =await User.findOne({username:channelUserName});
    if(!channel)throw new ApiError(400,"No channel exist")
    const channelId=channel._id;

    const channels=Subscribtion.aggregate([{
        $match:{
            channel:channelId
        }
    },{
        $lookup:{
            from:"users",
            localField:"subscriber",
            foreignField:"_id",
            as:"subscriber"
        }
    },{
       $project:{
        channel:0,

       }
    }
])
res.status(200).json(new ApiResponse(200,channels))
})
const getSubscribedChannels=asyncHandler(async(req,res)=>{
    const channelUserName=req.query.channel;
    if(!channelUserName.trim())throw new ApiError(400,"channelId is missing");
    const channel =await User.findOne({username:channelUserName});
    if(!channel)throw new ApiError(400,"No channel exist")
    const channelId=channel._id;
    const channels=Subscribtion.aggregate([{
        $match:{
            subscriber:channelId
        }
    },{
        $lookup:{
            from:"users",
            localField:"channel",
            foreignField:"_id",
            as:"subscriberTo"
        }
    },{
       $project:{
        subscriber:0,

       }
    }
])
res.status(200).json(new ApiResponse(200,channels))

})

export {
        toggleSubscription,
        getSubscribedChannels,
        getUserChannelSubcribers
}