import { useEffect, useState } from "react";

const USER_URL = "http://localhost:3000/api/v1/users";

export default function Profile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${USER_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then(setProfile);
    }, []);

    if (!profile) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                Loading...
            </div>
        );
    }

    const role = localStorage.getItem("role") || "Citizen";

    return (
        <div className="min-h-screen bg-cwDark text-cwText px-6 py-10 flex justify-center">
            <div className="max-w-2xl w-full bg-cwMedium/90 border border-cwBlue/40 p-6 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-cwBlue mb-4">Your Profile</h1>

                <div className="space-y-2">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Role:</strong> {role}</p>
                    <p><strong>Points:</strong> {profile.total_points}</p>
                </div>
            </div>
        </div>
    );
}
