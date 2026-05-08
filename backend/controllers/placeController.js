import Place from "../models/Place.js";

// @desc    Get all places (with filters)
// @route   GET /api/places
export const getPlaces = async (req, res) => {
  try {
    const query = {};
    const parsedLimit = Number.parseInt(req.query.limit || "200", 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 200;

    if (req.query.state) {
      query.state = req.query.state;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.popular) {
      query.popular = req.query.popular === "true";
    }

    const places = await Place.find(query)
      .select("name country state category description imageUrl popular")
      .sort({ popular: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.set("Cache-Control", "public, max-age=60");
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single place
// @route   GET /api/places/:id
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).lean();

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    res.set("Cache-Control", "public, max-age=120");
    res.status(200).json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create place
// @route   POST /api/places
export const createPlace = async (req, res) => {
  try {
    const { name, state, category, description, imageUrl, popular, activities } = req.body;

    const place = new Place({
      name,
      country: "India", // force India
      state,
      category,
      description,
      imageUrl,
      popular,
      activities,
    });

    const createdPlace = await place.save();
    res.status(201).json(createdPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update place
// @route   PUT /api/places/:id
export const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    place.name = req.body.name || place.name;
    place.state = req.body.state || place.state;
    place.category = req.body.category || place.category;
    place.description = req.body.description || place.description;
    place.imageUrl = req.body.imageUrl || place.imageUrl;
    place.popular =
      req.body.popular !== undefined ? req.body.popular : place.popular;
    place.activities = req.body.activities || place.activities;

    place.country = "India"; // enforce

    const updatedPlace = await place.save();
    res.status(200).json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete place
// @route   DELETE /api/places/:id
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    await place.deleteOne();
    res.status(200).json({ message: "Place removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import places
// @route   POST /api/places/import
export const importPlaces = async (req, res) => {
  try {
    const placesToImport = req.body.places;

    if (!Array.isArray(placesToImport) || placesToImport.length === 0) {
      return res.status(400).json({ message: "Invalid places array" });
    }

    // enforce India for all
    const updatedPlaces = placesToImport.map((place) => ({
      ...place,
      country: "India",
    }));

    const createdPlaces = await Place.insertMany(updatedPlaces);

    res.status(201).json(createdPlaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
