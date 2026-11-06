import React from "react";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";

export default function PizzaCard({
  id,
  img,
  name,
  base,
  sauce,
  cheese,
  price,
  vegetable,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

   console.log("Vegetable value:", vegetable);

  return (
    <div className="w-[280px] rounded-2xl bg-white p-4 shadow-md">

      {/* Pizza Image */}
      <div className="h-[170px] overflow-hidden rounded-xl">
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Pizza Details */}
      <div className="mt-4">

        <h3 className="text-xl font-bold text-black">
          {name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-600">
          {base} & {sauce} sauce
        </p>

        <div className="mt-2 line-clamp-2 text-sm font-medium text-gray-600">
          <ul>
  {Array.isArray(vegetable) &&
    vegetable.map((veg) => (
      <li key={veg}>{veg}</li>
    ))}
</ul>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center font-bold text-black">
          <FaRupeeSign />
          <span>{price}</span>
        </div>

        {/* Add To Cart */}
        <button
           onClick={() =>
    dispatch(
      addToCart({
        cartItemId: id,
        pizzaId: id,
        name,
        image: img,
        base,
        sauce,
        cheese,
        vegetable,
        price,
        quantity: 1,
      })
    )
  }
          className="mt-4 w-full rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#C1121F]"
        >
          Add to Cart
        </button>

        {/* View Details */}
        <button
          onClick={() => navigate(`/pizza/${id}`)}
          className="mt-4 w-full rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#C1121F]"
        >
          View Details
        </button>

      </div>
    </div>
  );
}