import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscribtion } from "../models/subscribtion.model.js";
import { ApiError,ApiResponse } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const toggleSubscription =asyncHandler(async (req,res)=>{

})
const getUserChannelSubcribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.query;
    const user_id=req.user._id;
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
const getSubscribedChannels=asyncHandler(async(req,res)=>{

})
export {toggleSubscription,
        getSubscribedChannels,
        getUserChannelSubcribers
}