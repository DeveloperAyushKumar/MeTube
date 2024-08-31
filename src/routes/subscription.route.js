import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubcribers, toggleSubscription } from "../controllers/subscritption.controller";


const router =Router();
router.route("/toggle-subs").get(verifyJWT,toggleSubscription);
router.route("/channel-subscibers").get(getUserChannelSubcribers);
router.route("/subscribed-channels").get(getSubscribedChannels);


export default router