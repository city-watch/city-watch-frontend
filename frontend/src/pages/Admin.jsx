import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            radius: 30,
            blur: 20,
        }).addTo(map);

        return () => map.removeLayer(heat);
    }, [points]);

    return null;
}

export default function Admin() {
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalIssue, setModalIssue] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // -------- ROLE CHECK --------
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "City Employee") {
            navigate("/login?role=staff");
            return;
        }
    }, [navigate]);

    // -------- LOAD ISSUES --------
    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${REPORT_URL}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setIssues(data.issues || []);
                setFiltered(data.issues || []);
            })
            .catch(() => setError("Failed to load issues."))
            .finally(() => setLoading(false));
    }, []);

    const dynamicCategories = [...new Set(issues.map(i => i.category))];

    // -------- FILTERING --------
    useEffect(() => {
        let out = [...issues];

        if (statusFilter) out = out.filter(i => i.status === statusFilter);
        if (priorityFilter) out = out.filter(i => i.priority === priorityFilter);
        if (categoryFilter) out = out.filter(i => i.category === categoryFilter);

        setFiltered(out);
    }, [statusFilter, priorityFilter, categoryFilter, issues]);

    // -------- UPDATE STATUS --------
    const updateStatus = async (id, status) => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${REPORT_URL}/${id}/status`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.detail || "Failed to update.");
            return;
        }

        setIssues(prev =>
            prev.map(i =>
                i.issue_id === id ? { ...i, status } : i
            )
        );
    };

    const priorityColor = (p) => {
        if (p === "high") return "text-red-400";
        if (p === "medium") return "text-yellow-300";
        return "text-green-400";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex items-center justify-center">
                Loading issues...
            </div>
        );
    }

    const heatPoints = issues.map(i => [i.latitude, i.longitude, 0.5]);

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-6">

            {/* PAGE TITLE */}
            <h1 className="text-4xl font-bold text-cwBlue mb-6">
                City Employee Dashboard
            </h1>

            {/* MAP */}
            <MapContainer
                center={[40.7128, -74.0060]}
                zoom={12}
                style={{ height: "45vh", borderRadius: "12px", marginBottom: "2rem", zIndex: 1 }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <HeatmapLayer points={heatPoints} />

                {issues.map(issue => (
                    <Marker key={issue.issue_id} position={[issue.latitude, issue.longitude]}>
                        <Popup>
                            <b>{issue.title}</b><br />
                            {issue.category}<br />
                            Status: {issue.status}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* FILTERS */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-cwMedium border border-cwBlue/40 p-3 rounded-lg"
                >
                    <option value="">Filter by Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-cwMedium border border-cwBlue/40 p-3 rounded-lg"
                >
                    <option value="">Filter by Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-cwMedium border border-cwBlue/40 p-3 rounded-lg"
                >
                    <option value="">Filter by Category</option>
                    {dynamicCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* ISSUE TABLE */}
            <div className="overflow-x-auto border border-cwBlue/30 rounded-xl">
                <table className="w-full">
                    <thead className="bg-cwMedium/50 text-left">
                        <tr>
                            <th className="p-3">Title</th>
                            <th className="p-3">Priority</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(issue => (
                            <tr key={issue.issue_id} className="border-b border-cwBlue/20">
                                <td className="p-3">{issue.title}</td>

                                <td className={"p-3 font-semibold " + priorityColor(issue.priority)}>
                                    {issue.priority}
                                </td>

                                <td className="p-3">{issue.status}</td>
                                <td className="p-3">{issue.category}</td>

                                <td className="p-3">
                                    <button
                                        onClick={() => setModalIssue(issue)}
                                        className="text-cwBlue hover:text-cwLight mr-4"
                                    >
                                        View
                                    </button>

                                    <select
                                        value={issue.status}
                                        onChange={(e) =>
                                            updateStatus(issue.issue_id, e.target.value)
                                        }
                                        className="bg-cwDark border border-cwBlue/40 p-2 rounded-lg"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modalIssue && (
                <div
                    className="fixed inset-0 bg-black/70 flex justify-center items-center p-4"
                    style={{ zIndex: 9999 }}
                >
                    <div
                        className="p-6 rounded-xl border border-cwBlue/40 max-w-2xl w-full relative"
                        style={{ backgroundColor: "#0f172a", zIndex: 10000 }}
                    >
                        <button
                            className="absolute top-2 right-3 text-gray-300 hover:text-white text-xl"
                            onClick={() => setModalIssue(null)}
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-bold text-cwBlue mb-3">
                            {modalIssue.title}
                        </h2>

                        {modalIssue.image_url && (
                            <img
                                src={modalIssue.image_url}
                                alt="Issue"
                                className="w-full max-h-64 object-cover rounded-lg border border-cwLight/20 mb-3"
                            />
                        )}

                        <p className="text-gray-300">{modalIssue.description}</p>

                        <p className="text-sm text-gray-400 mt-3">
                            <strong>Location:</strong> {modalIssue.latitude}, {modalIssue.longitude}
                        </p>

                        <p className="text-sm text-gray-400">
                            <strong>Category:</strong> {modalIssue.category}
                        </p>

                        <p className="text-sm text-gray-400 mb-2">
                            <strong>Priority:</strong> {modalIssue.priority}
                        </p>

                        {/* 🔥 FIXED ROUTE! */}
                        <button
                            onClick={() => navigate(`/issues/${modalIssue.issue_id}`)}
                            className="bg-cwBlue hover:bg-cwLight text-white px-4 py-2 rounded-lg shadow"
                        >
                            View Full Details →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
