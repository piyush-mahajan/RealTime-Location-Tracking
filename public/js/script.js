const socket = io();

let map;
const markers = {};

function initMap(latitude, longitude) {
  map = L.map("map").setView([latitude, longitude], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Piyush Mahajan",
  }).addTo(map);
}

function updateMarker(id, latitude, longitude) {
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
  markers[id]
    .bindPopup(`Latitude: ${latitude}<br>Longitude: ${longitude}`)
    .openPopup();
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      initMap(latitude, longitude);

      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("Current position:", latitude, longitude);
          socket.emit("send-location", { latitude, longitude });
          updateMarker("self", latitude, longitude);
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    },
    (error) => {
      console.error("Error getting initial position:", error);
      initMap(0, 0); // Initialize map at (0, 0) if geolocation fails
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  initMap(0, 0); // Initialize map at (0, 0) if geolocation is not supported
}

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  console.log("Received location:", id, latitude, longitude);
  updateMarker(id, latitude, longitude);
});

socket.on("user-disconnected", (id) => {
  console.log("User disconnected:", id);
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
