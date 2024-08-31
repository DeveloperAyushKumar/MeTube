import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())
// import routes
import userRouter from "./routes/user.router.js"
app.use("/users",userRouter)

import videoRouter from "./routes/video.router.js"
app.use("/video",videoRouter)

import subscriptionRouter from "./routes/subscription.route.js"
app.use('/subscription',subscriptionRouter);

import tweetRouter from "./routes/tweet.router.js"
app.use("/tweet",tweetRouter)

export {app}