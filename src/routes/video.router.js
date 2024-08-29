import {Router} from "express";
import { deleteVideo, getVideosByOwnerId, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();
router.route("/publish-video").post(verifyJWT,upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }

]), publishVideo)
router.route("/user-videos").get(verifyJWT, getVideosByOwnerId)
router.route("/update-video").post(upload.single("thumbnail"), updateVideo)
router.route("/delete-video").get( deleteVideo)
router.route("/toggle-status").get( togglePublishStatus)


export default  router
