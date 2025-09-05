import User from "../models/user.model.js";


export const getUserProfile = async(req, res) =>{
  const {username} = req.params;
  try {
    const user = await User.findOne({username}).select("-password");
    if(!user){
      return res.status(400).json({error: "User not found"})
    }

    res.status(200).json(user)
  } catch (error) {
    console.log(`Error in getUserProfile controller: ${error.message}`);
    res.status(500).json({error: `Internal server error: ${error.message}`})
  }
}

export const followUnfollowUser = async(req, res)=> {
  try {
    const {id} = req.params;
    const userToModify = await User.findById(id)
    const currentUser = await User.findById(req.user._id)

    if(id === req.user._id.toString()){
      return res.status(400).json({error:"You can't follow/unfollow yourself"})
    }

    if(!currentUser || !userToModify){
      return res.status(400).json({error:"User not found"})
    }

    //Now we check if the user is already following the user
    const isFollowing = await currentUser.following.includes(id)

    if(isFollowing){
      //Already following so he will unfollow
      await User.findByIdAndUpdate(id, {$pull: {followers:req.user._id}})
      await User.findByIdAndUpdate(req.user._id, {$pull : {following: id}})

      //send notifs to users
      const newNotification = new 
      res.status(200).json({message: "User unfollowed successfully"})
    }else{
      //Not following so he will follow
      await User.findByIdAndUpdate(id, {$push: {followers:req.user._id} })
      await User.findByIdAndUpdate(req.user._id, { $push: {following: id} })
      res.status(200).json({message:"User followed successfully"})
    }
  } catch (error) {
    console.log(`Error in getUserProfile controller: ${error.message}`);
    res.status(500).json({error: `Internal server error: ${error.message}`})
  }
}