// src/pages/MapView.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 📍 Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
});

// 🧭 Component for handling map clicks (adds new marker)
function ClickHandler({ onAddMarker }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAddMarker(lat, lng);
    },
  });
  return null;
}

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 🗂️ Load user + issues, and refresh when storage changes
  useEffect(() => {
    const loadIssues = () => {
      const saved = JSON.parse(localStorage.getItem("issues")) || [];
      setIssues(saved);
    };

    // Initial load
    loadIssues();

    // Load current user
    const user = JSON.parse(localStorage.getItem("currentUser")) || {
      username: "guestUser",
    };
    setCurrentUser(user);

    // Listen for storage updates (e.g., when a report is submitted)
    window.addEventListener("storage", loadIssues);
    return () => window.removeEventListener("storage", loadIssues);
  }, []);

  // 🪄 Add a new marker manually by clicking the map
  const handleAddMarker = (lat, lng) => {
    if (!currentUser) return;

    const newIssue = {
      id: Date.now(),
      title: `New Marker`,
      location: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      lat,
      lng,
      status: "Open",
      user: currentUser.username,
    };

    const updated = [...issues, newIssue];
    setIssues(updated);
    localStorage.setItem("issues", JSON.stringify(updated));
  };

  // 🗑️ Delete a marker (only creator)
  const handleDeleteMarker = (id) => {
    const updated = issues.filter((issue) => issue.id !== id);
    setIssues(updated);
    localStorage.setItem("issues", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-cwDark text-white p-6">
      <h2 className="text-3xl font-bold text-center text-cwBlue mb-6">
        🗺️ Report Locations
      </h2>

      <div className="w-full h-[75vh] rounded-2xl overflow-hidden shadow-lg border border-cwLight/30">
        <MapContainer
          center={[40.7128, -74.006]} // Default center (NYC)
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Base map tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Add new markers on click */}
          <ClickHandler onAddMarker={handleAddMarker} />

          {/* Display existing issues */}
          {issues.map(
            (issue) =>
              issue.lat &&
              issue.lng && (
                <Marker
                  key={issue.id}
                  position={[issue.lat, issue.lng]}
                  icon={markerIcon}
                >
                  {/* Tooltip on hover (status) */}
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                    Status:{" "}
                    <span
                      className={
                        issue.status === "Resolved"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {issue.status}
                    </span>
                  </Tooltip>

                  {/* Popup when marker clicked */}
                  <Popup>
                    <strong>{issue.title}</strong>
                    <br />
                    {issue.location}
                    <br />
                    <em>Status: {issue.status}</em>
                    <br />
                    <small>Posted by: {issue.user}</small>
                    <br />

                    {/* Show delete button only for marker creator */}
                    {currentUser?.username === issue.user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering map click
                          handleDeleteMarker(issue.id);
                        }}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete Marker
                      </button>
                    )}
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>

      <p className="text-center mt-4 text-cwLight">
        🖱️ Click anywhere on the map to add a pin.<br />
        📍 Reports with coordinates are automatically pinned.<br />
      </p>
    </div>
  );
}
