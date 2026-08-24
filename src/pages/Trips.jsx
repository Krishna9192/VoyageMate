import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Clock3,
  DollarSign,
  Edit3,
  MapPin,
  MoreHorizontal,
  Plane,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../services/api";

const emptyForm = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: 1,
  budget: "",
  description: "",
  coverImage: "",
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85",
];

const getImage = (trip, index = 0) =>
  trip.coverImage ||
  fallbackImages[index % fallbackImages.length];

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  );
};

function Trips() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [menuTrip, setMenuTrip] = useState(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      const response = await getTrips();

      setTrips(response.trips || []);
    } catch (error) {
      console.error(
        "Unable to fetch trips:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrips();
    }
  }, [token]);
  
  useEffect(() => {
    const destination =
      searchParams.get("destination");

    const newTrip =
      searchParams.get("newTrip");

    const storedDestination = sessionStorage.getItem(
      "voyageMatePrefillDestination"
    );

    const shouldAutoOpen =
      newTrip === "true" ||
      sessionStorage.getItem("voyageMateAutoOpenTrip") === "true";

    const prefilledDestination =
      destination || storedDestination;

    if (prefilledDestination && shouldAutoOpen) {
      setEditingTrip(null);

      setForm({
        ...emptyForm,
        destination: prefilledDestination,
      });

      setFormError("");
      setModalOpen(true);

      sessionStorage.removeItem(
        "voyageMatePrefillDestination"
      );
      sessionStorage.removeItem(
        "voyageMateAutoOpenTrip"
      );

      navigate("/trips", { replace: true });
    }
  }, [searchParams, navigate]);

  const openCreateModal = () => {
    setEditingTrip(null);
    setForm(emptyForm);
    setFormError("");
    setMenuTrip(null);
    setModalOpen(true);
  };

  const openEditModal = (trip) => {
    setEditingTrip(trip);

    setForm({
      title: trip.title || "",
      destination: trip.destination || "",
      startDate: trip.startDate
        ? trip.startDate.substring(0, 10)
        : "",
      endDate: trip.endDate
        ? trip.endDate.substring(0, 10)
        : "",
      travelers: trip.travelers || 1,
      budget: trip.budget ?? "",
      description: trip.description || "",
      coverImage: trip.coverImage || "",
    });

    setFormError("");
    setMenuTrip(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingTrip(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.title ||
      !form.destination ||
      !form.startDate ||
      !form.endDate
    ) {
      setFormError(
        "Please complete the title, destination and dates."
      );
      return;
    }

    if (
      new Date(form.endDate) <
      new Date(form.startDate)
    ) {
      setFormError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: Number(form.travelers),
        budget: Number(form.budget || 0),
        description: form.description,
        coverImage: form.coverImage,
      };

      if (editingTrip) {
        await updateTrip(editingTrip._id, payload);
      } else {
        await createTrip(payload);
      }

      await fetchTrips();
      closeModal();
    } catch (error) {
      setFormError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tripId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) return;

    try {
      await deleteTrip(tripId);

      setTrips((current) =>
        current.filter((trip) => trip._id !== tripId)
      );

      setMenuTrip(null);
    } catch (error) {
      alert(
        error.message ||
          "Unable to delete trip."
      );
    }
  };

  const upcomingTrips = trips.filter(
    (trip) => new Date(trip.startDate) >= new Date()
  );

  const totalBudget = trips.reduce(
    (sum, trip) => sum + Number(trip.budget || 0),
    0
  );

  return (
    <div className="trips-page">
      <section className="trips-header">
        <div>
          <span className="eyebrow">YOUR TRAVEL SPACE</span>

          <h1>
            Welcome back,{" "}
            <span>{user?.name?.split(" ")[0] || "traveler"}.</span>
          </h1>

          <p>
            Keep your adventures organized, from the first idea
            to the final day.
          </p>
        </div>

        <button
          className="create-trip-button"
          onClick={openCreateModal}
        >
          <CirclePlus size={19} />
          Create a trip
        </button>
      </section>

      <section className="trip-stats">
        <div className="trip-stat-card">
          <div className="trip-stat-icon">
            <Plane size={20} />
          </div>

          <div>
            <span>Total trips</span>
            <strong>{trips.length}</strong>
          </div>
        </div>

        <div className="trip-stat-card">
          <div className="trip-stat-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Upcoming</span>
            <strong>{upcomingTrips.length}</strong>
          </div>
        </div>

        <div className="trip-stat-card">
          <div className="trip-stat-icon">
            <DollarSign size={20} />
          </div>

          <div>
            <span>Planned budget</span>
            <strong>
              ₹{totalBudget.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </section>

      <section className="trips-content">
        <div className="trips-section-heading">
          <div>
            <span className="eyebrow">YOUR COLLECTION</span>
            <h2>Upcoming adventures</h2>
          </div>

          {trips.length > 0 && (
            <span className="trip-count">
              {trips.length}{" "}
              {trips.length === 1 ? "trip" : "trips"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="trips-loading">
            <div className="loading-spinner" />
            <p>Loading your journeys...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-trips">
            <div className="empty-trip-icon">
              <Plane size={28} />
            </div>

            <h3>Your next adventure starts here.</h3>

            <p>
              Create your first trip and start building an
              itinerary worth remembering.
            </p>

            <button
              className="create-trip-button"
              onClick={openCreateModal}
            >
              <CirclePlus size={18} />
              Plan my first trip
            </button>
          </div>
        ) : (
          <div className="trip-grid">
            {trips.map((trip, index) => {
              const days = calculateDays(
                trip.startDate,
                trip.endDate
              );

              return (
                <article className="trip-card" key={trip._id}>
                  <div className="trip-card-image">
                    <img
                      src={getImage(trip, index)}
                      alt={trip.destination}
                    />

                    <div className="trip-card-overlay" />

                    <span className="trip-status">
                      {trip.status}
                    </span>

                    <button
                      className="trip-menu-button"
                      onClick={() =>
                        setMenuTrip(
                          menuTrip === trip._id
                            ? null
                            : trip._id
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {menuTrip === trip._id && (
                      <div className="trip-actions-menu">
                        <button
                          onClick={() =>
                            openEditModal(trip)
                          }
                        >
                          <Edit3 size={15} />
                          Edit trip
                        </button>

                        <button
                          className="delete-action"
                          onClick={() =>
                            handleDelete(trip._id)
                          }
                        >
                          <Trash2 size={15} />
                          Delete trip
                        </button>
                      </div>
                    )}

                    <div className="trip-card-location">
                      <MapPin size={15} />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  <div className="trip-card-body">
                    <h3>{trip.title}</h3>

                    <div className="trip-meta">
                      <div>
                        <CalendarDays size={15} />
                        {formatDate(trip.startDate)} —{" "}
                        {formatDate(trip.endDate)}
                      </div>

                      <div>
                        <Clock3 size={15} />
                        {days} {days === 1 ? "day" : "days"}
                      </div>

                      <div>
                        <Users size={15} />
                        {trip.travelers}{" "}
                        {trip.travelers === 1
                          ? "traveler"
                          : "travelers"}
                      </div>
                    </div>

                    <div className="trip-card-footer">
                      <div>
                        <span>Estimated budget</span>
                        <strong>
                          ₹
                          {Number(
                            trip.budget || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <button
                        className="trip-details-button"
                        onClick={() =>
                          navigate(`/trips/${trip._id}`)
                        }
                      >
                        View trip
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="trip-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="trip-modal">
            <div className="trip-modal-header">
              <div>
                <span className="eyebrow">
                  {editingTrip
                    ? "UPDATE JOURNEY"
                    : "NEW JOURNEY"}
                </span>

                <h2>
                  {editingTrip
                    ? "Edit your trip"
                    : "Plan a new trip"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                onClick={closeModal}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="trip-form"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="trip-form-field">
                  <label>Trip name</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Summer in Europe"
                  />
                </div>

                <div className="trip-form-field">
                  <label>Destination</label>
                  <input
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="trip-form-field">
                  <label>Start date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="trip-form-field">
                  <label>End date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="trip-form-field">
                  <label>Travelers</label>
                  <input
                    type="number"
                    name="travelers"
                    min="1"
                    max="50"
                    value={form.travelers}
                    onChange={handleChange}
                  />
                </div>

                <div className="trip-form-field">
                  <label>Budget (₹)</label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="trip-form-field">
                <label>Cover image URL</label>
                <input
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="trip-form-field">
                <label>Trip description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What are you hoping to experience on this trip?"
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
                  onClick={closeModal}
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
                    : editingTrip
                      ? "Save changes"
                      : "Create trip"}

                  {!saving && <ChevronRight size={17} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trips;