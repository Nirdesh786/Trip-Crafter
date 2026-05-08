import User from "../models/User.js";
import Place from "../models/Place.js";

// @desc    Get logged in user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        select: "name state country category description imageUrl popular",
      })
      .lean();

    res.status(200).json(user?.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if place exists in wishlist
// @route   GET /api/wishlist/check/:placeId
// @access  Private
export const checkWishlistPlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    const isSaved = await User.exists({
      _id: req.user._id,
      wishlist: placeId,
    });

    res.status(200).json({ isSaved: !!isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add place to wishlist
// @route   POST /api/wishlist/:placeId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { placeId } = req.params;

    const place = await Place.findById(placeId).select("_id");
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: placeId } },
      { new: true }
    );

    res.status(200).json({ message: "Place saved to wishlist", isSaved: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove place from wishlist
// @route   DELETE /api/wishlist/:placeId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { placeId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: placeId } },
      { new: true }
    );

    res.status(200).json({ message: "Place removed from wishlist", isSaved: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
