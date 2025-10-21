import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Courses", href: "#courses" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <h2
          className="text-2xl font-bold text-indigo-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Learnify
        </h2>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="font-medium text-gray-800 hover:text-indigo-600 transition-colors"
              >
                {item.name}
              </a>
            </li>
          ))}
          <li>
            <button
              onClick={() => navigate("/auth")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
            >
              Sign In
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 font-bold focus:outline-none"
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full right-0 w-48 bg-white shadow-md rounded-md py-2 transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-gray-800 hover:bg-indigo-100 transition-colors"
          >
            {item.name}
          </a>
        ))}
        <button
          onClick={() => {
            setIsOpen(false);
            navigate("/auth");
          }}
          className="w-full text-left px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-100 transition"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
