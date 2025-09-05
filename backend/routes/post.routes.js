import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { commentOnPost, createPost, deletePost, getAllPost, getFollowingPost, getLikedPost, getUserPost, likeUnlikePost } from "../controllers/post.controllers.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPost)
router.get("/likes/:id", protectRoute, getLikedPost)
router.get("/following", protectRoute, getFollowingPost)
router.get("/user/:username", protectRoute, getUserPost)

router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/comment/:id", protectRoute, commentOnPost)
router.delete("/:id", protectRoute, deletePost)

export default router