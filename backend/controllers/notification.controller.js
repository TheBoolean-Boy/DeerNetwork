import Notification from "../models/notification.model.js"


export const getNotification = async(req, res) => {
  try {
    const userId = req.user._id
    const notification = await Notification.find({to:userId}).populate({
      path: "from",
      select:"username profileImg"
    })
    await Notification.updateMany({to:userId}, {read:true});

    res.status(200).json(notification)
  } catch (error) {
    console.log(`Error is getNotification controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}


export const deleteNotification = async(req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({to:userId});

    res.status(200).json({message: "Notifications deleted successfully"})
  } catch (error) {
    console.log(`Error is deleteNotification controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}

export const deleteNotif = async(req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId)
    if(!notification){
      return res.status(404).json({error:"Notification not found"})
    }

    if(notification.to.toString() !== userId.toString()){
      return res.status(403).json({error:"Unauthorized - you can't delete this notification"})
    }

    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({message: "Notification deleted successfully"})
  } catch (error) {
    console.log(`Error is deleteNotif controller ${error}`)
    res.status(500).json(`Internal server error ${error.message}`)
  }
}