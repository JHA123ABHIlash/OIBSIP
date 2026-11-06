import React, { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AssignDeliveryAgent() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState(null);

  async function loadData() {
    try {
      const [ordersResponse, agentsResponse] = await Promise.all([
        api.get("/order/get-all-order"),
        api.get("/user/get-delivery-agents"),
      ]);

      const orderData =
        ordersResponse.data.orders || ordersResponse.data.data || [];

      const agentData = agentsResponse.data.agents || [];

      setOrders(Array.isArray(orderData) ? orderData : []);
      setAgents(Array.isArray(agentData) ? agentData : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load orders or agents"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const eligibleOrders = orders.filter(
    (order) =>
      order.paymentStatus === "SUCCESS" &&
      !order.deliveryAgent &&
      order.deliveryStatus !== "Delivered"
  );

  async function handleAssign(orderId) {
    const agentId = selectedAgents[orderId];

    if (!agentId) {
      toast.error("Please select a delivery agent");
      return;
    }

    try {
      setAssigningOrder(orderId);

      const response = await api.post("/delivery/assign", {
        orderId,
        agentId,
      });

      toast.success(
        response.data.message || "Delivery agent assigned successfully"
      );

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign delivery agent"
      );
    } finally {
      setAssigningOrder(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading delivery assignments...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#E63946]">
          Delivery Management
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          Assign Delivery Agents
        </h1>
        <p className="mt-2 text-gray-600">
          Assign paid orders to verified delivery agents.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Awaiting Assignment</p>
          <p className="mt-2 text-3xl font-extrabold">
            {eligibleOrders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Verified Agents</p>
          <p className="mt-2 text-3xl font-extrabold">{agents.length}</p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid Orders</p>
          <p className="mt-2 text-3xl font-extrabold">
            {orders.filter((order) => order.paymentStatus === "SUCCESS").length}
          </p>
        </div>
      </div>

      {agents.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          No verified delivery agents found. Register an agent and verify
          their email first.
        </div>
      )}

      {eligibleOrders.length === 0 ? (
        <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold">No orders awaiting assignment</h2>
          <p className="mt-2 text-gray-500">
            A successfully paid, unassigned order will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {eligibleOrders.map((order) => (
            <article
              key={order._id}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <h2 className="font-bold">
                    #{String(order._id).slice(-8)}
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  PAYMENT SUCCESS
                </span>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Customer: </span>
                  <span className="font-semibold">
                    {order.deliveryAddress?.fullName || "Customer"}
                  </span>
                </p>

                <p>
                  <span className="text-gray-500">Phone: </span>
                  {order.deliveryAddress?.phone || "Not available"}
                </p>

                <p>
                  <span className="text-gray-500">Delivery address: </span>
                  {[
                    order.deliveryAddress?.house,
                    order.deliveryAddress?.street,
                    order.deliveryAddress?.city,
                    order.deliveryAddress?.state,
                    order.deliveryAddress?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not available"}
                </p>

                <p>
                  <span className="text-gray-500">Amount: </span>
                  <span className="font-bold">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </p>

                <p>
                  <span className="text-gray-500">Order status: </span>
                  {order.orderStatus || "Order Received"}
                </p>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <label
                  htmlFor={`agent-${order._id}`}
                  className="mb-2 block text-sm font-semibold"
                >
                  Select delivery agent
                </label>

                <select
                  id={`agent-${order._id}`}
                  value={selectedAgents[order._id] || ""}
                  onChange={(e) =>
                    setSelectedAgents((prev) => ({
                      ...prev,
                      [order._id]: e.target.value,
                    }))
                  }
                  disabled={agents.length === 0 || assigningOrder === order._id}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-[#E63946]"
                >
                  <option value="">Choose an agent</option>

                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} — {agent.email}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAssign(order._id)}
                  disabled={
                    !selectedAgents[order._id] ||
                    agents.length === 0 ||
                    assigningOrder === order._id
                  }
                  className="mt-3 w-full rounded-lg bg-[#E63946] px-4 py-3 font-semibold text-white transition hover:bg-[#C1121F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assigningOrder === order._id
                    ? "Assigning..."
                    : "Assign Delivery Agent"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
