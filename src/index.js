
import express from "express"
import connectDB from "./db/index.js";
import mongoose from "mongoose"
import dotenv from "dotenv";
import { DB_NAME } from "./constant.js";
import { app } from "./app.js";
dotenv.config(
  {paht:"./env"}
);


// const app=express();
connectDB().then(()=>{
  app.listen(process.env.PORT||8000,()=>{
    console.log(`server is listening on ${process.env.PORT||8000}`)

  })
  app.on("error",(error)=>{
    console.log("error from express", error);
  })

}).catch((error)=>{
  console.log("mongodb connection error",error);
})

// ;(async()=>{
//     try{
//         mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR from express",error)
//             throw error;
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("App is listening")
//         })

//     }
//     catch (error){
//         console.log("ERROR",error)
//         throw error
//     }

// })()
