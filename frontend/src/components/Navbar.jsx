import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const linkStyle = (path) =>
    `px-2 hover:text-cwAccent transition-colors duration-200 ${
      pathname === path ? "text-cwAccent font-semibold" : "text-gray-300"
    }`;

  return (
    <nav className="bg-cwMedium/80 backdrop-blur-md border-b border-cwLight shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cwBlue">🏙️ City Watch</h1>
        <div className="space-x-6 text-lg">
          <Link to="/" className={linkStyle("/")}>Home</Link>
          <Link to="/report" className={linkStyle("/report")}>Report</Link>
          <Link to="/dashboard" className={linkStyle("/dashboard")}>Dashboard</Link>
          <Link to="/admin" className={linkStyle("/admin")}>Admin</Link>
        </div>
      </div>
    </nav>
  );
}
