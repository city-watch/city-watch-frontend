import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// AUTHENTICATION SERVICE (User Management)
const USER_URL = "http://localhost:8002/api/v1";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const role = params.get("role") || "citizen";

    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = isRegister
            ? `Register – ${role}`
            : `Login – ${role}`;
    }, [isRegister, role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isRegister
                ? `${USER_URL}/register`
                : `${USER_URL}/login`;

            const payload = isRegister
                ? {
                      name,
                      email,
                      password,
                      role: role === "staff" ? "City Employee" : "Citizen",
                  }
                : { email, password };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // Save auth info
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("name", data.name);

                // Proper role-based redirect
                if (data.role === "City Employee") {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setError(data.detail || data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative flex items-center justify-center min-h-[calc(100vh-10rem)] bg-cwDark bg-cover bg-center text-cwText"
            style={{ backgroundImage: "url('/images/nyc-night.jpg')" }}
        >
            <div className="absolute inset-0 bg-cwDark/80"></div>

            <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-cwDark/90 border border-cwBlue/30 shadow-xl">
                <h1 className="text-3xl font-bold text-center text-cwBlue mb-6">
                    {isRegister
                        ? role === "staff"
                            ? "Staff Registration"
                            : "Citizen Registration"
                        : role === "staff"
                        ? "Staff Login"
                        : "Citizen Login"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-cwDark/70 border border-cwBlue/40 text-cwText placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cwBlue"
                            required
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-cwDark/70 border border-cwBlue/40 text-cwText placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cwBlue"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-cwDark/70 border border-cwBlue/40 text-cwText placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cwBlue"
                        required
                    />

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cwBlue hover:bg-cwLight text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading
                            ? "Processing..."
                            : isRegister
                            ? "Register"
                            : "Login"}
                    </button>
                </form>

                <p className="text-sm text-gray-400 mt-4 text-center">
                    {isRegister
                        ? "Already have an account?"
                        : "Don’t have an account?"}{" "}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-cwBlue hover:text-cwLight font-medium"
                    >
                        {isRegister ? "Login" : "Register"}
                    </button>
                </p>
            </div>
        </div>
    );
}
