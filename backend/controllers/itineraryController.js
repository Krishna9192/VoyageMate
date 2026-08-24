const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");

const createItineraryDay = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { day, date } = req.body;

    const trip = await Trip.findOne({
      _id: tripId,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (!day || !date) {
      return res.status(400).json({
        success: false,
        message: "Day and date are required",
      });
    }

    const existingDay = await Itinerary.findOne({
      trip: tripId,
      day,
    });

    if (existingDay) {
      return res.status(400).json({
        success: false,
        message: "This itinerary day already exists",
      });
    }

    const itinerary = await Itinerary.create({
      trip: tripId,
      user: req.user._id,
      day,
      date,
      activities: [],
    });

    res.status(201).json({
      success: true,
      message: "Itinerary day created",
      itinerary,
    });
  } catch (error) {
    console.error("Create itinerary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create itinerary",
    });
  }
};

const getItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;

    const itinerary = await Itinerary.find({
      trip: tripId,
      user: req.user._id,
    }).sort({ day: 1 });

    res.status(200).json({
      success: true,
      itinerary,
    });
  } catch (error) {
    console.error("Get itinerary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch itinerary",
    });
  }
};

const addActivity = async (req, res) => {
  try {
    const { tripId, dayId } = req.params;

    const itinerary = await Itinerary.findOne({
      _id: dayId,
      trip: tripId,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found",
      });
    }

    const {
      title,
      location,
      time,
      description,
      cost,
      category,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Activity title is required",
      });
    }

    itinerary.activities.push({
      title,
      location: location || "",
      time: time || "",
      description: description || "",
      cost: cost || 0,
      category: category || "activity",
    });

    await itinerary.save();

    res.status(201).json({
      success: true,
      message: "Activity added",
      itinerary,
    });
  } catch (error) {
    console.error("Add activity error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to add activity",
    });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { tripId, dayId, activityId } = req.params;

    const itinerary = await Itinerary.findOne({
      _id: dayId,
      trip: tripId,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found",
      });
    }

    const activity = itinerary.activities.id(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const {
      title,
      location,
      time,
      description,
      cost,
      category,
    } = req.body;

    activity.title = title ?? activity.title;
    activity.location = location ?? activity.location;
    activity.time = time ?? activity.time;
    activity.description =
      description ?? activity.description;
    activity.cost = cost ?? activity.cost;
    activity.category = category ?? activity.category;

    await itinerary.save();

    res.status(200).json({
      success: true,
      message: "Activity updated",
      itinerary,
    });
  } catch (error) {
    console.error("Update activity error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update activity",
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { tripId, dayId, activityId } = req.params;

    const itinerary = await Itinerary.findOne({
      _id: dayId,
      trip: tripId,
      user: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary day not found",
      });
    }

    const activity = itinerary.activities.id(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    activity.deleteOne();

    await itinerary.save();

    res.status(200).json({
      success: true,
      message: "Activity deleted",
      itinerary,
    });
  } catch (error) {
    console.error("Delete activity error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete activity",
    });
  }
};

module.exports = {
  createItineraryDay,
  getItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
};