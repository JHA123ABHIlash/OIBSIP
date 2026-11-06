import React, { useCallback, useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaPlus,
  FaRotateRight,
  FaPen,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../services/api";

const CATEGORIES = [
  { value: "base", label: "Pizza Base" },
  { value: "sauce", label: "Sauce" },
  { value: "cheese", label: "Cheese" },
  { value: "vegetable", label: "Vegetable" },
];

const EMPTY_FORM = {
  name: "",
  category: "base",
  quantity: "",
  threshold: "5",
};

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/inventory/get-all-inventory");
      const inventory = response.data.inventory;

      if (!Array.isArray(inventory)) {
        throw new Error("Invalid inventory response from server.");
      }

      setItems(inventory);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to fetch inventory."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    setForm({
      name: item.name || "",
      category: item.category || "base",
      quantity: String(item.quantity ?? 0),
      threshold: String(item.threshold ?? 5),
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const quantity = Number(form.quantity);
    const threshold = Number(form.threshold);

    if (!name) {
      toast.error("Please enter the item name.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      toast.error("Quantity must be a valid non-negative number.");
      return;
    }

    if (
      form.threshold.trim() === "" ||
      !Number.isFinite(threshold) ||
      threshold < 0
    ) {
      toast.error("Threshold must be a valid non-negative number.");
      return;
    }

    const payload = {
      name,
      category: form.category,
      quantity,
      threshold,
    };

    try {
      setSaving(true);

      if (editingId) {
        const response = await api.put(
          `/inventory/update-inventory/${editingId}`,
          payload
        );

        const updatedItem = response.data.inventory;

        setItems((previous) =>
          previous.map((item) =>
            item._id === editingId ? updatedItem : item
          )
        );

        toast.success("Inventory item updated successfully.");
      } else {
        const response = await api.post(
          "/inventory/create-inventory",
          payload
        );

        const newItem = response.data.inventory;

        setItems((previous) => [...previous, newItem]);
        toast.success("New inventory item added successfully.");
      }

      closeForm();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Unable to ${editingId ? "update" : "add"} inventory item.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}" from inventory?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      await api.delete(`/inventory/delete-inventory/${item._id}`);

      setItems((previous) =>
        previous.filter((entry) => entry._id !== item._id)
      );

      toast.success("Inventory item deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete inventory item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(
    (item) => item.quantity <= item.threshold
  ).length;

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  function categoryLabel(category) {
    return (
      CATEGORIES.find((item) => item.value === category)?.label || category
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#E63946]">
            Stock Management
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Inventory
          </h1>
          <p className="mt-2 text-gray-600">
            Manage pizza ingredients and monitor stock levels.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchInventory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold hover:border-[#E63946] disabled:opacity-60"
          >
            <FaRotateRight className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63946] px-4 py-3 font-bold text-white hover:bg-[#C1121F]"
          >
            <FaPlus />
            Add New Item
          </button>
        </div>
      </div>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Inventory Items",
            value: items.length,
            color: "bg-red-50 text-[#E63946]",
          },
          {
            label: "Low Stock Items",
            value: lowStockCount,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Total Quantity",
            value: totalQuantity.toLocaleString("en-IN"),
            color: "bg-green-50 text-green-700",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">
                {stat.label}
              </p>
              <span className={`rounded-xl p-3 ${stat.color}`}>
                <FaBoxOpen />
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold">{stat.value}</p>
          </article>
        ))}
      </section>

      {/* Add/Edit Form */}
      {showForm && (
        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the ingredient and its current stock details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <FaXmark />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="inventory-name"
                className="mb-2 block text-sm font-semibold"
              >
                Item Name *
              </label>
              <input
                id="inventory-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mozzarella Cheese"
                maxLength={100}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label
                htmlFor="inventory-category"
                className="mb-2 block text-sm font-semibold"
              >
                Category *
              </label>
              <select
                id="inventory-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#E63946]"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="inventory-quantity"
                className="mb-2 block text-sm font-semibold"
              >
                Current Quantity *
              </label>
              <input
                id="inventory-quantity"
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="0"
                step="any"
                placeholder="e.g. 20"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label
                htmlFor="inventory-threshold"
                className="mb-2 block text-sm font-semibold"
              >
                Low Stock Threshold *
              </label>
              <input
                id="inventory-threshold"
                type="number"
                name="threshold"
                value={form.threshold}
                onChange={handleChange}
                min="0"
                step="any"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                An item is marked low stock when quantity is at or below this
                value.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#E63946] px-5 py-3 font-bold text-white hover:bg-[#C1121F] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Inventory Item"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-3 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Inventory Table */}
      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ingredient name..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946]"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#E63946]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <FaBoxOpen className="mx-auto text-4xl text-gray-300" />
            <h3 className="mt-4 font-bold">No inventory items found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or add a new item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Item Name</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Threshold</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isLow = item.quantity <= item.threshold;

                  return (
                    <tr key={item._id} className="hover:bg-orange-50/40">
                      <td className="px-5 py-4 font-semibold">{item.name}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize">
                          {categoryLabel(item.category)}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4">{item.threshold}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                            isLow
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            title="Edit item"
                            aria-label={`Edit ${item.name}`}
                            className="rounded-lg border border-gray-200 p-2.5 text-blue-700 hover:bg-blue-50"
                          >
                            <FaPen />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item._id}
                            title="Delete item"
                            aria-label={`Delete ${item.name}`}
                            className="rounded-lg border border-gray-200 p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}