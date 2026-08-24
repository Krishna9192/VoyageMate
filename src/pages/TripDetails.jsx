import {
  getTrip,
  getItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../services/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  DollarSign,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Users,
  X,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const emptyActivity = {
  title: "",
  location: "",
  time: "",
  description: "",
  cost: "",
  category: "activity",
};

const categoryIcons = {
  sightseeing: "🏛️",
  food: "🍽️",
  hotel: "🏨",
  transport: "🚗",
  activity: "✨",
  other: "📌",
};

const categoryLabels = {
  sightseeing: "Sightseeing",
  food: "Food",
  hotel: "Hotels",
  transport: "Transport",
  activity: "Activities",
  other: "Other",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activityModal, setActivityModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const [activityForm, setActivityForm] =
    useState(emptyActivity);

  const [expenseModal, setExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "other",
    date: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [mapLocation, setMapLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  const destinationMarker = useMemo(
    () =>
      L.divIcon({
        className: "voyage-map-marker",
        html: '<div class="voyage-map-pin">📍</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      }),
    []
  );

  const fetchMapLocation = async (destination) => {
    if (!destination?.trim()) return;

    try {
      setMapLoading(true);
      setMapError("");

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          destination
        )}&count=1&language=en&format=json`
      );

      const data = await response.json();
      const location = data.results?.[0];

      if (!location) {
        setMapLocation(null);
        setMapError("We couldn't locate this destination on the map.");
        return;
      }

      setMapLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        country: location.country,
        region: location.admin1 || "",
      });
    } catch (err) {
      console.error("Map location error:", err);
      setMapError("Unable to load the destination map.");
    } finally {
      setMapLoading(false);
    }
  };

  const fetchTripData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tripResponse, itineraryResponse] =
        await Promise.all([
          getTrip(tripId),
          getItinerary(tripId),
        ]);

      setTrip(tripResponse.trip);
      fetchMapLocation(tripResponse.trip.destination);

      setItinerary(
        itineraryResponse.itinerary || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this trip."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && tripId) {
      fetchTripData();
    }
  }, [token, tripId]);

  // ==========================================
  // BUDGET CALCULATIONS
  // ==========================================

  const expenses = trip?.expenses || [];

  const budgetData = useMemo(() => {
    const categories = {
      sightseeing: 0,
      food: 0,
      hotel: 0,
      transport: 0,
      activity: 0,
      other: 0,
    };

    let totalSpent = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount || 0);
      totalSpent += amount;

      if (categories[expense.category] !== undefined) {
        categories[expense.category] += amount;
      }
    });

    const totalBudget = Number(trip?.budget || 0);
    const remaining = totalBudget - totalSpent;

    const percentage =
      totalBudget > 0
        ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
        : 0;

    return {
      categories,
      totalSpent,
      totalBudget,
      remaining,
      percentage,
    };
  }, [trip, expenses]);

  const totalActivities = itinerary.reduce(
    (total, day) =>
      total + day.activities.length,
    0
  );

  // ==========================================
  // ACTIVITY MODAL
  // ==========================================

  const openAddActivity = (day) => {
    setSelectedDay(day);
    setEditingActivity(null);
    setActivityForm(emptyActivity);
    setFormError("");
    setActivityModal(true);
  };

  const openEditActivity = (day, activity) => {
    setSelectedDay(day);
    setEditingActivity(activity);

    setActivityForm({
      title: activity.title || "",
      location: activity.location || "",
      time: activity.time || "",
      description: activity.description || "",
      cost: activity.cost ?? "",
      category: activity.category || "activity",
    });

    setFormError("");
    setActivityModal(true);
  };

  const closeActivityModal = () => {
    if (saving) return;

    setActivityModal(false);
    setSelectedDay(null);
    setEditingActivity(null);
    setActivityForm(emptyActivity);
    setFormError("");
  };

  const handleActivityChange = (event) => {
    const { name, value } = event.target;

    setActivityForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  const handleActivitySubmit = async (event) => {
    event.preventDefault();

    if (!activityForm.title.trim()) {
      setFormError("Please enter an activity name.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: activityForm.title.trim(),
        location: activityForm.location.trim(),
        time: activityForm.time,
        description: activityForm.description.trim(),
        cost: Number(activityForm.cost || 0),
        category: activityForm.category,
      };

      let response;

      if (editingActivity) {
        response = await updateActivity(
          tripId,
          selectedDay._id,
          editingActivity._id,
          payload
        );
      } else {
        response = await addActivity(
          tripId,
          selectedDay._id,
          payload
        );
      }

      setItinerary((current) =>
        current.map((day) =>
          day._id === selectedDay._id
            ? response.itinerary
            : day
        )
      );

      closeActivityModal();
    } catch (err) {
      setFormError(
        err.message ||
          "Unable to save activity."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (
    dayId,
    activityId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmed) return;

    try {
      const response = await deleteActivity(
        tripId,
        dayId,
        activityId
      );

      setItinerary((current) =>
        current.map((day) =>
          day._id === dayId
            ? response.itinerary
            : day
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to delete activity."
      );
    }
  };

  // ==========================================
  // EXPENSES
  // ==========================================

  const formatInputDate = (date) =>
    date ? new Date(date).toISOString().slice(0, 10) : "";

  const openAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      title: "",
      amount: "",
      category: "other",
      date:
        formatInputDate(trip?.startDate) ||
        new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setFormError("");
    setExpenseModal(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title || "",
      amount: expense.amount ?? "",
      category: expense.category || "other",
      date: formatInputDate(expense.date),
      notes: expense.notes || "",
    });
    setFormError("");
    setExpenseModal(true);
  };

  const closeExpenseModal = () => {
    if (expenseSaving) return;
    setExpenseModal(false);
    setEditingExpense(null);
    setExpenseForm({
      title: "",
      amount: "",
      category: "other",
      date: "",
      notes: "",
    });
    setFormError("");
  };

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(expenseForm.amount);

    if (!expenseForm.title.trim()) {
      setFormError("Please enter an expense name.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    if (!expenseForm.date) {
      setFormError("Please select a date.");
      return;
    }

    try {
      setExpenseSaving(true);

      const payload = {
        title: expenseForm.title.trim(),
        amount,
        category: expenseForm.category,
        date: expenseForm.date,
        notes: expenseForm.notes.trim(),
      };

      const response = editingExpense
        ? await updateExpense(
            tripId,
            editingExpense._id,
            payload
          )
        : await addExpense(tripId, payload);

      setTrip(response.trip);
      closeExpenseModal();
    } catch (err) {
      setFormError(
        err.message || "Unable to save expense."
      );
    } finally {
      setExpenseSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      const response = await deleteExpense(
        tripId,
        expenseId
      );
      setTrip(response.trip);
    } catch (err) {
      alert(err.message || "Unable to delete expense.");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="trip-details-loading">
        <div className="loading-spinner" />
        <p>Loading your journey...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-details-error">
        <h2>We couldn't find this trip.</h2>

        <p>{error}</p>

        <button
          className="create-trip-button"
          onClick={() => navigate("/trips")}
        >
          <ArrowLeft size={17} />
          Back to my trips
        </button>
      </div>
    );
  }

  const overBudget =
    budgetData.totalSpent > budgetData.totalBudget &&
    budgetData.totalBudget > 0;

  return (
    <div className="trip-details-page">

      {/* BACK */}

      <button
        className="back-to-trips"
        onClick={() => navigate("/trips")}
      >
        <ArrowLeft size={17} />
        Back to my trips
      </button>

      {/* HERO */}

      <section className="trip-detail-hero">

        <div className="trip-detail-hero-image">

          <img
            src={
              trip.coverImage ||
              "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85"
            }
            alt={trip.destination}
          />

          <div className="trip-detail-hero-overlay" />

          <div className="trip-detail-hero-content">

            <span>{trip.status}</span>

            <h1>{trip.title}</h1>

            <div className="trip-detail-location">
              <MapPin size={17} />
              {trip.destination}
            </div>

          </div>

        </div>

      </section>

      {/* OVERVIEW */}

      <section className="trip-overview-grid">

        <div className="overview-card">

          <div className="overview-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Travel dates</span>

            <strong>
              {formatShortDate(trip.startDate)}
              {" — "}
              {formatShortDate(trip.endDate)}
            </strong>
          </div>

        </div>

        <div className="overview-card">

          <div className="overview-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Travelers</span>

            <strong>
              {trip.travelers}{" "}
              {trip.travelers === 1
                ? "traveler"
                : "travelers"}
            </strong>
          </div>

        </div>

        <div className="overview-card">

          <div className="overview-icon">
            <DollarSign size={19} />
          </div>

          <div>
            <span>Trip budget</span>

            <strong>
              ₹
              {Number(
                trip.budget || 0
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        <div className="overview-card">

          <div className="overview-icon">
            <Check size={19} />
          </div>

          <div>
            <span>Planned activities</span>

            <strong>
              {totalActivities}
            </strong>
          </div>

        </div>

      </section>

      {/* ======================================
          DESTINATION MAP
      ====================================== */}

      <section className="trip-map-section">
        <div className="trip-map-heading">
          <div>
            <span className="eyebrow">DESTINATION</span>
            <h2>Explore {trip.destination}</h2>
            <p>
              See your destination on the map and get a quick
              geographic view of your journey.
            </p>
          </div>

          <div className="trip-map-location-badge">
            <MapPin size={16} />
            {mapLocation
              ? `${mapLocation.name}, ${mapLocation.country}`
              : trip.destination}
          </div>
        </div>

        <div className="trip-map-card">
          {mapLoading ? (
            <div className="trip-map-state">
              <div className="loading-spinner" />
              <p>Locating your destination...</p>
            </div>
          ) : mapError || !mapLocation ? (
            <div className="trip-map-state">
              <MapPin size={30} />
              <p>{mapError || "Destination location unavailable."}</p>
            </div>
          ) : (
            <MapContainer
              center={[
                mapLocation.latitude,
                mapLocation.longitude,
              ]}
              zoom={11}
              scrollWheelZoom={true}
              className="trip-leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  mapLocation.latitude,
                  mapLocation.longitude,
                ]}
                icon={destinationMarker}
              >
                <Popup>
                  <strong>{mapLocation.name}</strong>
                  <br />
                  {mapLocation.country}
                  <br />
                  <span>
                    {mapLocation.latitude.toFixed(4)}°,{" "}
                    {mapLocation.longitude.toFixed(4)}°
                  </span>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </section>

      {/* ======================================
          BUDGET DASHBOARD
      ====================================== */}

      <section className="budget-dashboard">

        <div className="budget-heading">

          <div>
            <span className="eyebrow">
              MONEY MATTERS
            </span>

            <h2>Trip budget</h2>

            <p>
              Keep your spending under control
              while you explore.
            </p>
          </div>

          {overBudget && (
            <div className="budget-warning">
              <AlertTriangle size={16} />
              You're over budget
            </div>
          )}

        </div>

        <div className="budget-main-card">

          <div className="budget-main-top">

            <div>
              <span>Total budget</span>

              <strong>
                ₹
                {budgetData.totalBudget.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="budget-spent">

              <span>Actual spending</span>

              <strong>
                ₹
                {budgetData.totalSpent.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

          <div className="budget-progress">

            <div className="budget-progress-track">

              <div
                className={`budget-progress-fill ${
                  overBudget
                    ? "budget-over"
                    : ""
                }`}
                style={{
                  width: `${budgetData.percentage}%`,
                }}
              />

            </div>

            <div className="budget-progress-labels">

              <span>
                {budgetData.percentage}% used
              </span>

              <span>
                {budgetData.remaining >= 0
                  ? `₹${budgetData.remaining.toLocaleString(
                      "en-IN"
                    )} remaining`
                  : `₹${Math.abs(
                      budgetData.remaining
                    ).toLocaleString(
                      "en-IN"
                    )} over`}
              </span>

            </div>

          </div>

        </div>

        {/* CATEGORY BREAKDOWN */}

        <div className="budget-breakdown-card">

          <div className="budget-card-heading">

            <div>
              <span className="eyebrow">
                EXPENSE BREAKDOWN
              </span>

              <h3>
                Where your money goes
              </h3>
            </div>

            <TrendingUp size={19} />

          </div>

          <div className="expense-list">

            {Object.entries(
              budgetData.categories
            ).map(([category, amount]) => {

              const categoryPercentage =
                budgetData.totalSpent > 0
                  ? Math.round(
                      (amount /
                        budgetData.totalSpent) *
                        100
                    )
                  : 0;

              return (

                <div
                  className="expense-row"
                  key={category}
                >

                  <div className="expense-info">

                    <span className="expense-icon">
                      {categoryIcons[category]}
                    </span>

                    <div>

                      <strong>
                        {categoryLabels[category]}
                      </strong>

                      <span>
                        {categoryPercentage}%
                      </span>

                    </div>

                  </div>

                  <div className="expense-bar">

                    <div className="expense-track">

                      <div
                        className="expense-fill"
                        style={{
                          width: `${categoryPercentage}%`,
                        }}
                      />

                    </div>

                  </div>

                  <strong className="expense-amount">
                    ₹
                    {amount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              );
            })}

          </div>

        </div>

        {/* EXPENSE MANAGER */}

        <div className="daily-spending-card expense-manager-card">
          <div className="budget-card-heading">
            <div>
              <span className="eyebrow">ACTUAL SPENDING</span>
              <h3>Expenses you actually paid</h3>
            </div>

            <button
              className="add-activity-button"
              onClick={openAddExpense}
            >
              <Plus size={17} />
              Add expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-day">
              <DollarSign size={18} />
              <span>No expenses recorded yet. Add your first expense.</span>
            </div>
          ) : (
            <div className="activity-list">
              {expenses
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date) - new Date(a.date)
                )
                .map((expense) => (
                  <div
                    className="activity-item"
                    key={expense._id}
                  >
                    <div className="activity-time">
                      {formatShortDate(expense.date)}
                    </div>

                    <div className="activity-line">
                      <div className="activity-dot">
                        {categoryIcons[expense.category] || "📌"}
                      </div>
                    </div>

                    <div className="activity-content">
                      <div className="activity-top">
                        <div>
                          <h4>{expense.title}</h4>
                          <p>
                            {categoryLabels[expense.category] ||
                              "Other"}
                            {expense.notes
                              ? ` • ${expense.notes}`
                              : ""}
                          </p>
                        </div>

                        <div className="activity-actions">
                          <button
                            className="edit-activity-button"
                            onClick={() =>
                              openEditExpense(expense)
                            }
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            className="delete-activity-button"
                            onClick={() =>
                              handleDeleteExpense(expense._id)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="activity-bottom">
                        <span className="activity-category">
                          Actual expense
                        </span>

                        <strong>
                          ₹
                          {Number(
                            expense.amount || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        </section>

      {/* ======================================
          ITINERARY
      ====================================== */}

      <section className="trip-itinerary-section">

        <div className="itinerary-heading">

          <div>

            <span className="eyebrow">
              YOUR JOURNEY
            </span>

            <h2>
              Day-by-day itinerary
            </h2>

            <p>
              Plan every experience, moment and
              memory of your journey.
            </p>

          </div>

        </div>

        {itinerary.length === 0 ? (

          <div className="empty-itinerary">

            <div className="empty-itinerary-icon">
              <CalendarDays size={27} />
            </div>

            <h3>
              Your itinerary is empty.
            </h3>

            <p>
              Create a trip with valid travel dates
              to generate your itinerary.
            </p>

          </div>

        ) : (

          <div className="itinerary-timeline">

            {itinerary.map((day) => {

              const dayTotal =
                day.activities.reduce(
                  (total, activity) =>
                    total +
                    Number(
                      activity.cost || 0
                    ),
                  0
                );

              return (

                <article
                  className="itinerary-day"
                  key={day._id}
                >

                  <div className="day-marker">

                    <span>DAY</span>

                    <strong>
                      {day.day}
                    </strong>

                  </div>

                  <div className="day-content">

                    <div className="day-header">

                      <div>

                        <span>
                          {formatDate(day.date)}
                        </span>

                        <h3>
                          Day {day.day}
                        </h3>

                      </div>

                      <div className="day-header-actions">

                        <div className="day-total">
                          Estimated ₹
                          {dayTotal.toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        <button
                          className="add-activity-button"
                          onClick={() =>
                            openAddActivity(day)
                          }
                        >
                          <Plus size={17} />
                          Add activity
                        </button>

                      </div>

                    </div>

                    {day.activities.length === 0 ? (

                      <div className="empty-day">

                        <Clock3 size={18} />

                        <span>
                          Nothing planned yet.
                          Add your first activity.
                        </span>

                      </div>

                    ) : (

                      <div className="activity-list">

                        {day.activities.map(
                          (activity) => (

                            <div
                              className="activity-item"
                              key={activity._id}
                            >

                              <div className="activity-time">
                                {activity.time ||
                                  "--:--"}
                              </div>

                              <div className="activity-line">

                                <div className="activity-dot">
                                  {
                                    categoryIcons[
                                      activity.category
                                    ]
                                  }
                                </div>

                              </div>

                              <div className="activity-content">

                                <div className="activity-top">

                                  <div>

                                    <h4>
                                      {activity.title}
                                    </h4>

                                    {activity.location && (
                                      <p>
                                        <MapPin
                                          size={13}
                                        />

                                        {
                                          activity.location
                                        }
                                      </p>
                                    )}

                                  </div>

                                  <div className="activity-actions">

                                    <button
                                      className="edit-activity-button"
                                      onClick={() =>
                                        openEditActivity(
                                          day,
                                          activity
                                        )
                                      }
                                    >
                                      <Edit3 size={15} />
                                    </button>

                                    <button
                                      className="delete-activity-button"
                                      onClick={() =>
                                        handleDeleteActivity(
                                          day._id,
                                          activity._id
                                        )
                                      }
                                    >
                                      <Trash2 size={15} />
                                    </button>

                                  </div>

                                </div>

                                {activity.description && (
                                  <p className="activity-description">
                                    {
                                      activity.description
                                    }
                                  </p>
                                )}

                                <div className="activity-bottom">

                                  <span className="activity-category">
                                    Estimated • {activity.category}
                                  </span>

                                  <strong>
                                    ₹
                                    {Number(
                                      activity.cost || 0
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </strong>

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>

      {/* ======================================
          ADD / EDIT EXPENSE MODAL
      ====================================== */}

      {expenseModal && (
        <div
          className="trip-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeExpenseModal();
            }
          }}
        >
          <div className="trip-modal activity-modal">
            <div className="trip-modal-header">
              <div>
                <span className="eyebrow">TRIP EXPENSE</span>
                <h2>
                  {editingExpense
                    ? "Edit expense"
                    : "Add an expense"}
                </h2>
                <p className="activity-modal-date">
                  Track what you actually spend.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeExpenseModal}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="trip-form"
              onSubmit={handleExpenseSubmit}
            >
              <div className="trip-form-field">
                <label>Expense name</label>
                <input
                  name="title"
                  value={expenseForm.title}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Hotel booking"
                />
              </div>

              <div className="form-row">
                <div className="trip-form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amount"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="5000"
                  />
                </div>

                <div className="trip-form-field">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="trip-form-field">
                <label>Category</label>
                <select
                  name="category"
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="sightseeing">
                    🏛️ Sightseeing
                  </option>
                  <option value="food">🍽️ Food</option>
                  <option value="hotel">🏨 Hotel</option>
                  <option value="transport">
                    🚗 Transport
                  </option>
                  <option value="activity">
                    ✨ Activity
                  </option>
                  <option value="other">📌 Other</option>
                </select>
              </div>

              <div className="trip-form-field">
                <label>Notes</label>
                <textarea
                  rows="3"
                  name="notes"
                  value={expenseForm.notes}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Optional note..."
                />
              </div>

              {formError && (
                <div className="trip-form-error">
                  {formError}
                </div>
              )}

              <div className="trip-form-actions">
                <button
                  type="button"
                  className="cancel-trip-button"
                  onClick={closeExpenseModal}
                  disabled={expenseSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-trip-button"
                  disabled={expenseSaving}
                >
                  {expenseSaving
                    ? "Saving..."
                    : editingExpense
                      ? "Save changes"
                      : "Add expense"}

                  {!expenseSaving &&
                    (editingExpense ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={17} />
                    ))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          ADD / EDIT ACTIVITY MODAL
      ====================================== */}

      {activityModal &&
        selectedDay && (

          <div
            className="trip-modal-backdrop"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeActivityModal();
              }

            }}
          >

            <div className="trip-modal activity-modal">

              <div className="trip-modal-header">

                <div>

                  <span className="eyebrow">
                    DAY {selectedDay.day}
                  </span>

                  <h2>
                    {editingActivity
                      ? "Edit activity"
                      : "Add an activity"}
                  </h2>

                  <p className="activity-modal-date">
                    {formatDate(
                      selectedDay.date
                    )}
                  </p>

                </div>

                <button
                  className="modal-close-button"
                  onClick={closeActivityModal}
                >
                  <X size={19} />
                </button>

              </div>

              <form
                className="trip-form"
                onSubmit={handleActivitySubmit}
              >

                <div className="trip-form-field">

                  <label>
                    Activity name
                  </label>

                  <input
                    name="title"
                    value={activityForm.title}
                    onChange={
                      handleActivityChange
                    }
                    placeholder="Visit Baga Beach"
                  />

                </div>

                <div className="form-row">

                  <div className="trip-form-field">

                    <label>
                      Location
                    </label>

                    <input
                      name="location"
                      value={
                        activityForm.location
                      }
                      onChange={
                        handleActivityChange
                      }
                      placeholder="Baga Beach"
                    />

                  </div>

                  <div className="trip-form-field">

                    <label>
                      Time
                    </label>

                    <input
                      type="time"
                      name="time"
                      value={activityForm.time}
                      onChange={
                        handleActivityChange
                      }
                    />

                  </div>

                </div>

                <div className="form-row">

                  <div className="trip-form-field">

                    <label>
                      Category
                    </label>

                    <select
                      name="category"
                      value={
                        activityForm.category
                      }
                      onChange={
                        handleActivityChange
                      }
                    >

                      <option value="sightseeing">
                        🏛️ Sightseeing
                      </option>

                      <option value="food">
                        🍽️ Food
                      </option>

                      <option value="hotel">
                        🏨 Hotel
                      </option>

                      <option value="transport">
                        🚗 Transport
                      </option>

                      <option value="activity">
                        ✨ Activity
                      </option>

                      <option value="other">
                        📌 Other
                      </option>

                    </select>

                  </div>

                  <div className="trip-form-field">

                    <label>
                      Estimated cost (₹)
                    </label>

                    <input
                      type="number"
                      name="cost"
                      min="0"
                      value={activityForm.cost}
                      onChange={
                        handleActivityChange
                      }
                      placeholder="1500"
                    />

                  </div>

                </div>

                <div className="trip-form-field">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="description"
                    rows="4"
                    value={
                      activityForm.description
                    }
                    onChange={
                      handleActivityChange
                    }
                    placeholder="Anything you want to remember..."
                  />

                </div>

                {formError && (

                  <div className="trip-form-error">
                    {formError}
                  </div>

                )}

                <div className="trip-form-actions">

                  <button
                    type="button"
                    className="cancel-trip-button"
                    onClick={
                      closeActivityModal
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="create-trip-button"
                    disabled={saving}
                  >

                    {saving
                      ? "Saving..."
                      : editingActivity
                        ? "Save changes"
                        : "Add activity"}

                    {!saving &&
                      (editingActivity ? (
                        <Check size={17} />
                      ) : (
                        <Plus size={17} />
                      ))}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

    </div>
  );
}

export default TripDetails;