const express = require("express");

const {
  createItineraryDay,
  getItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/itineraryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/trips/:tripId",
  createItineraryDay
);

router.get(
  "/trips/:tripId",
  getItinerary
);

router.post(
  "/trips/:tripId/days/:dayId/activities",
  addActivity
);

router.put(
  "/trips/:tripId/days/:dayId/activities/:activityId",
  updateActivity
);

router.delete(
  "/trips/:tripId/days/:dayId/activities/:activityId",
  deleteActivity
);

module.exports = router;