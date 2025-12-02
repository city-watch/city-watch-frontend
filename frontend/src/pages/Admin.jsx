import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const REPORT_URL = "http://localhost:8000/api/v1";
const USER_URL = "http://localhost:8002/api/v1";

export default function Admin() {
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalIssue, setModalIssue] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // -------- ROLE CHECK --------
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login?role=staff");
            return;
        }
        if (role !== "City Employee") {
            navigate("/login?role=staff");
            return;
        }
    }, [navigate]);

    // -------- LOAD ISSUES --------
    useEffect(() => {
        const token = localStorage.getItem("token");

        const loadIssues = async () => {
            try {
                setLoading(true);

                const res = await fetch(`${REPORT_URL}/issues`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Failed to load issues");

                const data = await res.json();
                setIssues(data.issues || []);
                setFiltered(data.issues || []);

            } catch (err) {
                console.error(err);
                setError("Failed to load issues.");
            } finally {
                setLoading(false);
            }
        };

        loadIssues();
    }, []);

    // -------- DYNAMIC CATEGORIES --------
    const dynamicCategories = [...new Set(issues.map(i => i.category))];

    // -------- APPLY FILTERS --------
    useEffect(() => {
        let out = [...issues];

        if (statusFilter) out = out.filter(i => i.status === statusFilter);
        if (priorityFilter) out = out.filter(i => i.priority === priorityFilter);
        if (categoryFilter) out = out.filter(i => i.category === categoryFilter);

        setFiltered(out);
    }, [statusFilter, priorityFilter, categoryFilter, issues]);

    const openModal = issue => setModalIssue(issue);
    const closeModal = () => setModalIssue(null);

    // -------- UPDATE STATUS --------
    const updateStatus = async (id, newStatus) => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${REPORT_URL}/issues/${id}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.detail || "Failed to update status.");
                return;
            }

            // Update UI immediately
            setIssues(prev =>
                prev.map(i =>
                    i.issue_id === id ? { ...i, status: newStatus } : i
                )
            );

        } catch (err) {
            console.error(err);
            setError("Network error.");
        }
    };

    const priorityColor = (p) => {
        switch (p) {
            case "high": return "text-red-400";
            case "medium": return "text-yellow-300";
            case "low": return "text-green-400";
            default: return "text-gray-300";
        }
    };

    // -------- LOADING STATE --------
    if (loading) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                Loading issues...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10">
            <h1 className="text-4xl font-bold text-cwBlue mb-6">City Employee Dashboard</h1>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {/* FILTERS */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">

                {/* STATUS FILTER */}
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

                {/* PRIORITY FILTER */}
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

                {/* CATEGORY FILTER (DYNAMIC) */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-cwMedium border border-cwBlue/40 p-3 rounded-lg"
                >
                    <option value="">Filter by Category</option>
                    {dynamicCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

            </div>

            {/* TABLE */}
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
                        {filtered.map((issue) => (
                            <tr key={issue.issue_id} className="border-b border-cwBlue/20">
                                <td className="p-3">{issue.title}</td>

                                <td className={"p-3 font-semibold " + priorityColor(issue.priority)}>
                                    {issue.priority}
                                </td>

                                <td className="p-3">{issue.status}</td>
                                <td className="p-3">{issue.category}</td>

                                <td className="p-3">
                                    <button
                                        onClick={() => openModal(issue)}
                                        className="text-cwBlue hover:text-cwLight mr-4"
                                    >
                                        View
                                    </button>

                                    <select
                                        value={issue.status}
                                        onChange={(e) => updateStatus(issue.issue_id, e.target.value)}
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
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4">
                    <div className="bg-cwMedium p-6 rounded-xl border border-cwBlue/40 max-w-lg w-full relative">

                        <button
                            className="absolute top-2 right-3 text-gray-300 hover:text-white text-xl"
                            onClick={closeModal}
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

                        <p className="text-gray-300 mb-2">{modalIssue.description}</p>
                        <p className="text-sm text-gray-400 mb-1">
                            <strong>Location:</strong> {modalIssue.latitude}, {modalIssue.longitude}
                        </p>
                        <p className="text-sm text-gray-400 mb-1">
                            <strong>Category:</strong> {modalIssue.category}
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                            <strong>Priority:</strong>{" "}
                            <span className={priorityColor(modalIssue.priority)}>
                                {modalIssue.priority}
                            </span>
                        </p>

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
