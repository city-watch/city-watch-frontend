import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Home()
{
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() =>
    {
        const handleClickOutside = (e) =>
        {
            if (menuRef.current && !menuRef.current.contains(e.target))
            {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (role) =>
    {
        setOpen(false);
        setTimeout(() =>
        {
            navigate(`/login?role=${role}`);
        }, 0);
    };

    return (
        <div
            className="relative flex flex-col items-center justify-center text-center px-4 min-h-[calc(100vh-10rem)] bg-cwDark bg-cover bg-center"
            style={{ backgroundImage: "url('/images/nyc-night.jpg')" }}
        >
            <div className="absolute inset-0 bg-cwDark/80 pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl">
                <h2 className="text-5xl font-extrabold text-cwText mb-6 tracking-tight drop-shadow-lg">
                    Making Cities <span className="text-cwBlue">Smarter</span>
                </h2>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    Report issues, monitor progress, and make your city shine.
                    City Watch empowers communities to act together.
                </p>

                <div className="relative inline-block" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        className="bg-cwBlue hover:bg-cwLight text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition"
                    >
                        Login / Register
                    </button>

                    {open && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-cwDark border border-cwBlue/40 rounded-lg shadow-lg text-cwText text-sm z-50">
                            <button
                                type="button"
                                onClick={() => handleSelect("citizen")}
                                className="block w-full text-left px-4 py-2 hover:bg-cwBlue/30 rounded-t-lg"
                            >
                                👤 Citizen
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSelect("staff")}
                                className="block w-full text-left px-4 py-2 hover:bg-cwBlue/30 rounded-b-lg"
                            >
                                🧑‍💼 Staff
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
