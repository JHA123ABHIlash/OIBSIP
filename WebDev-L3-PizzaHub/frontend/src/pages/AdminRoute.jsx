import React from "react";
import { NavLink, Outlet, useNavigate,Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaChartPie,
  FaBoxOpen,
  FaClipboardList,
  FaPizzaSlice,
  FaUsers,
  FaGear,
  FaArrowRightFromBracket,
  FaBars,
  FaXmark,
} from "react-icons/fa6";
import { MdDeliveryDining } from "react-icons/md";

import { useState } from "react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <FaChartPie />, end: true },
  { name: "Orders", path: "/admin/orders", icon: <FaClipboardList /> },
  { name: "Inventory", path: "/admin/inventory", icon: <FaBoxOpen /> },
  { name: "Pizzas", path: "/admin/pizzas", icon: <FaPizzaSlice /> },
  { name: "Users", path: "/admin/users", icon: <FaUsers /> },
  {name:"Assign Delivery", path:"/admin/assign-delivery",icon: <MdDeliveryDining /> },
  { name: "Settings", path: "/admin/settings", icon: <FaGear /> },
];

export default function AdminRoute() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();


  const { token, user, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#1F1F1F]">
      {menuOpen && (
        <button
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#151515] text-white transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <button
            onClick={() => navigate("/admin")}
            className="text-2xl font-extrabold text-[#FFB347]"
          >
            🍕 PizzaHub
          </button>

          <button
            onClick={() => setMenuOpen(false)}
            className="text-xl lg:hidden"
            aria-label="Close sidebar"
          >
            <FaXmark />
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            Administration
          </p>
          <p className="mt-2 text-sm text-gray-300">Manage your pizza store</p>
        </div>

        <nav className="flex-1 space-y-2 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#E63946] text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <FaArrowRightFromBracket />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-orange-100 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-gray-200 p-2 lg:hidden"
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>
            <div>
              <p className="font-bold">Admin Panel</p>
              <p className="text-xs text-gray-500">
                PizzaHub store management
              </p>
            </div>
          </div>

          <span className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-[#C1121F]">
            Administrator
          </span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}