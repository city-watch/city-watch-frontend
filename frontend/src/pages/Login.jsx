// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  useEffect(() => {
    document.title = isRegister
      ? `Register – ${role}`
      : `Login – ${role}`;
  }, [isRegister, role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      setError("Please fill all required fields");
      return;
    }

    // Frontend-only "fake" login/register
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (isRegister) {
      // Check if email already exists
      if (users.find((u) => u.email === email)) {
        setError("Email already registered");
        return;
      }
      const newUser = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role === "staff" ? "City Employee" : "Citizen",
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      navigate("/report");
    } else {
      const existingUser = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!existingUser) {
        setError("Invalid credentials");
        return;
      }
      localStorage.setItem("currentUser", JSON.stringify(existingUser));
      navigate("/report");
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
            ? role === "staff" ? "Staff Registration" : "Citizen Registration"
            : role === "staff" ? "Staff Login" : "Citizen Login"}
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

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-cwBlue hover:bg-cwLight text-white font-semibold py-2 rounded-lg transition"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
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
