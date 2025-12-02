import { useEffect, useState } from "react";

const USER_URL = "http://localhost:8002/api/v1";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${USER_URL}/leaderboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => setUsers(data.leaderboard || data));
    }, []);

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="max-w-3xl w-full">
                <h1 className="text-4xl font-bold text-cwBlue mb-6">Leaderboard</h1>

                <div className="bg-cwMedium/90 border border-cwBlue/40 rounded-xl p-6 shadow-lg">
                    {users.length === 0 ? (
                        <p className="text-gray-400 text-sm">No leaderboard data.</p>
                    ) : (
                        <div className="space-y-3">
                            {users.map((u, i) => (
                                <div
                                    key={u.user_id}
                                    className="flex justify-between bg-cwDark/40 border border-cwBlue/30 rounded-xl px-4 py-3"
                                >
                                    <p>
                                        <span className="font-bold">{i + 1}. </span>
                                        {u.name}
                                    </p>

                                    {/* FIXED */}
                                    <p className="font-semibold text-cwAccent">
                                        {u.total_points} pts
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
