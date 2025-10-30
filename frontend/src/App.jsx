import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import Employee from "./pages/Employee";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Profiles from "./pages/Profiles";
import MapView from "./pages/MapView";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-cwDark text-cwText">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Citizen routes */}
            <Route path="/report" element={<Report />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/map" element={<MapView />} />

            {/* Optional admin/employee routes */}
            <Route path="/employee" element={<Employee />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
