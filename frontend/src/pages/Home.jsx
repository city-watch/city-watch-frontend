export default function Home() {
  return (
    <div
      className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center px-4 bg-cwDark bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/nyc-night.jpg')", // ✅ put the skyline image here
      }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-cwDark/80"></div>

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-5xl font-extrabold text-cwText mb-6 tracking-tight drop-shadow-lg">
          Making Cities <span className="text-cwBlue">Smarter</span>
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Report issues, monitor progress, and make your city shine at night.
          City Watch empowers communities to act together.
        </p>

        <a
          href="/report"
          className="bg-cwBlue hover:bg-cwLight text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition"
        >
          Report an Issue
        </a>
      </div>
    </div>
  );
}
