import express from "express";
import {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  importPlaces,
} from "../controllers/placeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getPlaces)
  .post(protect, adminOnly, createPlace);

router.route("/import")
  .post(protect, adminOnly, importPlaces);

router.route("/:id")
  .get(getPlaceById)
  .put(protect, adminOnly, updatePlace)
  .delete(protect, adminOnly, deletePlace);

export default router;