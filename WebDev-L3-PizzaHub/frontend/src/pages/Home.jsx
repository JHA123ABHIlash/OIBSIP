import React, { useEffect, useState } from "react";
import pizzaImage from "../assets/heroPizza.png";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import catImg from "../assets/logo.jpg";
import PizzaCard from "../components/Pizzacards";
import api from "../services/api";

export default function Home() {
  const navigate = useNavigate();

  const [pizza, setPizza] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPizza() {
      setLoading(true);

      try {
        const res = await api.get("/pizza/get-all-pizza");
        setPizza(res.data.pizza);
      } catch (error) {
        console.log("Error while fetching pizzas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPizza();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">

      {/* Hero Section */}
      <section
        className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${pizzaImage})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-6xl px-6">

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Fresh Pizza,
            </h1>

            <h1 className="text-4xl font-bold text-amber-300 md:text-5xl lg:text-6xl">
              Made Your Way
            </h1>
          </div>

          {/* Description */}
          <div className="mb-6 pl-4">
            <p className="font-semibold text-blue-200">
              Hot, cheesy and absolutely delicious.
            </p>

            <p className="font-semibold text-blue-200">
              Order your favorite pizza now!
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-8">
            <p className="text-white">
              <span className="text-2xl text-amber-500">•</span> Fresh
              ingredients
            </p>

            <p className="text-white">
              <span className="text-2xl text-amber-500">•</span> Custom
              toppings
            </p>

            <p className="text-white">
              <span className="text-2xl text-amber-500">•</span> Fast delivery
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-5">
            <button
              className="rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#C1121F]"
              onClick={() => navigate("/menu")}
            >
              Order Now
            </button>

            <button
              className="rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#C1121F]"
              onClick={() => navigate("/build-pizza")}
            >
              Build Your Pizza
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="mt-8 w-full bg-[#FFF8F0] px-6 py-10">
        <h2 className="mb-8 text-center text-3xl font-bold text-black md:text-4xl">
          Explore Our Pizzas
        </h2>

        <div className="flex flex-wrap justify-center gap-6">
          <CategoryCard img={catImg} title="Classic" />
          <CategoryCard img={catImg} title="Veggie" />
          <CategoryCard img={catImg} title="Cheese" />
          <CategoryCard img={catImg} title="Spicy" />
        </div>
      </div>

      {/* Featured Pizzas */}
      <div className="bg-[#FFF8F0] px-6 py-10">
        <h2 className="mb-8 text-center text-3xl font-bold text-black md:text-4xl">
          Featured Pizzas
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="py-10 text-center text-lg font-semibold text-gray-600">
            Loading pizzas...
          </div>
        )}

        {/* Pizza Cards */}
        {!loading && pizza.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {pizza.slice(0, 4).map((el) => (
              <PizzaCard
                key={el._id}
                id={el._id}
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
        {!loading && pizza.length === 0 && (
          <div className="py-10 text-center text-lg font-semibold text-gray-600">
            No pizzas available.
          </div>
        )}
      </div>
    </div>
  );
}
