
import React, { useCallback, useEffect, useState } from "react";
import { FaBoxOpen, FaRotateRight, FaIndianRupeeSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const ORDER_STATUSES = [
  "Order Received",
  "In Kitchen",
  "Sent to Delivery",
];

function StatusBadge({ status }) {
  const styles = {
    "Order Received": "bg-blue-100 text-blue-700",
    "In Kitchen": "bg-amber-100 text-amber-700",
    "Sent to Delivery": "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Order Received"}
    </span>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/order/get-all-order");

      const fetchedOrders =
        res.data.orders ||
        res.data.data ||
        [];

      if (!Array.isArray(fetchedOrders)) {
        throw new Error("Unexpected orders response from server.");
      }

      setOrders(fetchedOrders);

      setSelectedStatuses((previous) => {
        const next = { ...previous };

        fetchedOrders.forEach((order) => {
          if (!(order._id in next)) {
            next[order._id] = order.orderStatus || "Order Received";
          }
        });

        return next;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleUpdateStatus(order) {
    const status = selectedStatuses[order._id];

    if (!ORDER_STATUSES.includes(status)) {
      toast.error("Please select a valid status.");
      return;
    }

    if (status === order.orderStatus) {
      toast("This order already has that status.");
      return;
    }

    try {
      setUpdatingId(order._id);

      const res = await api.put(
        `/order/update-order-status/${order._id}`,
        { status }
      );

      const updatedOrder = res.data.order;

      setOrders((previous) =>
        previous.map((item) =>
          item._id === order._id
            ? { ...item, ...updatedOrder }
            : item
        )
      );

      setSelectedStatuses((previous) => ({
        ...previous,
        [order._id]: updatedOrder.orderStatus,
      }));

      toast.success("Order status updated successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const orderId = String(order._id || "").toLowerCase();
    const customerName = String(
      order.deliveryAddress?.fullName || ""
    ).toLowerCase();

    const matchesSearch =
      orderId.includes(search.toLowerCase()) ||
      customerName.includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || order.orderStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const successfulPayments = orders.filter(
    (order) => order.paymentStatus === "SUCCESS"
  ).length;
  const inKitchen = orders.filter(
    (order) => order.orderStatus === "In Kitchen"
  ).length;
  const outForDelivery = orders.filter(
    (order) => order.orderStatus === "Sent to Delivery"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFF8F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-[#E63946]" />
          <p className="font-semibold text-gray-600">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <h2 className="text-2xl font-bold text-[#1F1F1F]">
          Could not load orders
        </h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-5 rounded-xl bg-[#E63946] px-5 py-3 font-semibold text-white hover:bg-[#C1121F]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E63946]">
              PizzaHub Admin
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#1F1F1F] sm:text-4xl">
              Order Management
            </h1>
            <p className="mt-2 text-gray-600">
              Review customer orders and update delivery progress.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition hover:border-[#E63946] hover:text-[#C1121F]"
          >
            <FaRotateRight />
            Refresh Orders
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Orders",
              value: totalOrders,
              icon: <FaBoxOpen />,
              color: "bg-red-50 text-[#E63946]",
            },
            {
              label: "Successful Payments",
              value: successfulPayments,
              icon: <FaIndianRupeeSign />,
              color: "bg-green-50 text-green-700",
            },
            {
              label: "In Kitchen",
              value: inKitchen,
              icon: <FaBoxOpen />,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Out for Delivery",
              value: outForDelivery,
              icon: <FaBoxOpen />,
              color: "bg-blue-50 text-blue-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <span className={`rounded-xl p-3 ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-[#1F1F1F]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer name..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E63946]"
          >
            <option value="All">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white px-5 py-16 text-center shadow-sm">
            <FaBoxOpen className="mx-auto text-4xl text-gray-300" />
            <h2 className="mt-4 text-xl font-bold text-[#1F1F1F]">
              No orders found
            </h2>
            <p className="mt-2 text-gray-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const address = order.deliveryAddress || {};

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Order heading */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Order ID
                      </p>
                      <p className="mt-1 break-all font-bold text-[#1F1F1F]">
                        {order._id}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
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
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        Payment: {order.paymentStatus || "PENDING"}
                      </span>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                  </div>

                  <div className="grid gap-6 p-5 lg:grid-cols-[1fr_0.9fr]">
                    {/* Customer and items */}
                    <div>
                      <h3 className="font-bold text-[#1F1F1F]">
                        Customer Details
                      </h3>

                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-800">
                            Name:{" "}
                          </span>
                          {address.fullName || "Not provided"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-800">
                            Phone:{" "}
                          </span>
                          {address.phone || "Not provided"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-800">
                            Address:{" "}
                          </span>
                          {[
                            address.house,
                            address.street,
                            address.city,
                            address.state,
                            address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <h3 className="font-bold text-[#1F1F1F]">
                          Ordered Items
                        </h3>

                        <div className="mt-3 space-y-3">
                          {(order.items || []).map((item, index) => (
                            <div
                              key={item._id || `${order._id}-${index}`}
                              className="flex items-start justify-between gap-3 rounded-xl bg-[#FFF8F0] p-3"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800">
                                  {item.pizza?.name ||
                                    item.name ||
                                    "Custom Pizza"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {[
                                    item.base && `Base: ${item.base}`,
                                    item.sauce && `Sauce: ${item.sauce}`,
                                    item.cheese && `Cheese: ${item.cheese}`,
                                    `Qty: ${item.quantity || 1}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                                {(item.vegetables || item.toppings || []).length >
                                  0 && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    Toppings:{" "}
                                    {(
                                      item.vegetables ||
                                      item.toppings ||
                                      []
                                    ).join(", ")}
                                  </p>
                                )}
                              </div>

                              <p className="shrink-0 font-bold text-[#C1121F]">
                                ₹
                                {(
                                  Number(item.price || 0) *
                                  Number(item.quantity || 1)
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                          <span className="font-semibold text-gray-600">
                            Order Total
                          </span>
                          <span className="text-xl font-extrabold text-[#E63946]">
                            ₹
                            {Number(order.totalAmount || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status management */}
                    <div className="rounded-2xl border border-orange-100 p-4 sm:p-5">
                      <h3 className="text-lg font-bold text-[#1F1F1F]">
                        Manage Order Status
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Update the status to reflect order progress.
                      </p>

                      <div className="mt-4">
                        <label
                          htmlFor={`status-${order._id}`}
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          New Status
                        </label>

                        <select
                          id={`status-${order._id}`}
                          value={
                            selectedStatuses[order._id] ||
                            order.orderStatus ||
                            "Order Received"
                          }
                          onChange={(e) =>
                            setSelectedStatuses((previous) => ({
                              ...previous,
                              [order._id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={
                          updatingId === order._id ||
                          (selectedStatuses[order._id] ||
                            order.orderStatus ||
                            "Order Received") === order.orderStatus
                        }
                        onClick={() => handleUpdateStatus(order)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] px-4 py-3 font-bold text-white transition hover:bg-[#C1121F] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {updatingId === order._id ? (
                          <>
                            <FaRotateRight className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Status"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/my-order-details/${order._id}`)
                        }
                        className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#E63946] hover:text-[#C1121F]"
                      >
                        View Order Details
                      </button>

                      <p className="mt-3 text-xs leading-5 text-gray-500">
                        The status is saved on the server. Real-time customer
                        updates require the customer page to listen for the
                        corresponding Socket.IO event.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
