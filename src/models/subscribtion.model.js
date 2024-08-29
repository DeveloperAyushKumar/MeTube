import mongoose from 'mongoose'
const subscribtionModel=new mongoose.Schema({
    subscriber:{
        type:mongoose.Types.Schema,
        ref:"User"
    },
    channel:{
        type:mongoose.Types.Schema,
        ref:"User"
    }
},{timestamps:true});
export const Subscribtion=mongoose.model("Subscription",subscribtionModel);