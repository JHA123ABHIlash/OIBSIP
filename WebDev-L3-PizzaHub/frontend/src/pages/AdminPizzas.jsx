
import React, { useCallback, useEffect, useState } from "react";
import {
  FaPlus,
  FaRotateRight,
  FaPen,
  FaTrash,
  FaXmark,
  FaPizzaSlice,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../services/api";

const EMPTY_FORM = {
  name: "",
  base: "",
  sauce: "",
  cheese: "",
  vegetable: "",
  price: "",
  image: "",
  category: "",
};

export default function AdminPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchPizzas = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/pizza/get-all-pizza");
      const data = response.data.pizza || [];

      if (!Array.isArray(data)) {
        throw new Error("Invalid pizza response.");
      }

      setPizzas(data);
    } catch (error) {
      // Your API returns 404 when no pizzas exist.
      if (error.response?.status === 404) {
        setPizzas([]);
      } else {
        toast.error(
          error.response?.data?.message || "Unable to load pizzas."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPizzas();
  }, [fetchPizzas]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openAddForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(pizza) {
    setForm({
      name: pizza.name || "",
      base: pizza.base || "",
      sauce: pizza.sauce || "",
      cheese: pizza.cheese || "",
      vegetable: Array.isArray(pizza.vegetable)
        ? pizza.vegetable.join(", ")
        : pizza.vegetable || "",
      price: String(pizza.price ?? ""),
      image: pizza.image || "",
      category: pizza.category || "",
    });

    setEditingId(pizza._id);
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
    const base = form.base.trim();
    const sauce = form.sauce.trim();
    const cheese = form.cheese.trim();
    const category = form.category.trim();
    const image = form.image.trim();
    const price = Number(form.price);

    if (
      !name ||
      !base ||
      !sauce ||
      !cheese ||
      !category ||
      !image ||
      form.vegetable.trim() === ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      toast.error("Enter a valid price greater than zero.");
      return;
    }

    const vegetable = form.vegetable
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (vegetable.length === 0) {
      toast.error("Enter at least one vegetable or topping.");
      return;
    }

    const payload = {
      name,
      base,
      sauce,
      cheese,
      vegetable,
      price,
      image,
      category,
    };

    try {
      setSaving(true);

      if (editingId) {
        const response = await api.put(
          `/pizza/update-pizza/${editingId}`,
          payload
        );

        const updatedPizza = response.data.pizza;

        setPizzas((previous) =>
          previous.map((pizza) =>
            pizza._id === editingId ? updatedPizza : pizza
          )
        );

        toast.success("Pizza updated successfully.");
      } else {
        const response = await api.post("/pizza/create-pizza", payload);

        setPizzas((previous) => [
          ...previous,
          response.data.pizza,
        ]);

        toast.success("Pizza added successfully.");
      }

      closeForm();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save pizza."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pizza) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${pizza.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(pizza._id);

      await api.delete(`/pizza/delete-pizza/${pizza._id}`);

      setPizzas((previous) =>
        previous.filter((item) => item._id !== pizza._id)
      );

      toast.success("Pizza deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete pizza."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const categories = [
    ...new Set(pizzas.map((pizza) => pizza.category).filter(Boolean)),
  ];

  const filteredPizzas = pizzas.filter((pizza) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      String(pizza.name || "").toLowerCase().includes(query) ||
      String(pizza.category || "").toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" ||
      pizza.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#E63946]">
            Product Management
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Pizza Management
          </h1>
          <p className="mt-2 text-gray-600">
            Add, update and manage your pizza menu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchPizzas}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold hover:border-[#E63946] disabled:opacity-60"
          >
            <FaRotateRight className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#E63946] px-4 py-3 font-bold text-white hover:bg-[#C1121F]"
          >
            <FaPlus />
            Add Pizza
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Pizzas" value={pizzas.length} />
        <StatCard
          label="Categories"
          value={categories.length}
        />
        <StatCard
          label="Average Price"
          value={
            pizzas.length
              ? `₹${Math.round(
                  pizzas.reduce(
                    (sum, pizza) => sum + Number(pizza.price || 0),
                    0
                  ) / pizzas.length
                ).toLocaleString("en-IN")}`
              : "₹0"
          }
        />
      </section>

      {showForm && (
        <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Pizza" : "Add New Pizza"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the pizza details below.
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
            <FormField label="Pizza Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Farmhouse Pizza" />
            <FormField label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Veg Pizza" />
            <FormField label="Base" name="base" value={form.base} onChange={handleChange} placeholder="e.g. Thin Crust" />
            <FormField label="Sauce" name="sauce" value={form.sauce} onChange={handleChange} placeholder="e.g. Tomato" />
            <FormField label="Cheese" name="cheese" value={form.cheese} onChange={handleChange} placeholder="e.g. Mozzarella" />

            <FormField
              label="Price (₹)"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 299"
              type="number"
              min="0.01"
              step="any"
            />

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Vegetables / Toppings *
              </label>
              <input
                name="vegetable"
                value={form.vegetable}
                onChange={handleChange}
                placeholder="Capsicum, Onion, Corn"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter multiple toppings separated by commas.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/pizza.jpg"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
              />

              {form.image.trim() && (
                <img
                  src={form.image}
                  alt="Pizza preview"
                  className="mt-3 h-36 w-36 rounded-xl border border-gray-200 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
                  }}
                />
              )}
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
                    : "Create Pizza"}
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

      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pizzas..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946]"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#E63946]"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="p-12 text-center text-gray-500">
            Loading pizzas...
          </p>
        ) : filteredPizzas.length === 0 ? (
          <div className="p-12 text-center">
            <FaPizzaSlice className="mx-auto text-4xl text-gray-300" />
            <h3 className="mt-4 font-bold">No pizzas found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search or add a new pizza.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Pizza</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Base</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Toppings</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPizzas.map((pizza) => (
                  <tr key={pizza._id} className="hover:bg-orange-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pizza.image}
                          alt={pizza.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <span className="font-semibold">{pizza.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{pizza.category}</td>
                    <td className="px-5 py-4">{pizza.base}</td>
                    <td className="px-5 py-4 font-bold text-[#C1121F]">
                      ₹{Number(pizza.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="max-w-52 px-5 py-4">
                      {Array.isArray(pizza.vegetable)
                        ? pizza.vegetable.join(", ")
                        : pizza.vegetable}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(pizza)}
                          aria-label={`Edit ${pizza.name}`}
                          title="Edit pizza"
                          className="rounded-lg border border-gray-200 p-2.5 text-blue-700 hover:bg-blue-50"
                        >
                          <FaPen />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(pizza)}
                          disabled={deletingId === pizza._id}
                          aria-label={`Delete ${pizza.name}`}
                          title="Delete pizza"
                          className="rounded-lg border border-gray-200 p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
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

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
}) {
  return (
    <div>
      <label
        htmlFor={`pizza-${name}`}
        className="mb-2 block text-sm font-semibold"
      >
        {label} *
      </label>
      <input
        id={`pizza-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
      />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-4 text-3xl font-extrabold">{value}</p>
    </article>
  );
}
