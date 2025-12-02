import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

// Newly added:
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import MapPage from "./pages/Map";      // Citizen map
import IssueDetail from "./pages/IssueDetail";   // You'll implement this next

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-cwDark text-cwText">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Citizen Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/map" element={<MapPage />} />

            {/* Issue Detail (citizen + staff share this) */}
            <Route path="/issues/:id" element={<IssueDetail />} />

            {/* Staff Pages */}
            <Route path="/admin" element={<Admin />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
