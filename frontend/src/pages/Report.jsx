import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// User Management API (for verifying login)
const USER_URL = "http://localhost:8002/api/v1";

// Report Management API (for creating issues)
const REPORT_URL = "http://localhost:8000/api/v1";

export default function Report() {
    const [position, setPosition] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState(null);
    const [responseMsg, setResponseMsg] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- AUTH CHECK USING USER SERVICE ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login?role=citizen");

        // verify token is valid by calling profile
        fetch(`${USER_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) navigate("/login?role=citizen");
            })
            .catch(() => navigate("/login?role=citizen"));
    }, [navigate]);

    // Prevent UI flicker until token check resolves
    const token = localStorage.getItem("token");
    if (!token) {
        return (
            <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center">
                <p>Redirecting...</p>
            </div>
        );
    }

    // --- Get browser geolocation ---
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                }),
            () => {
                setError("Unable to retrieve your location. Please enable location access.");
            }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResponseMsg(null);

        if (!title.trim() || !description.trim() || !photo || !position) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("latitude", position.lat);
            formData.append("longitude", position.lng);
            formData.append("image", photo);

            const res = await fetch(`${REPORT_URL}/issues`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || data.message || "Failed to submit issue.");
                return;
            }

            // Duplicate handling
            if (data.is_duplicate === true) {
                setResponseMsg({
                    type: "duplicate",
                    message: data.message,
                    issue_id: data.issue_id,
                });
                return;
            }

            // Normal success
            setResponseMsg({
                type: "success",
                message: data.message || "Your report is being processed.",
                issue_id: data.issue_id,
            });
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-cwDark text-cwText flex justify-center items-center px-4 py-12">
            <div className="bg-cwMedium/95 border border-cwBlue/40 rounded-2xl shadow-2xl max-w-2xl w-full p-8 backdrop-blur-sm">

                <h1 className="text-3xl font-bold mb-6 text-cwBlue drop-shadow-lg">
                    Report a Civic Issue
                </h1>

                {/* SUCCESS / DUPLICATE STATUS BOX */}
                {responseMsg && (
                    <div
                        className={`text-center border p-4 rounded-lg mb-6 ${
                            responseMsg.type === "duplicate"
                                ? "bg-yellow-900/20 border-yellow-500 text-yellow-300"
                                : "bg-green-900/20 border-green-600 text-green-400"
                        }`}
                    >
                        <p className="font-medium">{responseMsg.message}</p>
                        <p className="text-sm opacity-80 mt-1">
                            Issue ID: {responseMsg.issue_id}
                        </p>
                    </div>
                )}

                {/* FORM */}
                {!responseMsg && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Location */}
                        {position ? (
                            <div className="bg-cwLight/20 border border-cwBlue/20 text-gray-300 text-sm p-3 rounded-lg text-center">
                                <p>
                                    Location detected:{" "}
                                    <span className="text-cwAccent">
                                        Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 text-sm">
                                Detecting your location...
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">
                                Issue Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full bg-cwLight/40 text-cwText border border-cwBlue/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cwBlue"
                                placeholder="Give a short title (e.g., Broken Streetlight)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">
                                Description <span className="text-red-500">*</span>
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

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">
                                Upload Photo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                className="block w-full text-sm text-gray-400 bg-cwLight/40 border border-cwBlue/30 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-cwBlue file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cwBlue file:text-white hover:file:bg-cwLight"
                                required
                            />
                            {photo && (
                                <div className="mt-3 flex justify-center">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt="Preview"
                                        className="max-h-40 rounded-lg border border-cwBlue/30 shadow-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-center text-red-400 text-sm font-medium">{error}</p>
                        )}

                        {/* Submit */}
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
