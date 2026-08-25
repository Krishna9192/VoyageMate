import { useEffect, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Navigation,
  Globe2,
  Loader2,
  ArrowRight,
  CloudSun,
  Wind,
  Thermometer,
  X,
} from "lucide-react";

const DESTINATIONS = [
  {
    name: "Goa",
    country: "India",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=85",
    description:
      "Golden beaches, coastal sunsets and unforgettable experiences.",
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85",
    description:
      "Luxury, futuristic architecture and desert adventures.",
  },
  {
    name: "Paris",
    country: "France",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=85",
    description:
      "Art, culture, food and timeless romantic streets.",
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85",
    description:
      "Tropical landscapes, temples and peaceful escapes.",
  },
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=85",
    description:
      "A high-energy mix of tradition, technology and food.",
  },
  {
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=85",
    description:
      "Historic landmarks, modern culture and endless exploration.",
  },
];

const getWeatherDescription = (code) => {
  if (code === 0) return "Clear sky";

  if ([1, 2, 3].includes(code)) {
    return "Partly cloudy";
  }

  if ([45, 48].includes(code)) {
    return "Foggy";
  }

  if ([51, 53, 55].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65].includes(code)) {
    return "Rain";
  }

  if ([71, 73, 75].includes(code)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(code)) {
    return "Rain showers";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Mixed conditions";
};

function Explore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedRegion, setSelectedRegion] =
    useState("All");

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] =
    useState(false);

  // Used by navbar search to focus the search box
  const searchInputRef = useRef(null);

  /*
   * Focus the search input when the navbar
   * search button sends us to:
   *
   * /explore?search=true
   */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const queryParam = params.get("query");
    const searchParam = params.get("search");

    if (queryParam) {
      // Pre-fill search from Home page destination input
      setQuery(queryParam);
      searchLocation(queryParam);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else if (searchParam === "true") {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  /*
   * Search locations using Open-Meteo
   */

  const searchLocation = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          value
        )}&count=8&language=en&format=json`
      );

      const data = await response.json();

      let locations = data.results || [];

      /*
       * If the user searches one of our featured
       * destinations, prefer the matching country.
       *
       * Example:
       * Paris → prefer Paris, France
       * instead of Paris, Texas.
       */

      const featuredDestination =
        DESTINATIONS.find(
          (destination) =>
            destination.name.toLowerCase() ===
            value.trim().toLowerCase()
        );

      if (featuredDestination) {
        locations.sort((a, b) => {
          const aMatch =
            a.country?.toLowerCase() ===
            featuredDestination.country.toLowerCase();

          const bMatch =
            b.country?.toLowerCase() ===
            featuredDestination.country.toLowerCase();

          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;

          return 0;
        });
      }

      setResults(locations);
    } catch (error) {
      console.error(
        "Location search failed:",
        error
      );

      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  /*
   * Debounced search
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(query);
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  /*
   * Open destination details
   */

  const openLocation = async (location) => {
    setSelectedLocation(location);
    setWeather(null);
    setWeatherLoading(true);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );

      const data = await response.json();

      setWeather(data.current);
    } catch (error) {
      console.error(
        "Weather fetch failed:",
        error
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  /*
   * Featured destination search
   */

  const handleFeaturedDestination = (
    destination
  ) => {
    setQuery(destination.name);
    searchLocation(destination.name);
  };

  /*
   * Plan trip
   */

  const handlePlanTrip = () => {
    if (!selectedLocation) return;

    const destination = `${selectedLocation.name}, ${selectedLocation.country}`;

    const params = new URLSearchParams();

    params.set("destination", destination);
    params.set("newTrip", "true");

    /*
     * Backup destination data
     */

    sessionStorage.setItem(
      "voyageMatePrefillDestination",
      destination
    );

    sessionStorage.setItem(
      "voyageMateAutoOpenTrip",
      "true"
    );

    window.location.href =
      `/trips?${params.toString()}`;
  };

  /*
   * Region filtering
   */

  const filteredDestinations =
    selectedRegion === "All"
      ? DESTINATIONS
      : DESTINATIONS.filter(
          (destination) =>
            destination.region ===
            selectedRegion
        );

  const regions = [
    "All",
    ...new Set(
      DESTINATIONS.map(
        (destination) => destination.region
      )
    ),
  ];

  return (
    <div className="explore-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="explore-hero">
        <div className="explore-hero-content">

          <span className="eyebrow">
            DISCOVER THE WORLD
          </span>

          <h1>
            Where will you
            <span> go next?</span>
          </h1>

          <p>
            Find a destination, discover its
            weather, and start planning your next
            unforgettable journey.
          </p>

          <div className="destination-search">

            <Search size={20} />

            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search a city or destination..."
              aria-label="Search a city or destination"
            />

            {searching && (
              <Loader2
                size={18}
                className="search-loader"
              />
            )}

          </div>

        </div>
      </section>

      {/* =========================================
          SEARCH RESULTS
      ========================================= */}

      {query.trim() && (
        <section className="live-search-section">

          <div className="explore-section-heading">

            <div>

              <span className="eyebrow">
                SEARCH RESULTS
              </span>

              <h2>
                Places matching "{query}"
              </h2>

            </div>

            <span className="search-result-count">
              {results.length} results
            </span>

          </div>

          {searching ? (

            <div className="search-state">

              <Loader2
                className="spin"
                size={24}
              />

              <p>
                Finding destinations...
              </p>

            </div>

          ) : results.length === 0 ? (

            <div className="search-state">

              <Globe2 size={30} />

              <p>
                No matching destinations found.
              </p>

            </div>

          ) : (

            <div className="location-results">

              {results.map((location) => (

                <div
                  className="location-result-card"
                  key={`${location.id}-${location.latitude}`}
                >

                  <div className="location-result-icon">
                    <MapPin size={20} />
                  </div>

                  <div className="location-result-info">

                    <h3>
                      {location.name}
                    </h3>

                    <p>
                      {location.admin1
                        ? `${location.admin1}, `
                        : ""}
                      {location.country}
                    </p>

                    <span>
                      {location.latitude.toFixed(2)}
                      {"° / "}
                      {location.longitude.toFixed(2)}
                      {"°"}
                    </span>

                  </div>

                  <button
                    className="location-arrow"
                    onClick={() =>
                      openLocation(location)
                    }
                    title="View destination"
                    type="button"
                  >
                    <ArrowRight size={17} />
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>
      )}

      {/* =========================================
          POPULAR DESTINATIONS
      ========================================= */}

      <section className="popular-destinations">

        <div className="explore-section-heading">

          <div>

            <span className="eyebrow">
              INSPIRATION
            </span>

            <h2>
              Popular destinations
            </h2>

            <p>
              A few places worth putting on your
              map.
            </p>

          </div>

        </div>

        {/* FILTERS */}

        <div className="destination-filters">

          {regions.map((region) => (

            <button
              key={region}
              className={
                selectedRegion === region
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedRegion(region)
              }
              type="button"
            >
              {region}
            </button>

          ))}

        </div>

        {/* DESTINATION CARDS */}

        <div className="destination-grid">

          {filteredDestinations.map(
            (destination) => (

              <article
                className="destination-card"
                key={destination.name}
              >

                <div className="destination-card-image">

                  <img
                    src={destination.image}
                    alt={destination.name}
                  />

                  <div className="destination-image-overlay" />

                  <span className="destination-region">
                    {destination.region}
                  </span>

                  <div className="destination-location">
                    <MapPin size={14} />
                    {destination.country}
                  </div>

                </div>

                <div className="destination-card-body">

                  <h3>
                    {destination.name}
                  </h3>

                  <p>
                    {destination.description}
                  </p>

                  <button
                    className="explore-destination-button"
                    onClick={() =>
                      handleFeaturedDestination(
                        destination
                      )
                    }
                    type="button"
                  >
                    Explore destination
                    <ArrowRight size={15} />
                  </button>

                </div>

              </article>

            )
          )}

        </div>

      </section>

      {/* =========================================
          CTA
      ========================================= */}

      <section className="explore-cta">

        <div>

          <span className="eyebrow">
            YOUR NEXT ADVENTURE
          </span>

          <h2>
            Don't just dream about the trip.
            Plan it.
          </h2>

          <p>
            Choose a destination and turn the
            idea into an itinerary.
          </p>

        </div>

        <Navigation size={48} />

      </section>

      {/* =========================================
          DESTINATION DETAILS MODAL
      ========================================= */}

      {selectedLocation && (

        <div
          className="destination-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedLocation(null);
            }

          }}
        >

          <div className="destination-modal">

            <button
              className="destination-modal-close"
              onClick={() =>
                setSelectedLocation(null)
              }
              type="button"
              aria-label="Close destination details"
            >
              <X size={19} />
            </button>

            {/* DESTINATION HEADER */}

            <div className="destination-modal-top">

              <div className="destination-modal-icon">
                <MapPin size={25} />
              </div>

              <span className="eyebrow">
                DESTINATION
              </span>

              <h2>
                {selectedLocation.name}
              </h2>

              <p>
                {selectedLocation.admin1
                  ? `${selectedLocation.admin1}, `
                  : ""}
                {selectedLocation.country}
              </p>

            </div>

            {/* WEATHER */}

            <div className="destination-weather">

              <div className="weather-heading">

                <div>

                  <span className="eyebrow">
                    CURRENT WEATHER
                  </span>

                  <h3>
                    Right now
                  </h3>

                </div>

                <CloudSun size={27} />

              </div>

              {weatherLoading ? (

                <div className="weather-loading">

                  <Loader2
                    size={22}
                    className="spin"
                  />

                  Loading weather...

                </div>

              ) : weather ? (

                <>

                  <div className="weather-main">

                    <div>

                      <strong>
                        {Math.round(
                          weather.temperature_2m
                        )}
                        °C
                      </strong>

                      <span>
                        {getWeatherDescription(
                          weather.weather_code
                        )}
                      </span>

                    </div>

                  </div>

                  <div className="weather-details">

                    <div>

                      <Thermometer size={17} />

                      <span>
                        Humidity
                      </span>

                      <strong>
                        {
                          weather.relative_humidity_2m
                        }
                        %
                      </strong>

                    </div>

                    <div>

                      <Wind size={17} />

                      <span>
                        Wind
                      </span>

                      <strong>
                        {Math.round(
                          weather.wind_speed_10m
                        )}
                        km/h
                      </strong>

                    </div>

                  </div>

                </>

              ) : (

                <div className="weather-loading">
                  Weather unavailable.
                </div>

              )}

            </div>

            {/* COORDINATES */}

            <div className="destination-coordinates">

              <Globe2 size={17} />

              <div>

                <span>
                  Coordinates
                </span>

                <strong>
                  {selectedLocation.latitude.toFixed(
                    4
                  )}
                  {"°, "}
                  {selectedLocation.longitude.toFixed(
                    4
                  )}
                  {"°"}
                </strong>

              </div>

            </div>

            {/* MAP */}

            <div
              style={{
                marginTop: "20px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                background: "#f4f6f7",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Location on map
              </div>

              <iframe
                title={`${selectedLocation.name} map`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude - 0.08}%2C${selectedLocation.latitude - 0.08}%2C${selectedLocation.longitude + 0.08}%2C${selectedLocation.latitude + 0.08}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`}
                style={{
                  width: "100%",
                  height: "260px",
                  border: 0,
                  display: "block",
                }}
                loading="lazy"
              />
            </div>

            {/* PLAN TRIP */}

            <button
              className="destination-plan-button"
              onClick={handlePlanTrip}
              type="button"
            >
              Plan a trip here
              <ArrowRight size={17} />
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Explore;