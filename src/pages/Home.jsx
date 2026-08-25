import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [travelDates, setTravelDates] = useState("");

  const handleStartPlanning = (prefillDest = "") => {
    const dest = prefillDest || destination.trim();
    const params = new URLSearchParams();
    params.set("newTrip", "true");

    if (dest) {
      params.set("destination", dest);
      sessionStorage.setItem("voyageMatePrefillDestination", dest);
    }
    sessionStorage.setItem("voyageMateAutoOpenTrip", "true");

    navigate(`/trips?${params.toString()}`);
  };

  const handleExplore = (prefillDest = "") => {
    const dest = prefillDest || destination.trim();
    if (dest) {
      navigate(`/explore?query=${encodeURIComponent(dest)}`);
    } else {
      navigate("/explore");
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (destination.trim()) {
      handleExplore(destination.trim());
    } else {
      navigate("/explore?search=true");
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Plan better. Travel smarter.</span>
          </div>

          <h1>
            Your next
            <span> unforgettable </span>
            journey starts here.
          </h1>

          <p className="hero-description">
            Discover beautiful destinations, build personalized itineraries,
            manage your budget, and keep your entire trip organized in one
            place.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => handleStartPlanning()}
            >
              Start Planning
              <ArrowRight size={18} />
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={() => handleExplore()}
            >
              <Compass size={18} />
              Explore Destinations
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85"
              alt="Beautiful mountain landscape"
            />

            <div className="image-overlay"></div>

            <div
              className="floating-location-card clickable"
              onClick={() => handleExplore("Swiss Alps")}
              title="Explore Swiss Alps"
              role="button"
              tabIndex={0}
            >
              <div className="location-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>Popular destination</span>
                <strong>Swiss Alps</strong>
              </div>
            </div>

            <div className="floating-date-card">
              <CalendarDays size={18} />
              <div>
                <span>Perfect time</span>
                <strong>Jun — Sep</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-heading">
          <span>WHERE TO NEXT?</span>
          <h2>Find your next adventure</h2>
        </div>

        <form className="destination-search" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <MapPin size={20} />
            <div>
              <label htmlFor="home-destination-input">Destination</label>
              <input
                id="home-destination-input"
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="search-input-wrapper">
            <CalendarDays size={20} />
            <div>
              <label htmlFor="home-dates-input">Travel dates</label>
              <input
                id="home-dates-input"
                type="text"
                placeholder="Choose your dates"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
              />
            </div>
          </div>

          <button className="search-button" type="submit">
            <Search size={19} />
            Search
          </button>
        </form>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span>TRAVEL WITHOUT THE CHAOS</span>
          <h2>Everything you need for your journey</h2>
          <p>
            From the first idea to the final day of your trip, Voyage Mate
            keeps everything organized.
          </p>
        </div>

        <div className="feature-grid">
          <div
            className="feature-card feature-card-large clickable"
            onClick={() => handleExplore()}
            role="button"
            tabIndex={0}
          >
            <div className="feature-icon">
              <Compass size={23} />
            </div>
            <h3>Discover places worth visiting</h3>
            <p>
              Explore destinations, attractions, restaurants, and experiences
              that can make your trip unforgettable.
            </p>
          </div>

          <div
            className="feature-card clickable"
            onClick={() => handleStartPlanning()}
            role="button"
            tabIndex={0}
          >
            <div className="feature-icon">
              <CalendarDays size={23} />
            </div>
            <h3>Build your itinerary</h3>
            <p>
              Organize every day of your trip and keep your plans in one
              beautiful timeline.
            </p>
          </div>

          <div
            className="feature-card clickable"
            onClick={() => navigate("/trips")}
            role="button"
            tabIndex={0}
          >
            <div className="feature-icon">
              <MapPin size={23} />
            </div>
            <h3>Keep everything connected</h3>
            <p>
              Manage places, activities, stays, and locations without jumping
              between different apps.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span>READY FOR YOUR NEXT ADVENTURE?</span>
          <h2>Let's plan somewhere unforgettable.</h2>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => handleStartPlanning()}
        >
          Create a Trip
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}

export default Home;