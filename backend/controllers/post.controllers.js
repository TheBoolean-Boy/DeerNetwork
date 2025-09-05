import { v2 as cloudinary } from "cloudinary"
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async(req, res) => {
  try {
    const {text} = req.body;
    let {img} = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    if(!text && !img){
      return res.status(400).json({error:"Post Something! Atleast a text or image"})
    }

    if(img){
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = await Post({
      user:userId,
      text,
      img
    })

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error is createPost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const deletePost = async(req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if(!post){
      return res.status(404).json({error:"Post not found"})
    }

    if(post.user.toString() !== req.user._id.toString()){
      return res.status(401).json({error:"You are not authorized to delete this post"})
    }

    if(post.img){
      const imgId = post.img.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(req.params.id)

    res.status(200).json({message:"Post deleted successfully"})
  } catch (error) {
    console.log(`Error is deletePost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const commentOnPost = async(req, res) => {
  try{
    const {text} = req.body
    const userId = req.user._id
    const postId = req.params.id

    if(!text){
      return res.status(400).json({error:"Text field is required"})
    }

    const post = await Post.findById(postId)
    if(!post){
      return res.status(401).json({error:"Post not found"})
    }
    
    const comment = {user: userId, text}
    
    post.comments.push(comment)

    await post.save()

    res.status(200).json(post)
     
  }catch{
    console.log(`Error is commentOnPost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const likeUnlikePost = async(req, res) => {
  try {
    const userId = req.user._id;
    const {id:postId} = req.params;

    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({error:"Post not found"})
    }

    const userLikedPost = post.likes.includes(userId)

    console.log(userLikedPost)
    if(userLikedPost){
      //already liked so remove the like
      await Post.updateOne({_id:postId}, {$pull: {likes: userId}})
      await User.updateOne({_id:userId}, {$pull: {likedPosts: postId}})
      res.status(200).json({message:"Post unliked successfully"})
    }else{
      //not yet liked so add the like
      post.likes.push(userId)
      await User.updateOne({_id:userId}, {$push: {likedPosts: postId}})
      await post.save();

      //send a notification about getting a like on ya post
      const notification = new Notification({
        from: userId,
        to: post.user,
        type:"like"
      })
      await notification.save()
      res.status(200).json({message:"Post liked successfully"})
    }

  } catch (error) {
    console.log(`Error is likeUnlikePost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const getAllPost = async(req, res) =>{
  try {
    const allPosts = await Post.find().sort({createdAt: -1}).populate({
      path:"user",
      select:"-password"
    })
    .populate({
      path:"comments.user",
      select:"-password -email"
    })

    if(allPosts.length === 0){
      return res.status(200).json([])
    }

    res.status(200).json(allPosts);
  } catch (error) {
    console.log(`Error is likeUnlikePost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const getLikedPost = async(req, res) =>{
  try {
    const {id:userId} = req.params;

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    const likedPost = await Post.find({_id: { $in: user.likedPosts }}).populate({
      path:"user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select:"-password"
    })
    res.status(200).json(likedPost)
  } catch (error) {
    console.log(`Error is getLikedPost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const getFollowingPost = async(req, res)=> {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    const following = user.following

    const feedPost = await Post.find({ user: { $in:following }}).sort({createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(feedPost)
  } catch (error) {
    console.log(`Error is getFollowingPost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const getUserPost = async(req, res)=> {
  try {
    const {username} = req.params;
    const user = await User.findOne({username})
    console.log(user)
    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    const posts = await Post.find({ user:user._id }).sort({createdAt: -1})
    .populate({
      path:"user",
      select:"-password"
    })
    .populate({
      path:"comments.user",
      select:"-password"
    })
    res.status(200).json(posts);
  } catch (error) {
    console.log(`Error is getUserPost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}