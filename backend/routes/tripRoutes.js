const express = require("express");

const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/tripController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// =========================
// TRIP ROUTES
// =========================

router.post("/", createTrip);

router.get("/", getTrips);

router.get("/:id", getTrip);

router.put("/:id", updateTrip);

router.delete("/:id", deleteTrip);

// =========================
// EXPENSE ROUTES
// =========================

router.post("/:id/expenses", addExpense);

router.put(
  "/:id/expenses/:expenseId",
  updateExpense
);

router.delete(
  "/:id/expenses/:expenseId",
  deleteExpense
);

module.exports = router;