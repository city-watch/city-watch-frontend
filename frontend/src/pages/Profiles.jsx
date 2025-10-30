// src/pages/Profiles.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profiles() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Load data on mount and listen for updates
  useEffect(() => {
    const loadData = () => {
      const loggedUser = JSON.parse(localStorage.getItem("currentUser"));
      const allUsers = JSON.parse(localStorage.getItem("users")) || [];
      const allIssues = JSON.parse(localStorage.getItem("issues")) || [];

      setUser(loggedUser);
      setUsers(allUsers);
      setIssues(allIssues);
    };

    loadData();

    const handleStorageChange = () => {
      const updatedIssues = JSON.parse(localStorage.getItem("issues")) || [];
      setIssues(updatedIssues);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!user)
    return (
      <p className="text-gray-300 text-center text-lg mt-10">
        Please log in to view your profile.
      </p>
    );

  // User's reports
  const myReports = issues.filter((i) => i.user === user.username);
  const resolvedReports = myReports.filter(
    (r) => r.status?.toLowerCase() === "resolved"
  );

  // Leaderboard
  const leaderboard = [...users].sort((a, b) => b.points - a.points);

  // Delete profile
  const handleDeleteProfile = (targetEmail) => {
    const isSelfDelete = targetEmail === user.email;

    if (
      window.confirm(
        isSelfDelete
          ? "Are you sure you want to delete your account? This cannot be undone."
          : "Are you sure you want to delete this user’s account?"
      )
    ) {
      const updatedUsers = users.filter((u) => u.email !== targetEmail);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      if (isSelfDelete) {
        localStorage.removeItem("currentUser");
        alert("Your account has been deleted.");
        navigate("/login");
      } else {
        alert("User account deleted successfully.");
        setUsers(updatedUsers);
      }
    }
  };

  // Toggle Public/Private profile
  const handleTogglePrivacy = () => {
    const updatedUser = { ...user, isPublic: !user.isPublic };
    const updatedUsers = users.map((u) =>
      u.email === user.email ? updatedUser : u
    );

    setUser(updatedUser);
    setUsers(updatedUsers);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  // Log out
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Filter public profiles by search
  const publicProfiles = users.filter(
    (u) =>
      u.isPublic &&
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      u.email !== user.email
  );

  const canDeleteUser = (targetUser) => {
    if (!user) return false;
    if (user.email === targetUser.email) return true;
    if (user.role === "City Employee" || user.role === "Admin") return true;
    return false;
  };

  return (
    <div className="bg-black/70 min-h-screen p-8 text-white">
      {/* My Profile */}
      <div className="max-w-3xl mx-auto mb-10 bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-blue-400 mb-4 text-center">
          👤 My Profile
        </h2>

        <div className="space-y-3 text-lg">
          <p>
            <span className="font-bold text-blue-300">Name:</span> {user.username || user.name}
          </p>
          <p>
            <span className="font-bold text-blue-300">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-bold text-yellow-400">Points:</span>{" "}
            <span className="text-yellow-400 font-semibold">{user.points || 0}</span>
          </p>
          <p>
            <span className="font-bold text-blue-300">Reports Submitted:</span>{" "}
            {myReports.length}
          </p>
          <p>
            <span className="font-bold text-green-400">Resolved Reports:</span>{" "}
            {resolvedReports.length}
          </p>
          <p>
            <span className="font-bold text-purple-400">Profile Status:</span>{" "}
            {user.isPublic ? "🌐 Public" : "🔒 Private"}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleTogglePrivacy}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              user.isPublic
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {user.isPublic ? "Make Private" : "Make Public"}
          </button>

          <button
            onClick={() => handleDeleteProfile(user.email)}
            className="bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🗑️ Delete My Account
          </button>

          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🔓 Log Out
          </button>
        </div>
      </div>

      {/* Search Public Profiles */}
      <div className="max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-green-400 mb-3 text-center">
          🔍 Search Public Profiles
        </h2>
        <input
          type="text"
          placeholder="Search for public profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {publicProfiles.length === 0 ? (
            <p className="text-center text-gray-400 col-span-2">
              No public profiles found.
            </p>
          ) : (
            publicProfiles.map((p, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/20 transition"
              >
                <h3 className="text-xl font-bold text-blue-300">{p.username || p.name}</h3>
                <p className="text-gray-300">{p.role}</p>
                <p className="text-yellow-400 font-semibold">Points: {p.points || 0}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-red-400 mb-4 text-center">🏆 Leaderboard</h2>

        {leaderboard.length === 0 ? (
          <p className="text-gray-300 italic text-center">No registered users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/10 text-blue-300">
                  <th className="py-2 px-3 text-left font-semibold">#</th>
                  <th className="py-2 px-3 text-left font-semibold">Name</th>
                  <th className="py-2 px-3 text-left font-semibold">Role</th>
                  <th className="py-2 px-3 text-left font-semibold">Points</th>
                  <th className="py-2 px-3 text-left font-semibold">Reports</th>
                  <th className="py-2 px-3 text-left font-semibold">Resolved</th>
                  <th className="py-2 px-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, index) => {
                  const uReports = issues.filter((i) => i.user === u.username);
                  const uResolved = uReports.filter((r) => r.status?.toLowerCase() === "resolved");
                  const highlight =
                    u.username === user.username
                      ? "bg-gradient-to-r from-blue-800 to-red-800 text-white"
                      : "bg-white/5 hover:bg-white/10";
                  return (
                    <tr key={index} className={`${highlight} transition`}>
                      <td className="py-2 px-3 font-bold">{index + 1}</td>
                      <td className="py-2 px-3">{u.username || u.name}</td>
                      <td className="py-2 px-3">{u.role}</td>
                      <td className="py-2 px-3 text-yellow-400 font-semibold">{u.points || 0}</td>
                      <td className="py-2 px-3">{uReports.length}</td>
                      <td className="py-2 px-3">{uResolved.length}</td>
                      <td className="py-2 px-3">
                        {canDeleteUser(u) && (
                          <button
                            onClick={() => handleDeleteProfile(u.email)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

