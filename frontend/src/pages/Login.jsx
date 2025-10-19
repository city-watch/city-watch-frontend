import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  console.log("🔑 Login mounted"); // 👈 for debugging route change

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // detect role from URL, e.g., /login?role=citizen
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "citizen";

  useEffect(() => {
    document.title = `Login – ${role === "staff" ? "Staff" : "Citizen"}`;
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role || role);

        // role-based navigation
        if (role === "staff") navigate("/employee");
        else navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-[calc(100vh-10rem)] bg-cwDark bg-cover bg-center text-cwText"
      style={{ backgroundImage: "url('/images/nyc-night.jpg')" }}
    >
      {/* translucent overlay */}
      <div className="absolute inset-0 bg-cwDark/80"></div>

      <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-cwDark/90 border border-cwBlue/30 shadow-xl">
        <h1 className="text-3xl font-bold text-center text-cwBlue mb-6">
          {role === "staff" ? "Staff Login" : "Citizen Login"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-cwDark/70 border border-cwBlue/40 text-cwText placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cwBlue"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-cwDark/70 border border-cwBlue/40 text-cwText placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cwBlue"
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-cwBlue hover:bg-cwLight text-white font-semibold py-2 rounded-lg transition"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-3 text-sm text-gray-300 hover:text-cwLight transition"
        >
          Continue as Visitor
        </button>
      </div>
    </div>
  );
}
