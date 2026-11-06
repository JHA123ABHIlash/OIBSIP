import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaIndianRupeeSign,
  FaTrash,
} from "react-icons/fa6";
import {
  increaseQuantity, decreaseQuantity, removeFromCart,
} from "../redux/slices/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.cart);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4">
        <h1 className="text-3xl font-bold text-[#1F1F1F]">
          Your Cart is Empty
        </h1>

        <p className="mt-3 text-gray-600">
          Add your favorite pizza to get started!
        </p>

        <button
          onClick={() => navigate("/menu")}
          className="mt-6 rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white hover:bg-[#C1121F]"
        >
          Explore Pizzas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
          Your Shopping Cart
        </h1>

        <p className="mt-2 text-gray-600">
          {totalItems} item(s) in your cart
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-5 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="rounded-2xl bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  {/* Pizza Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-44 w-full rounded-xl object-cover sm:w-44"
                  />

                  {/* Pizza Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-bold text-[#1F1F1F]">
                        {item.name}
                      </h2>

                      <button
                        onClick={() =>
                          dispatch(removeFromCart(item.cartItemId))
                        }
                        aria-label={`Remove ${item.name}`}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>Base: {item.base}</p>
                      <p>Sauce: {item.sauce}</p>
                      <p>Cheese: {item.cheese}</p>
                      <p>
                        Vegetables:{" "}
                        {Array.isArray(item.vegetable)
                          ? item.vegetable.join(", ")
                          : item.vegetable}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            dispatch(decreaseQuantity(item.cartItemId))
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span className="min-w-6 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            dispatch(increaseQuantity(item.cartItemId))
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center text-lg font-bold text-[#E63946]">
                        <FaIndianRupeeSign className="mr-1" />
                        {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#1F1F1F]">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between text-gray-600">
              <span>Total items</span>
              <span>{totalItems}</span>
            </div>

            <div className="mt-4 flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-5 border-t pt-5">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="flex items-center text-[#E63946]">
                  <FaIndianRupeeSign className="mr-1" />
                  {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/menu")}
              className="mt-6 w-full rounded-lg border border-[#E63946] px-4 py-3 font-semibold text-[#E63946] hover:bg-red-50"
            >
              Continue Shopping
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-3 w-full rounded-lg bg-[#E63946] px-4 py-3 font-semibold text-white hover:bg-[#C1121F]"
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

