export default function Footer() {
  return (
    <footer className="bg-cwMedium border-t border-cwLight/40 text-gray-400 text-sm text-center py-4">
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="text-cwBlue font-semibold">City Watch</span> ·{" "}
        <span className="text-cwAccent">Empowering Communities</span>
      </p>
    </footer>
  );
}
