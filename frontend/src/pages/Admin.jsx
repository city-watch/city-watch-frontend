import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000/api/v1";

export default function Admin() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIssue, setModalIssue] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // Only staff/admin should access this page
        if (!token || role !== "City Employee") {
            navigate("/login?role=staff");
        } else {
            loadIssues();
        }
    }, []);

    const loadIssues = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/issues`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || "Failed to load issues");
            } else {
                setIssues(data.issues || []);
            }
        } catch (err) {
            console.error(err);
            setError("Network error while loading issues.");
        }
        setLoading(false);
    };

    const updateStatus = async (issueId, newStatus) => {
        try {
            const res = await fetch(`${BASE_URL}/issues/${issueId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.detail || "Failed to update status");
            } else {
                loadIssues();
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        }
    };

    const priorityColor = (p) => {
        switch (p) {
            case "high": return "text-red-400 font-bold";
            case "medium": return "text-yellow-300";
            default: return "text-green-300";
        }
    };

    return (
        <div className="min-h-screen bg-cwDark text-cwText p-6">
            <h1 className="text-4xl font-bold text-cwBlue mb-6">
                City Employee Dashboard
            </h1>

            {loading ? (
                <p className="text-gray-400">Loading issues...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <div className="overflow-x-auto bg-cwMedium/30 p-4 rounded-xl border border-cwBlue/30 shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="text-cwBlue border-b border-cwBlue/40">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => (
                                <tr
                                    key={issue.id}
                                    className="border-b border-cwLight/20 hover:bg-cwLight/10"
                                >
                                    <td className="p-3">{issue.id}</td>
                                    <td className="p-3">{issue.title || "Untitled"}</td>
                                    <td className={`p-3 ${priorityColor(issue.priority)}`}>
                                        {issue.priority}
                                    </td>

                                    <td className="p-3 capitalize">
                                        {issue.status}
                                    </td>

                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => setModalIssue(issue)}
                                            className="px-3 py-1 bg-cwBlue text-white rounded-lg hover:bg-cwLight transition"
                                        >
                                            View
                                        </button>

                                        <select
                                            className="bg-cwDark border border-cwBlue/40 px-2 py-1 rounded-lg"
                                            value={issue.status}
                                            onChange={(e) =>
                                                updateStatus(issue.id, e.target.value)
                                            }
                                        >
                                            <option value="submitted">Submitted</option>
                                            <option value="in_review">In Review</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- Modal for issue details --- */}
            {modalIssue && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-cwDark border border-cwBlue/40 rounded-xl p-6 max-w-xl w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-cwBlue">
                            Issue #{modalIssue.id}
                        </h2>

                        <p className="mb-2">
                            <span className="font-semibold text-gray-300">Title:</span>{" "}
                            {modalIssue.title}
                        </p>

                        <p className="mb-2">
                            <span className="font-semibold text-gray-300">Description:</span>{" "}
                            {modalIssue.description}
                        </p>

                        <p className="mb-2">
                            <span className="font-semibold text-gray-300">Location:</span>{" "}
                            Lat {modalIssue.latitude}, Lng {modalIssue.longitude}
                        </p>

                        {modalIssue.image_url && (
                            <img
                                src={modalIssue.image_url}
                                alt="Issue"
                                className="rounded-lg border border-cwBlue/20 mt-4 max-h-64 mx-auto"
                            />
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setModalIssue(null)}
                                className="px-4 py-2 bg-cwBlue text-white rounded-lg hover:bg-cwLight"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
