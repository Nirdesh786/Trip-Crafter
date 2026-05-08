import Bus from "../models/Bus.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
export const getBuses = async (req, res) => {
  try {
    const query = {};
    const parsedLimit = Number.parseInt(req.query.limit || "200", 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 200;
    const origin = req.query.origin?.trim();
    const destination = req.query.destination?.trim();

    // Prefix search is less expensive than contains search on larger datasets
    if (origin) query.origin = { $regex: `^${escapeRegex(origin)}`, $options: "i" };
    if (destination) query.destination = { $regex: `^${escapeRegex(destination)}`, $options: "i" };

    const buses = await Bus.find(query)
      .select(
        "operatorName busType origin destination departureTime arrivalTime pricePerSeat totalSeats availableSeats images"
      )
      .sort({ departureTime: 1 })
      .limit(limit)
      .lean();

    res.set("Cache-Control", "public, max-age=60");
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).lean();
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.set("Cache-Control", "public, max-age=120");
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bus
// @route   POST /api/buses
// @access  Private/Admin
export const createBus = async (req, res) => {
  try {
    const {
      operatorName,
      busType,
      origin,
      destination,
      departureTime,
      arrivalTime,
      pricePerSeat,
      totalSeats,
      images,
    } = req.body;

    const bus = new Bus({
      operatorName,
      busType,
      origin,
      destination,
      departureTime,
      arrivalTime,
      pricePerSeat,
      totalSeats,
      availableSeats: totalSeats, // Initially, all seats are available
      images,
      createdBy: req.user._id,
    });

    const createdBus = await bus.save();
    res.status(201).json(createdBus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a bus
// @route   PUT /api/buses/:id
// @access  Private/Admin
export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
      bus.operatorName = req.body.operatorName || bus.operatorName;
      bus.busType = req.body.busType || bus.busType;
      bus.origin = req.body.origin || bus.origin;
      bus.destination = req.body.destination || bus.destination;
      bus.departureTime = req.body.departureTime || bus.departureTime;
      bus.arrivalTime = req.body.arrivalTime || bus.arrivalTime;
      bus.pricePerSeat = req.body.pricePerSeat || bus.pricePerSeat;
      
      // If total seats are updated, carefully update available seats logic if needed
      if (req.body.totalSeats) {
          const diff = req.body.totalSeats - bus.totalSeats;
          bus.totalSeats = req.body.totalSeats;
          bus.availableSeats = bus.availableSeats + diff;
      }
      
      if (req.body.images) bus.images = req.body.images;

      const updatedBus = await bus.save();
      res.json(updatedBus);
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a bus
// @route   DELETE /api/buses/:id
// @access  Private/Admin
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (bus) {
      await bus.deleteOne();
      res.json({ message: "Bus removed" });
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
