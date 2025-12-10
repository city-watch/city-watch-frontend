import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const REPORT_URL = "http://localhost:3000/api/v1/issues";

function HeatmapLayer({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const heat = L.heatLayer(points, {
            radius: 30,       // bigger radius = smoother heatmap
            blur: 20,
            maxZoom: 17,
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points]);

    return null;
}

export default function MapPage() {
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${REPORT_URL}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setIssues(data.issues || []));
    }, []);

    const heatPoints = issues.map(i => [
        i.latitude,
        i.longitude,
        0.5, // weight (optional: how "hot" each point is)
    ]);

    return (
        <div className="min-h-screen bg-cwDark text-cwText p-6">
            <h1 className="text-3xl font-bold text-cwBlue mb-4">Issue Heatmap</h1>

            <MapContainer
                center={[40.7128, -74.0060]}  // NYC default
                zoom={12}
                style={{ height: "75vh", borderRadius: "12px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Heatmap Layer */}
                <HeatmapLayer points={heatPoints} />

                {/* Optional: Keep markers */}
                {issues.map((issue) => (
                    <Marker
                        key={issue.issue_id}
                        position={[issue.latitude, issue.longitude]}
                    >
                        <Popup>
                            <strong>{issue.title}</strong> <br />
                            {issue.category} <br />
                            Status: {issue.status}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
