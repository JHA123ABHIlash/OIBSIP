
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaIndianRupeeSign,
  FaCheck,
  FaMinus,
  FaPlus,
  FaCartShopping,
} from "react-icons/fa6";
import toast from "react-hot-toast";

import api from "../services/api";
import { addToCart } from "../redux/slices/cartSlice";

const BASES = ["Thin Crust", "Thick Crust", "Cheese Burst"];
const SAUCES = ["Tomato", "BBQ", "Peri Peri"];
const CHEESES = ["Plain", "Mozzarella", "Parmesan"];

const TOPPING_OPTIONS = [
  "Onion",
  "Capsicum",
  "Sweet Corn",
  "Olives",
  "Mushroom",
  "Tomato",
  "Jalapeno",
  "Paneer",
];

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-200 ${
        selected
          ? "border-[#E63946] bg-red-50 text-[#C1121F]"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#E63946]"
      }`}
    >
      {label}
      {selected && <FaCheck className="shrink-0 text-[#E63946]" />}
    </button>
  );
}

export default function BuildPizza() {
  const { pizzaId } = useParams();
  const dispatch = useDispatch();

  const [pizzas, setPizzas] = useState([]);
  const [pizzaDetails, setPizzaDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBase, setSelectedBase] = useState(BASES[0]);
  const [selectedSauce, setSelectedSauce] = useState(SAUCES[0]);
  const [selectedCheese, setSelectedCheese] = useState(CHEESES[0]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const getPizzas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (pizzaId) {
        // Existing pizza selected from a pizza card.
        const res = await api.get(`/pizza/get-pizza/${pizzaId}`);
        const pizza = res.data.pizza;

        if (!pizza) {
          throw new Error("Pizza not found.");
        }

        setPizzaDetails(pizza);
        setSelectedBase(pizza.base || BASES[0]);
        setSelectedSauce(pizza.sauce || SAUCES[0]);
        setSelectedCheese(pizza.cheese || CHEESES[0]);
        setSelectedToppings(
          Array.isArray(pizza.vegetable) ? pizza.vegetable : []
        );
      } else {
        // Direct access from the Navbar.
        const res = await api.get("/pizza/get-all-pizza");

        // Handle common API response property names.
        const list =
          res.data.pizzas ||
          res.data.pizza ||
          res.data.data ||
          [];

        if (!Array.isArray(list) || list.length === 0) {
          throw new Error("No pizzas are available right now.");
        }

        setPizzas(list);

        // Use the first database pizza as the initial product.
        const pizza = list[0];

        setPizzaDetails(pizza);
        setSelectedBase(pizza.base || BASES[0]);
        setSelectedSauce(pizza.sauce || SAUCES[0]);
        setSelectedCheese(pizza.cheese || CHEESES[0]);
        setSelectedToppings(
          Array.isArray(pizza.vegetable) ? pizza.vegetable : []
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pizzas. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [pizzaId]);

  useEffect(() => {
    getPizzas();
  }, [getPizzas]);

  function handlePizzaChange(id) {
    const pizza = pizzas.find((item) => item._id === id);

    if (!pizza) return;

    setPizzaDetails(pizza);
    setSelectedBase(pizza.base || BASES[0]);
    setSelectedSauce(pizza.sauce || SAUCES[0]);
    setSelectedCheese(pizza.cheese || CHEESES[0]);
    setSelectedToppings(
      Array.isArray(pizza.vegetable) ? pizza.vegetable : []
    );
    setQuantity(1);
  }

  function handleTopping(topping) {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((item) => item !== topping)
        : [...prev, topping]
    );
  }

  function handleAddToCart() {
    if (!pizzaDetails) {
      toast.error("Please select a pizza first.");
      return;
    }

    if (!selectedBase || !selectedSauce || !selectedCheese) {
      toast.error("Please select your base, sauce and cheese.");
      return;
    }

    const cartItem = {
      cartItemId: `${pizzaDetails._id}-${Date.now()}`,
      pizzaId: pizzaDetails._id,
      name: pizzaDetails.name,
      image: pizzaDetails.image,
      base: selectedBase,
      sauce: selectedSauce,
      cheese: selectedCheese,
      toppings: selectedToppings,
      vegetable: selectedToppings,
      quantity,
      price: Number(pizzaDetails.price),
    };

    dispatch(addToCart(cartItem));
    toast.success("Custom pizza added to cart!");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FFF8F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-[#E63946]" />
          <p className="font-semibold text-gray-600">
            Loading pizza builder...
          </p>
        </div>
      </div>
    );
  }

  if (error || !pizzaDetails) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <h2 className="text-2xl font-bold text-[#1F1F1F]">
          Unable to load Pizza Builder
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "No pizza found."}
        </p>
        <button
          type="button"
          onClick={getPizzas}
          className="mt-5 rounded-xl bg-[#E63946] px-5 py-3 font-semibold text-white transition hover:bg-[#C1121F]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Include database toppings and common builder options.
  const availableToppings = [
    ...new Set([
      ...TOPPING_OPTIONS,
      ...(Array.isArray(pizzaDetails.vegetable)
        ? pizzaDetails.vegetable
        : []),
    ]),
  ];

  const totalPrice = Number(pizzaDetails.price || 0) * quantity;

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C1121F]">
            Make it yours
          </span>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1F1F1F] sm:text-4xl">
            Build Your Pizza
          </h1>

          <p className="mt-2 text-gray-600">
            Pick your favourite ingredients and create your own combination.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          {/* Pizza preview */}
          <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
            <div className="relative">
              <img
                src={pizzaDetails.image}
                alt={pizzaDetails.name}
                className="h-64 w-full object-cover sm:h-80"
              />

              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-[#C1121F] shadow-sm">
                Your pizza
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-[#1F1F1F]">
                {pizzaDetails.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Customize the base, sauce, cheese and toppings before adding
                your pizza to the cart.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#FFF8F0] p-4">
                <div>
                  <p className="text-sm text-gray-500">Price per pizza</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#E63946]">
                    <FaIndianRupeeSign className="mr-0.5 inline text-xl" />
                    {Number(pizzaDetails.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 text-[#E63946]">
                  <FaCartShopping className="text-xl" />
                </div>
              </div>

              {/* Select the starting pizza only on the direct builder page */}
              {!pizzaId && (
                <div className="mt-5">
                  <label
                    htmlFor="pizza-choice"
                    className="mb-2 block text-sm font-bold text-[#1F1F1F]"
                  >
                    Choose Pizza
                  </label>

                  <select
                    id="pizza-choice"
                    value={pizzaDetails._id}
                    onChange={(e) => handlePizzaChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
                  >
                    {pizzas.map((pizza) => (
                      <option key={pizza._id} value={pizza._id}>
                        {pizza.name} — ₹{pizza.price}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-gray-500">
                    Choose a pizza first, then customize its ingredients.
                  </p>
                </div>
              )}

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Your selected toppings
                </p>

                {selectedToppings.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedToppings.map((topping) => (
                      <span
                        key={topping}
                        className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#C1121F]"
                      >
                        {topping}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No toppings selected.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Customization form */}
          <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
            {/* Base */}
            <div>
              <h3 className="mb-3 text-lg font-bold text-[#1F1F1F]">
                1. Choose Base
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {BASES.map((base) => (
                  <OptionButton
                    key={base}
                    label={base}
                    selected={selectedBase === base}
                    onClick={() => setSelectedBase(base)}
                  />
                ))}
              </div>
            </div>

            {/* Sauce */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-lg font-bold text-[#1F1F1F]">
                2. Choose Sauce
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {SAUCES.map((sauce) => (
                  <OptionButton
                    key={sauce}
                    label={sauce}
                    selected={selectedSauce === sauce}
                    onClick={() => setSelectedSauce(sauce)}
                  />
                ))}
              </div>
            </div>

            {/* Cheese */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-lg font-bold text-[#1F1F1F]">
                3. Choose Cheese
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {CHEESES.map((cheese) => (
                  <OptionButton
                    key={cheese}
                    label={cheese}
                    selected={selectedCheese === cheese}
                    onClick={() => setSelectedCheese(cheese)}
                  />
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-[#1F1F1F]">
                4. Choose Toppings
              </h3>

              <p className="mb-3 mt-1 text-sm text-gray-500">
                Select as many as you like.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {availableToppings.map((topping) => (
                  <button
                    key={topping}
                    type="button"
                    onClick={() => handleTopping(topping)}
                    aria-pressed={selectedToppings.includes(topping)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-200 ${
                      selectedToppings.includes(topping)
                        ? "border-[#E63946] bg-[#E63946] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#E63946] hover:text-[#C1121F]"
                    }`}
                  >
                    {selectedToppings.includes(topping) && (
                      <FaCheck className="mr-1.5 inline text-xs" />
                    )}
                    {topping}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-[#1F1F1F]">
                5. Quantity
              </h3>

              <div className="mt-3 inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-red-50 hover:text-[#E63946] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaMinus />
                </button>

                <span className="min-w-12 text-center text-lg font-bold text-[#1F1F1F]">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-red-50 hover:text-[#E63946]"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div className="mt-7 rounded-2xl bg-[#FFF8F0] p-5">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Price per pizza</span>
                <span>
                  ₹{Number(pizzaDetails.price || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>Quantity</span>
                <span>× {quantity}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-orange-200 pt-4">
                <span className="font-bold text-[#1F1F1F]">
                  Estimated Total
                </span>

                <span className="text-2xl font-extrabold text-[#E63946]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                This total uses the selected pizza's base price. Extra
                ingredient charges are not included.
              </p>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E63946] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#C1121F] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:ring-offset-2 active:translate-y-0"
            >
              <FaCartShopping />
              Add to Cart
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
