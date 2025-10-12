import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!position || !description.trim()) {
      alert("Please select a location and enter a description.");
      return;
    }
    console.log({ position, description });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center px-4 py-12">
      <div className="bg-cwMedium/95 border border-cwBlue/40 rounded-2xl shadow-2xl max-w-2xl w-full p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-cwBlue drop-shadow-lg">
          Report a Civic Issue
        </h1>

        {submitted ? (
          <div className="text-center bg-green-900/20 border border-green-600 p-4 rounded-lg">
            <p className="text-green-400 font-medium">
              Report submitted successfully! (mock submission)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative h-80 rounded-xl overflow-hidden border border-cwBlue/30 shadow-md">
              <MapContainer
                center={[40.7128, -74.006]} // NYC default
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="rounded-xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setPosition={setPosition} />
                {position && <Marker position={position}></Marker>}
              </MapContainer>
              <div className="pointer-events-none absolute inset-0 rounded-xl border border-cwBlue/40 shadow-[0_0_25px_rgba(59,130,246,0.15)]"></div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-400">
                Description
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
