import mongoose, { Schema } from "mongoose";
const playlistSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,   
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectIdl,
        ref:"video"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    decription:{
        type:String,
        required:true,
    }
},{timestamps:true})
export const PlayList=mongoose.model("PlayList",playlistSchema
)