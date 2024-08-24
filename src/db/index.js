import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

const connectDB=async()=>{
    try {
        const response =await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(` \n mongoose db connected  ${response}`)

        
    } catch (error) {
         console.log("error occured in db index.js",error)
        process.exit(1);
    }
}
export default connectDB