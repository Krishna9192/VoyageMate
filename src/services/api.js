const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("voyageMateToken") ||
    localStorage.getItem("token")
  );
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(
      "Server returned non-JSON response:",
      text
    );

    throw new Error(
      `Server returned ${response.status} ${response.statusText}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

/* =========================
   AUTH
========================= */

export const registerUser = async (userData) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

/* =========================
   TRIPS
========================= */

export const createTrip = async (data) => {
  return request("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTrips = async () => {
  return request("/trips");
};

export const getTrip = async (id) => {
  return request(`/trips/${id}`);
};

export const updateTrip = async (id, data) => {
  return request(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteTrip = async (id) => {
  return request(`/trips/${id}`, {
    method: "DELETE",
  });
};

/* =========================
   ITINERARY
========================= */

export const getItinerary = async (tripId) => {
  return request(`/itinerary/trips/${tripId}`);
};

export const createItineraryDay = async (
  tripId,
  data
) => {
  return request(`/itinerary/trips/${tripId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const addActivity = async (
  tripId,
  dayId,
  data
) => {
  return request(
    `/itinerary/trips/${tripId}/days/${dayId}/activities`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

export const updateActivity = async (
  tripId,
  dayId,
  activityId,
  data
) => {
  return request(
    `/itinerary/trips/${tripId}/days/${dayId}/activities/${activityId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const deleteActivity = async (
  tripId,
  dayId,
  activityId
) => {
  return request(
    `/itinerary/trips/${tripId}/days/${dayId}/activities/${activityId}`,
    {
      method: "DELETE",
    }
  );
};

/* =========================
   EXPENSES
========================= */

export const addExpense = async (
  tripId,
  expenseData
) => {
  return request(
    `/trips/${tripId}/expenses`,
    {
      method: "POST",
      body: JSON.stringify(expenseData),
    }
  );
};

export const updateExpense = async (
  tripId,
  expenseId,
  expenseData
) => {
  return request(
    `/trips/${tripId}/expenses/${expenseId}`,
    {
      method: "PUT",
      body: JSON.stringify(expenseData),
    }
  );
};

export const deleteExpense = async (
  tripId,
  expenseId
) => {
  return request(
    `/trips/${tripId}/expenses/${expenseId}`,
    {
      method: "DELETE",
    }
  );
};

/* =========================
   HEALTH
========================= */

export const checkBackendHealth = async () => {
  return request("/health");
};