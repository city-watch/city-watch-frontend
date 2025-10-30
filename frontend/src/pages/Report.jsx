// src/pages/Report.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Leaflet Marker Fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Click on map to select location
function LocationMarker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

export default function Report() {
  const [position, setPosition] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Load currentUser
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user || null);
  }, []);

  // Convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      alert("Please log in to report.");
      navigate("/login");
      return;
    }

    if (!title.trim() || !description.trim() || !photo || !position) {
      setError(
        "Please enter a title, select a location, enter a description, and upload an image."
      );
      return;
    }

    try {
      const savedIssues = JSON.parse(localStorage.getItem("issues")) || [];
      const imageBase64 = await toBase64(photo);

      const newIssue = {
        id: Date.now(),
        title: title.trim(),
        description,
        lat: position.lat,
        lng: position.lng,
        location: `Lat: ${position.lat.toFixed(5)}, Lng: ${position.lng.toFixed(5)}`,
        image: imageBase64,
        status: "Open",
        user: currentUser.username,
      };

      savedIssues.push(newIssue);
      localStorage.setItem("issues", JSON.stringify(savedIssues));

      // Notify MapView of new report
      window.dispatchEvent(new Event("storage"));

      setSubmitted(true);
      setTitle("");
      setDescription("");
      setPhoto(null);
      setPosition(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save report locally.");
    }
  };

  if (!currentUser) {
    // Show message like profiles.jsx
    return (
      <p className="text-gray-300 text-center text-lg mt-10">
        Please log in to report.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center px-4 py-12">
      <div className="bg-cwMedium/95 border border-cwBlue/40 rounded-2xl shadow-2xl max-w-2xl w-full p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-cwBlue drop-shadow-lg">
          Report a Civic Issue
        </h1>

        {submitted ? (
          <div className="text-center bg-green-900/20 border border-green-600 p-4 rounded-lg">
            <p className="text-green-400 font-medium">
              ✅ Report submitted successfully!
            </p>
            <button
              className="mt-3 px-4 py-2 bg-cwBlue text-white rounded-lg"
              onClick={() => navigate("/map")}
            >
              View on Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm mb-2 text-gray-400">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a short title"
                className="w-full px-4 py-2 rounded-lg bg-cwLight/40 text-cwText border border-cwBlue/30 focus:outline-none focus:ring-2 focus:ring-cwBlue"
                required
              />
            </div>

            {/* Map Picker */}
            <div>
              <label className="block text-sm mb-2 text-gray-400">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative h-80 rounded-xl overflow-hidden border border-cwBlue/30 shadow-md">
                <MapContainer
                  center={[40.7128, -74.006]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker setPosition={setPosition} />
                  {position && <Marker position={position}></Marker>}
                </MapContainer>
                <div className="pointer-events-none absolute inset-0 rounded-xl border border-cwBlue/40 shadow-[0_0_25px_rgba(59,130,246,0.15)]"></div>
              </div>
            </div>

            {position && (
              <div className="bg-cwLight/20 border border-cwBlue/20 text-gray-300 text-sm p-3 rounded-lg text-center">
                Selected Location:{" "}
                <span className="text-cwAccent">
                  Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm mb-2 text-gray-400">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full bg-cwLight/40 text-cwText border border-cwBlue/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cwBlue placeholder-gray-400 resize-none"
                placeholder="Describe the issue..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm mb-2 text-gray-400">
                Upload Photo <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="block w-full text-sm text-gray-400 bg-cwLight/40 border border-cwBlue/30 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-cwBlue file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cwBlue file:text-white hover:file:bg-cwLight"
                required
              />
              {photo && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Preview"
                    className="max-h-40 rounded-lg border border-cwBlue/30 shadow-md"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-center text-red-400 text-sm font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="bg-cwBlue hover:bg-cwLight text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-[0_0_10px_rgba(59,130,246,0.6)] w-full"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
