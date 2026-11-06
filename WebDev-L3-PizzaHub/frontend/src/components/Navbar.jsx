import React, { useState } from "react";
import logo from '../assets/logo.jpg'
import { NavLink, useNavigate } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";



export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart.cart);
  

  function handleLogout() {
    dispatch(clearCart());
    localStorage.removeItem("token");
    // localStorage.removeItem("cart");
    dispatch(setToken(null));
    dispatch(setUser(null));
    navigate("/login");
  }

  const navClass = ({ isActive }) =>
    isActive ? "text-[#E63946]" : "text-white hover:text-[#E63946] transition";

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  
return (
  <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F0F0F]/95 px-4 py-4 text-white shadow-lg backdrop-blur-md sm:px-6">
    <div className="mx-auto grid max-w-7xl grid-cols-2 items-center md:grid-cols-3">

      {/* Logo */}
      <div className="flex justify-start">
        <NavLink
          to="/"
          end
          onClick={closeMenu}
          className="flex items-center gap-2 text-xl font-extrabold tracking-wide sm:text-2xl"
        >
          <span className="text-3xl">🍕</span>
          <span>
            Pizza<span className="text-[#E63946]">Hub</span>
          </span>
        </NavLink>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden items-center justify-center gap-7 md:flex lg:gap-9">
        {[
          { to: "/", label: "Home", end: true },
          { to: "/menu", label: "Menu" },
          { to: "/build-pizza", label: "Build Pizza" },
          { to: "/my-order", label: "My Order" },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative whitespace-nowrap py-2 text-sm font-semibold transition duration-200 lg:text-base ${
                isActive
                  ? "text-[#E63946] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#E63946]"
                  : "text-gray-300 hover:text-[#E63946]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Desktop Actions */}
      <div className="hidden items-center justify-end gap-5 md:flex">
        <NavLink
          to="/search"
          aria-label="Search"
          className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-[#E63946]"
        >
          <IoMdSearch size={22} />
        </NavLink>

        <NavLink
          to="/cart"
          aria-label={`Cart, ${cart.length} items`}
          className="relative rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-[#E63946]"
        >
          <FaShoppingCart size={21} />
          {cart.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0F0F0F] bg-[#E63946] px-1 text-[10px] font-bold text-white">
              {cart.length}
            </span>
          )}
        </NavLink>

        {token ? (
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[#E63946] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E63946]"
          >
            Logout
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className="text-sm font-semibold text-gray-300 transition hover:text-[#E63946]"
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className="rounded-lg bg-[#E63946] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#C1121F] hover:shadow-lg"
            >
              Signup
            </NavLink>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex justify-end md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="rounded-lg border border-white/10 p-2 text-white transition hover:bg-white/10 hover:text-[#E63946]"
        >
          {isMenuOpen ? <HiX size={25} /> : <HiMenu size={25} />}
        </button>
      </div>
    </div>

    {/* Mobile Navigation */}
    {isMenuOpen && (
      <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-2 rounded-xl border border-white/10 bg-[#181818] p-4 shadow-xl md:hidden">
        {[
          { to: "/", label: "Home", end: true },
          { to: "/menu", label: "Menu" },
          { to: "/build-pizza", label: "Build Pizza" },
          { to: "/my-order", label: "My Order" },
          { to: "/search", label: "Search", icon: <IoMdSearch size={19} /> },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#E63946]/10 text-[#E63946]"
                  : "text-gray-300 hover:bg-white/5 hover:text-[#E63946]"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <NavLink
          to="/cart"
          onClick={closeMenu}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? "bg-[#E63946]/10 text-[#E63946]"
                : "text-gray-300 hover:bg-white/5 hover:text-[#E63946]"
            }`
          }
        >
          <span className="flex items-center gap-3">
            <FaShoppingCart size={19} />
            Cart
          </span>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#E63946] px-2 text-xs font-bold text-white">
            {cart.length}
          </span>
        </NavLink>

        <div className="my-1 border-t border-white/10" />

        {token ? (
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-[#E63946] px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#E63946]"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-3">
            <NavLink
              to="/login"
              onClick={closeMenu}
              className="flex-1 rounded-lg border border-white/20 px-4 py-3 text-center text-sm font-semibold transition hover:border-[#E63946] hover:text-[#E63946]"
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              onClick={closeMenu}
              className="flex-1 rounded-lg bg-[#E63946] px-4 py-3 text-center text-sm font-bold transition hover:bg-[#C1121F]"
            >
              Signup
            </NavLink>
          </div>
        )}
      </div>
    )}
  </nav>
);
}
