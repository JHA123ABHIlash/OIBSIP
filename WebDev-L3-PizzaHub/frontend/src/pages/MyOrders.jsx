import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function getOrder() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/order/get-user-order");
      setOrders(res.data.orders || []);
    } catch (err) {
      // Backend currently returns 404 when the user has no orders.
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to fetch your orders. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrder();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#FFF8F0]">
        <p className="animate-pulse text-lg font-semibold text-[#E63946]">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] bg-[#FFF8F0] px-4 py-12 text-center">
        <p className="mb-4 text-gray-700">{error}</p>
        <button
          onClick={getOrder}
          className="rounded-lg bg-[#E63946] px-5 py-2.5 font-semibold text-white transition hover:bg-[#C1121F]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <h2 className="mb-2 text-2xl font-bold text-[#1F1F1F]">
          No Orders Yet
        </h2>
        <p className="text-gray-600">
          Your delicious pizza orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-2 text-gray-600">
            Track your orders and check your pizza details.
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Order header */}
              <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="break-all font-semibold text-[#1F1F1F]">
                    {order._id}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Date unavailable"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.paymentStatus === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment: {order.paymentStatus || "PENDING"}
                  </span>
                    {/* Order Status  */}

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {order.orderStatus || "Order Received"}
                  </span>

                  
                </div>
              </div>

              
{/* Delivery Agent Details */}
<div className="border-b border-orange-100 bg-orange-50 px-5 py-4">
  <h3 className="font-bold text-[#1F1F1F]">
    Delivery Information
  </h3>

  <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
    <p className="text-gray-600">
      Delivery Agent:{" "}
      <span className="font-semibold text-gray-900">
        {typeof order.deliveryAgent === "object"
          ? order.deliveryAgent?.name || "Not assigned yet"
          : "Not assigned yet"}
      </span>
    </p>

    <p className="mt-1 text-sm text-gray-600">
    Contact:{" "}
    {order.deliveryAgent?.phone ? (
        <a
            href={`tel:${order.deliveryAgent.phone}`}
            className="font-semibold text-[#E63946] hover:underline"
        >
            {order.deliveryAgent.phone}
        </a>
    ) : (
        "Not available"
    )}
</p>

    <p className="text-gray-600">
      Delivery Status:{" "}
      <span className="font-semibold text-[#E63946]">
        {order.deliveryStatus || "Unassigned"}
      </span>
    </p>
  </div>
</div>


              {/* Ordered pizzas */}
              <div className="divide-y divide-gray-100 px-5">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
                  >
                    <img
                      src={item.pizza?.image}
                      alt={item.pizza?.name || "Pizza"}
                      className="h-28 w-28 rounded-xl border border-gray-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-[#1F1F1F]">
                        {item.pizza?.name || "Pizza"}
                      </h2>

                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 sm:grid-cols-3">
                        <p>
                          <span className="font-medium text-gray-800">
                            Base:
                          </span>{" "}
                          {item.base}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">
                            Cheese:
                          </span>{" "}
                          {item.cheese}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">
                            Sauce:
                          </span>{" "}
                          {item.sauce}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">
                            Quantity:
                          </span>{" "}
                          {item.quantity}
                        </p>
                      </div>

                      {item.vegetables?.length > 0 && (
                        <p className="mt-2 text-sm text-gray-500">
                          Vegetables: {item.vegetables.join(", ")}
                        </p>
                      )}
                    </div>

                    <p className="text-lg font-bold text-[#E63946] sm:text-right">
                      ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-4">
                <span className="font-semibold text-gray-700">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-[#E63946]">
                  ₹{order.totalAmount}
                </span>
              </div>
              
{/* View Details Button */}
<div className="flex justify-end border-t border-gray-100 bg-white px-5 py-4">
  <button
    onClick={() => navigate(`/my-order-details/${order._id}`)}
    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63946] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C1121F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2 active:translate-y-0"
  >
    View Details
    <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  </button>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
