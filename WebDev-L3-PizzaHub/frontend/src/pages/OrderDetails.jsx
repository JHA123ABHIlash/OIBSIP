
import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaReceipt } from "react-icons/fa";
import socket from "../services/socket";

export default function MyOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/order/get-order/${orderId}`);
      setOrder(res.data.order || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setOrder(null);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to fetch your order. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // useEffect(() => {
  //   getOrderDetails();
  // }, [getOrderDetails]);


  useEffect(() => {
     getOrderDetails();
  if (!order?._id) return;

  const orderId = order._id;

  const joinRoom = () => {
    socket.emit("joinOrderRoom", orderId);
  };

  const handleStatusUpdate = (data) => {
    if (data.orderId !== orderId) return;

    setOrder((prevOrder) => {
      if (!prevOrder) return prevOrder;

      return {
        ...prevOrder,
        orderStatus: data.status,
      };
    });
  };

  socket.on("connect", joinRoom);
  socket.on("orderStatusUpdated", handleStatusUpdate);

  if (socket.connected) {
    joinRoom();
  }

  return () => {
    socket.off("connect", joinRoom);
    socket.off("orderStatusUpdated", handleStatusUpdate);
  };
}, [order?._id, setOrder,getOrderDetails]);

  const paymentStatus = order?.paymentStatus || "PENDING";

  const paymentStyles = {
    SUCCESS: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFF8F0]">
        <p className="animate-pulse text-lg font-semibold text-[#E63946]">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <p className="mb-5 text-gray-600">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Go Back
          </button>
          <button
            onClick={getOrderDetails}
            className="rounded-lg bg-[#E63946] px-5 py-2.5 font-semibold text-white transition hover:bg-[#C1121F]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <FaReceipt className="mb-4 text-5xl text-gray-300" />
        <h2 className="text-2xl font-bold text-[#1F1F1F]">
          Order Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          We couldn't find this order.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-lg bg-[#E63946] px-5 py-2.5 font-semibold text-white hover:bg-[#C1121F]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const address = order.deliveryAddress;

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 font-semibold text-gray-600 transition hover:text-[#E63946]"
        >
          <FaArrowLeft />
          Back to My Orders
        </button>

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            Order Details
          </h1>
          <p className="mt-2 text-gray-600">
            Review your pizza order and delivery information.
          </p>
        </div>

        {/* Order summary */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="mt-1 break-all font-semibold text-[#1F1F1F]">
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
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  paymentStyles[paymentStatus] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                Payment: {paymentStatus}
              </span>

              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                {order.orderStatus || "Order Received"}
              </span>
            </div>
          </div>

          {/* Pizza items */}
          <div className="divide-y divide-gray-100 px-5 sm:px-6">
            {order.items?.map((item, index) => (
              <div
                key={item._id || `${item.pizza?._id || "pizza"}-${index}`}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start"
              >
                <img
                  src={item.pizza?.image || "/pizza-placeholder.png"}
                  alt={item.pizza?.name || "Pizza"}
                  className="h-28 w-28 shrink-0 rounded-xl border border-gray-100 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[#1F1F1F]">
                    {item.pizza?.name || "Pizza"}
                  </h2>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                    <p className="text-gray-500">
                      Base
                      <span className="mt-1 block font-medium text-gray-800">
                        {item.base || "N/A"}
                      </span>
                    </p>

                    <p className="text-gray-500">
                      Sauce
                      <span className="mt-1 block font-medium text-gray-800">
                        {item.sauce || "N/A"}
                      </span>
                    </p>

                    <p className="text-gray-500">
                      Cheese
                      <span className="mt-1 block font-medium text-gray-800">
                        {item.cheese || "N/A"}
                      </span>
                    </p>

                    <p className="text-gray-500">
                      Quantity
                      <span className="mt-1 block font-medium text-gray-800">
                        {item.quantity || 1}
                      </span>
                    </p>
                  </div>

                  {Array.isArray(item.vegetables) &&
                    item.vegetables.length > 0 && (
                      <p className="mt-3 text-sm text-gray-500">
                        Vegetables: {item.vegetables.join(", ")}
                      </p>
                    )}
                </div>

                <p className="text-lg font-bold text-[#E63946] sm:min-w-24 sm:text-right">
                  ₹
                  {(
                    Number(item.price || 0) * Number(item.quantity || 1)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-5 sm:px-6">
            <div>
              <p className="font-semibold text-gray-700">Total Amount</p>
              <p className="mt-1 text-xs text-gray-500">
                Final order total
              </p>
            </div>
            <p className="text-2xl font-bold text-[#E63946]">
              ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Delivery address */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-[#E63946]">
              <FaMapMarkerAlt className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">
                Delivery Address
              </h2>
              <p className="text-sm text-gray-500">
                Your order will be delivered here.
              </p>
            </div>
          </div>

          {address ? (
            <div className="space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                {address.fullName}
              </p>
              <p>{address.phone}</p>
              <p>
                {[address.house, address.street, address.city, address.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {address.pincode && <p>PIN: {address.pincode}</p>}
            </div>
          ) : (
            <p className="border-t border-gray-100 pt-4 text-sm text-gray-500">
              Delivery address is not available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}