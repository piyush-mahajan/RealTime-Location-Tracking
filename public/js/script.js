const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const { lat, log } = pos.coords;
      socket.emit("send-location", { lat, log });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Piyush Mahajan",
}).addTo(map);
