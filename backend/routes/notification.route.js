import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { deleteNotif, deleteNotification, getNotification } from "../controllers/notification.controller.js";


const router = express.Router();


router.get("/", protectRoute, getNotification)
router.delete("/", protectRoute, deleteNotification)
router.delete("/:id", protectRoute, deleteNotif)

export default router;