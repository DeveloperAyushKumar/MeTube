import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getChanelPlaylists, getPlaylistById, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller";
const router=Router()
router.route("create-playlist").post(verifyJWT,createPlaylist);
router.route("add-to-playlist").get(addVideoToPlaylist);
router.route("playlist-by-id").get(getPlaylistById);
router.route("remove-from-playlist").post(removeVideoFromPlaylist);
router.route("delete-playlist").get(deletePlaylist);
router.route("update-playlist").post(updatePlaylist)
export default router;