import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaIndianRupeeSign,
  FaTruck,
  FaFireBurner,
  FaArrowRight,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../services/api";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get("/order/get-all-order");
        const data = response.data.orders || response.data.data || [];

        if (!Array.isArray(data)) {
          throw new Error("Invalid orders response");
        }

        setOrders(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to load dashboard orders"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const successfulOrders = orders.filter(
    (order) => order.paymentStatus === "SUCCESS"
  );

  const revenue = successfulOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const inKitchen = orders.filter(
    (order) => order.orderStatus === "In Kitchen"
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Orders",
      value: loading ? "..." : orders.length,
      icon: <FaClipboardList />,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Successful Revenue",
      value: loading
        ? "..."
        : `₹${revenue.toLocaleString("en-IN")}`,
      icon: <FaIndianRupeeSign />,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "In Kitchen",
      value: loading ? "..." : inKitchen,
      icon: <FaFireBurner />,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Sent to Delivery",
      value: loading
        ? "..."
        : orders.filter((o) => o.orderStatus === "Sent to Delivery").length,
      icon: <FaTruck />,
      color: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#E63946]">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome to your PizzaHub store administration.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {stat.title}
              </p>
              <span className={`rounded-xl p-3 ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="mt-5 break-words text-2xl font-extrabold sm:text-3xl">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Link
          to="/admin/orders"
          className="group flex items-center justify-between rounded-2xl bg-[#E63946] p-6 text-white shadow-sm transition hover:bg-[#C1121F]"
        >
          <div>
            <h2 className="text-xl font-bold">Manage Orders</h2>
            <p className="mt-2 text-sm text-white/85">
              Review orders and update delivery status.
            </p>
          </div>
          <FaArrowRight className="shrink-0 transition group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/inventory"
          className="group flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100 transition hover:ring-[#E63946]"
        >
          <div>
            <h2 className="text-xl font-bold">Manage Inventory</h2>
            <p className="mt-2 text-sm text-gray-500">
              View stock and add new ingredients.
            </p>
          </div>
          <FaArrowRight className="shrink-0 text-[#E63946] transition group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/pizzas"
          className="group flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100 transition hover:ring-[#E63946]"
        >
          <div>
            <h2 className="text-xl font-bold">Manage Pizzas</h2>
            <p className="mt-2 text-sm text-gray-500">
              Go to pizza product management.
            </p>
          </div>
          <FaArrowRight className="shrink-0 text-[#E63946] transition group-hover:translate-x-1" />
        </Link>

        <Link
  to="/admin/assign-delivery"
  className="group flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-orange-100 transition hover:ring-[#E63946]"
>
  <div>
    <h2 className="text-xl font-bold">Assign Delivery</h2>
    <p className="mt-2 text-sm text-gray-500">
      Assign paid orders to delivery agents.
    </p>
  </div>
  <FaArrowRight className="shrink-0 text-[#E63946] transition group-hover:translate-x-1" />
</Link>
        
      </section>

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest orders received by your store.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E63946] hover:text-[#C1121F]"
          >
            View all <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            No orders available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/40">
                    <td className="px-5 py-4 font-semibold">
                      #{String(order._id).slice(-8)}
                    </td>
                    <td className="px-5 py-4">
                      {order.deliveryAddress?.fullName || "Customer"}
                    </td>
                    <td className="px-5 py-4 font-bold">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      {order.paymentStatus || "PENDING"}
                    </td>
                    <td className="px-5 py-4">{order.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
      </section>
    </div>
  );
}
