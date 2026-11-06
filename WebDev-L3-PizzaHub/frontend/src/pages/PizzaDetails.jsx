import React, { useEffect, useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PizzaDetails() {
  const { pizzaId } = useParams();

  const [loading, setLoading] = useState(false);
  const [pizzaDetails, setPizzaDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getPizza() {
      setLoading(true);

      try {
        const res = await api.get(`/pizza/get-pizza/${pizzaId}`);

        console.log(res.data.pizza);
        setPizzaDetails(res.data.pizza);
      } catch (error) {
        console.log("Error while fetching pizza:", error);
      } finally {
        setLoading(false);
      }
    }

    getPizza();
  }, [pizzaId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <p className="text-lg font-semibold text-gray-600">
          Loading pizza details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10 sm:px-6 lg:px-10">
      {pizzaDetails && (
        <div className="mx-auto max-w-6xl">
          {/* Main Card */}
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-2">
            {/* Pizza Image */}
            <div className="h-[300px] sm:h-[400px] md:h-full">
              <img
                src={pizzaDetails.image}
                alt={pizzaDetails.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Pizza Details */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              {/* Category */}
              <span className="mb-3 w-fit rounded-full bg-[#E63946]/10 px-4 py-1 text-sm font-semibold text-[#E63946]">
                {pizzaDetails.category}
              </span>

              {/* Name */}
              <h1 className="text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
                {pizzaDetails.name}
              </h1>

              <p className="mt-2 text-gray-500">
                Customize your pizza with your favorite ingredients.
              </p>

              {/* Ingredients */}
              <div className="mt-8 space-y-4">
                <div className="rounded-xl bg-[#FFF8F0] p-4">
                  <p className="text-sm font-medium text-gray-500">Base</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {pizzaDetails.base}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF8F0] p-4">
                  <p className="text-sm font-medium text-gray-500">Sauce</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {pizzaDetails.sauce}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF8F0] p-4">
                  <p className="text-sm font-medium text-gray-500">Cheese</p>
                  <p className="mt-1 font-semibold text-[#1F1F1F]">
                    {pizzaDetails.cheese}
                  </p>
                </div>

                {/* Vegetables */}
                <div className="rounded-xl bg-[#FFF8F0] p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Vegetables
                  </p>

                  <ul className="mt-2 flex flex-wrap gap-2">
                    {pizzaDetails.vegetable.map((veg) => (
                      <li
                        key={veg}
                        className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
                      >
                        {veg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price */}
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <span className="text-lg font-semibold text-gray-600">
                  Price
                </span>

                <div className="flex items-center text-2xl font-bold text-[#1F1F1F]">
                  <FaIndianRupeeSign className="mr-1" />
                  {pizzaDetails.price}
                </div>
              </div>

              {/* Customize Button */}
              <button
                onClick={() => navigate(`/build-pizza/${pizzaId}`)}
                className="mt-6 w-full rounded-xl bg-[#E63946] px-6 py-3.5 text-lg font-semibold text-white transition duration-200 hover:bg-[#C1121F] hover:shadow-lg"
              >
                Customize Pizza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
