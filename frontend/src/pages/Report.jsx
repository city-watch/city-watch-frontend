import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000/api/v1";

export default function Report() {
    const [position, setPosition] = useState(null);
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // --- Get user token ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login?role=citizen");
        }
    }, [navigate]);

    // --- Get user's current location ---
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => {
                console.error(err);
                setError("Unable to retrieve your location. Please enable location access.");
            }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login?role=citizen");
            return;
        }

        if (!position || !description.trim() || !photo) {
            setError("Please ensure location access, description, and image are provided.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("description", description);
            formData.append("latitude", position.lat);
            formData.append("longitude", position.lng);
            formData.append("image", photo);

            const res = await fetch(`${BASE_URL}/issues`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                setError(data.detail || data.message || "Failed to submit issue.");
            }
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

                {submitted ? (
                    <div className="text-center bg-green-900/20 border border-green-600 p-4 rounded-lg">
                        <p className="text-green-400 font-medium">
                            Report submitted successfully!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        {error && (
                            <p className="text-center text-red-400 text-sm font-medium">{error}</p>
                        )}

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
