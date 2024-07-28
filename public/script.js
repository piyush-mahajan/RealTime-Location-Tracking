const socket = io();

let map;
const markers = {};

function initMap(latitude, longitude) {
  map = L.map("map").setView([latitude, longitude], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}

function updateMarker(id, latitude, longitude) {
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
  markers[id]
    .bindPopup(
      `User: ${id}<br>Lat: ${latitude.toFixed(4)}<br>Lng: ${longitude.toFixed(
        4
      )}`
    )
    .openPopup();
}

function startTracking() {
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Current position:", latitude, longitude);
        socket.emit("send-location", { latitude, longitude });
        updateMarker("You", latitude, longitude);
        map.setView([latitude, longitude]);
      },
      (error) => {
        console.error("Error watching position:", error);
        alert(
          "Unable to retrieve your location. Please check your settings and refresh the page."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    alert(
      "Geolocation is not supported by your browser. Please use a modern browser with geolocation support."
    );
  }
}

// Initialize map with a default location
initMap(0, 0);

// Start tracking when connected to the server
socket.on("connect", () => {
  console.log("Connected to server");
  startTracking();
});

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  console.log("Received location:", id, latitude, longitude);
  if (id !== socket.id) {
    updateMarker(id, latitude, longitude);
  }
});

socket.on("user-disconnected", (id) => {
  console.log("User disconnected:", id);
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

// Error handling for socket connection
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
  alert(
    "Unable to connect to the server. Please check your internet connection and refresh the page."
  );
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  socket.disconnect();
});
