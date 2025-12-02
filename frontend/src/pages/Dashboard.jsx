import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Services
const USER_URL = "http://localhost:8002/api/v1";
const REPORT_URL = "http://localhost:8000/api/v1";

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

                const resProfile = await fetch(`${USER_URL}/profile/me`, { headers });
                if (!resProfile.ok) throw new Error("Profile failed");
                const pData = await resProfile.json();
                setProfile(pData);

                const resIssues = await fetch(`${REPORT_URL}/issues`, { headers });
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

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="w-full max-w-6xl">

                {/* HEADER */}
                <h1 className="text-4xl font-bold text-cwBlue mb-2">
                    Welcome, {profile.name}
                </h1>
                <p className="text-gray-400 mb-8">
                    Track your contributions and explore issues in your city.
                </p>

                {/* TOP CARDS */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Your Points</h2>
                        <p className="text-4xl font-bold text-cwAccent mt-1">
                            {profile.total_points ?? 0}
                        </p>
                    </div>

                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Total Issues</h2>
                        <p className="text-4xl font-bold text-cwText mt-1">
                            {issues.length}
                        </p>
                    </div>

                    <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                        <h2 className="text-sm text-gray-400">Your Reports</h2>
                        <p className="text-4xl font-bold text-cwLight mt-1">
                            {
                                issues.filter(
                                    (i) => i.reporter_id === profile.user_id
                                ).length
                            }
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

            </div>
        </div>
    );
}
