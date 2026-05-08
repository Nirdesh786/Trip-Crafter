import Hotel from "../models/Hotel.js";

// @desc    Get all hotels
// @route   GET /api/hotels
export const getHotels = async (req, res) => {
  try {
    const query = {};
    const parsedLimit = Number.parseInt(req.query.limit || "200", 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 200;

    // Filter by specific place ID if provided
    if (req.query.place) {
      query.place = req.query.place;
    }

    if (req.query.isPopular) {
      query.isPopular = req.query.isPopular === "true";
    }

    const hotels = await Hotel.find(query)
      .select("name location images pricePerNight rating numReviews amenities roomsAvailable isPopular")
      .sort({ isPopular: -1, rating: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.set("Cache-Control", "public, max-age=60");
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("place", "name state country")
      .lean();

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.set("Cache-Control", "public, max-age=120");
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create hotel
// @route   POST /api/hotels
export const createHotel = async (req, res) => {
  try {
    const hotel = new Hotel({
      ...req.body,
      createdBy: req.user._id,
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    Object.assign(hotel, req.body);

    const updatedHotel = await hotel.save();
    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    await hotel.deleteOne();
    res.status(200).json({ message: "Hotel removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
