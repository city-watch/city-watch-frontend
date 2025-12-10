import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const USER_URL = "http://localhost:3000/api/v1/users";
const REPORT_URL = "http://localhost:3000/api/v1/issues";

export default function Dashboard() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login?role=citizen");
            return;
        }

        if (role === "City Employee") {
            navigate("/admin");
            return;
        }

        const loadAll = async () => {
            try {
                setLoading(true);
                const headers = { Authorization: `Bearer ${token}` };

                // Load profile
                const resProfile = await fetch(`${USER_URL}/profile/me`, { headers });
                if (!resProfile.ok) throw new Error("Profile failed");
                const pData = await resProfile.json();
                setProfile(pData);

                // Load issues
                const resIssues = await fetch(`${REPORT_URL}`, { headers });
                const iData = await resIssues.json();
                setIssues(iData.issues || []);

            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [navigate]);

    if (!profile || loading) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex items-center justify-center">
                Loading Dashboard...
            </div>
        );
    }

    const openIssues = issues.filter((i) => i.status === "open");
    const myOpenIssues = openIssues.filter((i) => i.reporter_id === profile.user_id);

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="w-full max-w-6xl">
                {/* HEADER */}
                <h1 className="text-4xl font-bold text-cwBlue mb-2">
                    Welcome, {profile.name}
                </h1>
                <p className="text-gray-400 mb-8">
                    Track ongoing issues in your city and contribute by adding comments.
                </p>

                {/* TOP CARDS */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {/* Points */}
                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Your Points</h2>
                        <p className="text-4xl font-bold text-cwAccent mt-1">
                            {profile.total_points ?? 0}
                        </p>
                    </div>

                    {/* Total Open Issues */}
                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Total Open Issues</h2>
                        <p className="text-4xl font-bold text-cwText mt-1">
                            {openIssues.length}
                        </p>
                    </div>

                    {/* Your Open Issues */}
                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Your Open Issues</h2>
                        <p className="text-4xl font-bold text-cwLight mt-1">
                            {myOpenIssues.length}
                        </p>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg mb-10">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate("/report")}
                            className="bg-cwBlue hover:bg-cwLight text-white font-semibold py-3 rounded-xl"
                        >
                            Report an Issue
                        </button>

                        <button
                            onClick={() => navigate("/map")}
                            className="bg-cwDark/40 hover:bg-cwLight/20 text-cwText border border-cwBlue/40 py-3 rounded-xl"
                        >
                            View Map
                        </button>

                        <button
                            onClick={() => navigate("/leaderboard")}
                            className="bg-cwDark/40 hover:bg-cwLight/20 text-cwText border border-cwBlue/40 py-3 rounded-xl"
                        >
                            Leaderboard
                        </button>

                        <button
                            onClick={() => navigate("/profile")}
                            className="bg-cwDark/40 hover:bg-cwLight/20 text-cwText border border-cwBlue/40 py-3 rounded-xl"
                        >
                            Profile
                        </button>
                    </div>
                </div>

                {/* OPEN ISSUES */}
                <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Open Issues in the City</h2>

                    {openIssues.length === 0 ? (
                        <p className="text-gray-400 text-sm">There are no open issues right now.</p>
                    ) : (
                        <div className="space-y-3">
                            {openIssues.map((issue) => (
                                <div
                                    key={issue.issue_id}
                                    className="flex justify-between items-center bg-cwDark/40 border border-cwBlue/30 rounded-xl px-4 py-3"
                                >
                                    <div>
                                        <p className="font-semibold">{issue.title}</p>
                                        <p className="text-gray-400 text-sm">{issue.category}</p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/issues/${issue.issue_id}`)}
                                        className="text-cwBlue hover:text-cwLight"
                                    >
                                        View →
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
