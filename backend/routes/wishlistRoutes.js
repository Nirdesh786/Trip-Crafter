import express from "express";
import {
  addToWishlist,
  checkWishlistPlace,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getWishlist);
router.route("/check/:placeId").get(protect, checkWishlistPlace);
router.route("/:placeId").post(protect, addToWishlist).delete(protect, removeFromWishlist);

export default router;
