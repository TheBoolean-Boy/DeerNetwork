import { v2 as cloudinary } from "cloudinary"
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

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

    const userLikedPost = post.likes.includes(userId);
    if(userLikedPost){
      await post.updateOne({_id:postId}, {$pull: {likes: userId}})
      res.status(200).json({message:"Post disliked successfully"})
    }

    

  } catch (error) {
    console.log(`Error is likeUnlikePost controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}