import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const REPORT_URL = "http://localhost:8000/api/v1";

const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function MapPage() {
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${REPORT_URL}/issues`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => setIssues(data.issues || []));
    }, []);

    return (
        <div className="min-h-screen bg-cwDark text-cwText">
            <div className="h-[90vh] w-full">
                <MapContainer
                    center={[40.7128, -74.006]} // NYC default
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {issues.map((issue) => (
                        <Marker
                            key={issue.issue_id}
                            position={[issue.latitude, issue.longitude]}
                            icon={icon}
                        >
                            <Popup>
                                <strong>{issue.title}</strong>
                                <br />
                                {issue.description}
                                <br />
                                <a
                                    href={`/issues/${issue.issue_id}`}
                                    className="text-cwBlue"
                                >
                                    View →
                                </a>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
