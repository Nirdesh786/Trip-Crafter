import express from "express";
import {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} from "../controllers/busController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getBuses).post(protect, adminOnly, createBus);
router
  .route("/:id")
  .get(getBusById)
  .put(protect, adminOnly, updateBus)
  .delete(protect, adminOnly, deleteBus);

export default router;
