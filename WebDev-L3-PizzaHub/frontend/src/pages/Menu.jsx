
import React, { useEffect, useState } from "react";
import PizzaCard from "../components/Pizzacards";
import api from "../services/api";

export default function Menu() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [pizza, setPizza] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPizza() {
      setLoading(true);
      setError(false);

      try {
        const res = await api.get("/pizza/get-all-pizza");
        setPizza(res.data.pizza);
        console.log(res.data.pizza);
      } catch (error) {
        console.log("Error while fetching pizzas:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPizza();
  }, []);

  console.log("Pizza Is :", pizza);

  const filteredPizza =
  activeFilter === "All"
    ? pizza
    : pizza.filter((el) => el.category === activeFilter);

  return (
    <div className="min-h-screen pb-4 bg-[#FFF8F0]">
      {/* Heading */}
      <div className="px-4">
        <h2 className="mb-4 pt-4 text-center text-3xl font-bold text-black md:text-4xl">
          Our Menu
        </h2>

        <p className="mb-8 text-center text-gray-500">
          Choose from our wide range of delicious Pizzas
        </p>
      </div>

{/* Filter Button */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 px-4 text-center sm:gap-4">
        <button
          onClick={() => setActiveFilter("All")}
          className={`rounded-4xl px-4 py-2 text-sm font-medium transition sm:text-base ${
            activeFilter === "All"
              ? "bg-[#E63946] text-white"
              : "bg-white text-black hover:bg-[#E63946] hover:text-white"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveFilter("Veg")}
          className={`rounded-4xl px-4 py-2 text-sm font-medium transition sm:text-base ${
            activeFilter === "Veg"
              ? "bg-[#E63946] text-white"
              : "bg-white text-black hover:bg-[#E63946] hover:text-white"
          }`}
        >
          Veg
        </button>

        <button
          onClick={() => setActiveFilter("Non-Veg")}
          className={`rounded-4xl px-4 py-2 text-sm font-medium transition sm:text-base ${
            activeFilter === "Non-Veg"
              ? "bg-[#E63946] text-white"
              : "bg-white text-black hover:bg-[#E63946] hover:text-white"
          }`}
        >
          Non-Veg
        </button>

        <button
          onClick={() => setActiveFilter("Cheese Burst")}
          className={`rounded-4xl px-4 py-2 text-sm font-medium transition sm:text-base ${
            activeFilter === "Cheese Burst"
              ? "bg-[#E63946] text-white"
              : "bg-white text-black hover:bg-[#E63946] hover:text-white"
          }`}
        >
          Cheese Burst
        </button>

        <button
          onClick={() => setActiveFilter("Classic")}
          className={`rounded-4xl px-4 py-2 text-sm font-medium transition sm:text-base ${
            activeFilter === "Classic"
              ? "bg-[#E63946] text-white"
              : "bg-white text-black hover:bg-[#E63946] hover:text-white"
          }`}
        >
          Classic
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-10 text-center text-lg font-semibold text-gray-600">
          Loading pizzas...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="py-10 text-center text-lg font-semibold text-red-600">
          Unable to load pizzas. Please try again.
        </div>
      )}

      {/* Pizza Cards */}
      {!loading && !error && filteredPizza.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 pb-6">
          {filteredPizza.map((el) => (
            <PizzaCard
              id={el._id}
              key={el._id}
              img={el.image}
              name={el.name}
              base={el.base}
              sauce={el.sauce}
              cheese={el.cheese}
             vegetable={el.vegetable}
              price={el.price}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPizza.length === 0 && (
        <div className="py-10 text-center text-lg font-semibold text-gray-600">
          No pizzas available.
        </div>
      )}
    </div>
  );
}

