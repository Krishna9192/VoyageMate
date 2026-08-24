const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");

const createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      description,
      coverImage,
    } = req.body;

    if (
      !title ||
      !destination ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, destination, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      travelers: travelers || 1,
      budget: budget || 0,
      description: description || "",
      coverImage: coverImage || "",
    });

    const itineraryDays = [];

    const currentDate = new Date(start);
    let dayNumber = 1;

    while (currentDate <= end) {
      itineraryDays.push({
        trip: trip._id,
        user: req.user._id,
        day: dayNumber,
        date: new Date(currentDate),
        activities: [],
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }

    await Itinerary.insertMany(itineraryDays);

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create trip",
    });
  }
};

const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.user._id,
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get trips error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch trips",
    });
  }
};

const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch trip",
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const {
      title,
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      description,
      coverImage,
      status,
    } = req.body;

    const newStartDate = startDate || trip.startDate;
    const newEndDate = endDate || trip.endDate;

    if (new Date(newEndDate) < new Date(newStartDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const datesChanged =
      new Date(newStartDate).getTime() !==
        new Date(trip.startDate).getTime() ||
      new Date(newEndDate).getTime() !==
        new Date(trip.endDate).getTime();

    trip.title = title ?? trip.title;
    trip.destination = destination ?? trip.destination;
    trip.startDate = newStartDate;
    trip.endDate = newEndDate;
    trip.travelers = travelers ?? trip.travelers;
    trip.budget = budget ?? trip.budget;
    trip.description = description ?? trip.description;
    trip.coverImage = coverImage ?? trip.coverImage;
    trip.status = status ?? trip.status;

    await trip.save();

    if (datesChanged) {
      const existingDays = await Itinerary.find({
        trip: trip._id,
        user: req.user._id,
      }).sort({ day: 1 });

      const activityMap = new Map();

      existingDays.forEach((day) => {
        activityMap.set(
          day.date.toISOString().substring(0, 10),
          day.activities
        );
      });

      await Itinerary.deleteMany({
        trip: trip._id,
        user: req.user._id,
      });

      const itineraryDays = [];
      const start = new Date(newStartDate);
      const end = new Date(newEndDate);

      const currentDate = new Date(start);
      let dayNumber = 1;

      while (currentDate <= end) {
        const dateKey = currentDate
          .toISOString()
          .substring(0, 10);

        itineraryDays.push({
          trip: trip._id,
          user: req.user._id,
          day: dayNumber,
          date: new Date(currentDate),
          activities: activityMap.get(dateKey) || [],
        });

        currentDate.setDate(
          currentDate.getDate() + 1
        );

        dayNumber++;
      }

      if (itineraryDays.length > 0) {
        await Itinerary.insertMany(itineraryDays);
      }
    }

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    console.error("Update trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update trip",
    });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    await Itinerary.deleteMany({
      trip: trip._id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete trip",
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const {
      title,
      amount,
      category,
      date,
      notes,
    } = req.body;

    if (
      !title ||
      amount === undefined ||
      amount === null ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expense title, amount and date are required",
      });
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expense amount must be a valid number",
      });
    }

    trip.expenses.push({
      title: title.trim(),
      amount: numericAmount,
      category: category || "other",
      date,
      notes: notes || "",
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense:
        trip.expenses[trip.expenses.length - 1],
      trip,
    });
  } catch (error) {
    console.error(
      "Add expense error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to add expense",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const expense = trip.expenses.id(
      req.params.expenseId
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const {
      title,
      amount,
      category,
      date,
      notes,
    } = req.body;

    if (title !== undefined) {
      expense.title = title.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Expense amount must be a valid number",
        });
      }

      expense.amount = numericAmount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (date !== undefined) {
      expense.date = date;
    }

    if (notes !== undefined) {
      expense.notes = notes;
    }

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
      trip,
    });
  } catch (error) {
    console.error(
      "Update expense error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to update expense",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const expense = trip.expenses.id(
      req.params.expenseId
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense.deleteOne();

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      trip,
    });
  } catch (error) {
    console.error(
      "Delete expense error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to delete expense",
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addExpense,
  updateExpense,
  deleteExpense,
};