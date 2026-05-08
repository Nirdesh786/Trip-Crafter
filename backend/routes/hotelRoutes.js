import express from "express";
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getHotels)
  .post(protect, adminOnly, createHotel);

router
  .route("/:id")
  .get(getHotelById)
  .put(protect, adminOnly, updateHotel)
  .delete(protect, adminOnly, deleteHotel);

export default router;
