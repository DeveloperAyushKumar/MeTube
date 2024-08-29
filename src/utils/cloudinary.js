import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
// import { ApiError } from "./ApiError";
cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary=async (localFilePath,publicId)=>{
    try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
            public_id:publicId
        })
        fs.unlinkSync(localFilePath);
        console.log("File uploaded", response);
        return response;

        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;

        
    }
}
const deleteFromCloudinary =async(publicId)=>{
    // if(!publicId)throw new ApiError(400,publicId )
    const result=await cloudinary.uploader.destroy(publicId,{resource_type:"image"})

}
export  {uploadOnCloudinary,deleteFromCloudinary};